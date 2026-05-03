import {
  computeImportPreview,
  filterRowsForApply,
} from "@/lib/suppliers/excel-import";
import {
  needsLowVolumeConfirmation,
  rowsToRpcPayload,
  validateImportableRows,
} from "@/lib/suppliers/import-validation";
import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";

export class BulkDeactivateConfirmationError extends Error {
  constructor() {
    super("BULK_DEACTIVATE_CONFIRM_REQUIRED");
    this.name = "BulkDeactivateConfirmationError";
  }
}

export class LowVolumeConfirmationError extends Error {
  constructor() {
    super("LOW_VOLUME_CONFIRM_REQUIRED");
    this.name = "LowVolumeConfirmationError";
  }
}

export async function applyExcelImport(params: {
  rows: ExcelSupplierRow[];
  adminEmail: string;
  filename: string;
  excludeIncomplete: boolean;
  confirmBulkDeactivate: boolean;
  confirmLowVolume: boolean;
}): Promise<{
  created: number;
  updated: number;
  deactivated: number;
  skipped_warnings: number;
}> {
  const {
    rows: allRows,
    adminEmail,
    filename,
    excludeIncomplete,
    confirmBulkDeactivate,
    confirmLowVolume,
  } = params;

  const skipped_warnings = excludeIncomplete
    ? allRows.filter((r) => r.incompleteWarning).length
    : 0;

  const rows = filterRowsForApply(allRows, excludeIncomplete);

  const validation = validateImportableRows(rows);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const admin = createAdminSupabaseClient();
  const { data: dbRows, error: loadErr } = await admin
    .from("suppliers")
    .select("*");

  if (loadErr) {
    throw new Error(loadErr.message);
  }

  const dbSuppliers = (dbRows ?? []) as Supplier[];
  const activeDbCount = dbSuppliers.filter((s) => s.activo).length;

  if (
    needsLowVolumeConfirmation(rows.length, activeDbCount) &&
    !confirmLowVolume
  ) {
    throw new LowVolumeConfirmationError();
  }

  const preview = computeImportPreview(rows, dbSuppliers);

  if (preview.needsBulkDeactivateConfirm && !confirmBulkDeactivate) {
    throw new BulkDeactivateConfirmationError();
  }

  const payload = rowsToRpcPayload(rows);
  const { error: rpcErr } = await admin.rpc("merge_suppliers_from_excel", {
    p_rows: payload,
  });

  if (rpcErr) {
    throw new Error(rpcErr.message);
  }

  const { error: logErr } = await admin.from("upload_logs").insert({
    admin_email: adminEmail,
    filename,
    total_rows: allRows.length,
    created: preview.newCount,
    updated: preview.updatedCount,
    deactivated: preview.deactivatedCount,
    skipped_warnings,
  });

  if (logErr) {
    console.error("upload_logs insert:", logErr.message);
  }

  return {
    created: preview.newCount,
    updated: preview.updatedCount,
    deactivated: preview.deactivatedCount,
    skipped_warnings,
  };
}
