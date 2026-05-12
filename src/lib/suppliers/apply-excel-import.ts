import {
  computeImportPreview,
  filterRowsForApply,
} from "@/lib/suppliers/excel-import";
import {
  needsLowVolumeConfirmation,
  validateImportableRows,
} from "@/lib/suppliers/import-validation";
import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";

const UPSERT_CHUNK = 200;
const DEACTIVATE_CHUNK = 200;

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

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

type SupplierImportUpsert = {
  codigo: number;
  tienda: string;
  instagram: string | null;
  categoria: string | null;
  direccion: string | null;
  tipo: string;
  observacion: string | null;
  whatsapp: string | null;
  activo: boolean;
  pais_codigo: string;
  updated_at: string;
};

function buildUpsertRows(
  rows: ExcelSupplierRow[],
  pais_codigo: string,
  updated_at: string,
): SupplierImportUpsert[] {
  return rows.map((r) => ({
    codigo: r.codigo,
    tienda: r.tienda,
    instagram: r.instagram,
    categoria: r.categoria,
    direccion: r.direccion,
    tipo: r.tipo,
    observacion: r.observacion,
    whatsapp: r.whatsapp,
    activo: true,
    pais_codigo,
    updated_at,
  }));
}

export async function applyExcelImport(params: {
  rows: ExcelSupplierRow[];
  adminEmail: string;
  filename: string;
  pais_codigo: string;
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
    pais_codigo,
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
    .select("*")
    .eq("pais_codigo", pais_codigo);

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

  const preview = computeImportPreview(rows, dbSuppliers, pais_codigo);

  if (preview.needsBulkDeactivateConfirm && !confirmBulkDeactivate) {
    throw new BulkDeactivateConfirmationError();
  }

  const updatedAt = new Date().toISOString();
  const upsertPayload = buildUpsertRows(rows, pais_codigo, updatedAt);

  for (const part of chunk(upsertPayload, UPSERT_CHUNK)) {
    const { error: upErr } = await admin.from("suppliers").upsert(part, {
      onConflict: "codigo,pais_codigo",
    });
    if (upErr) {
      throw new Error(upErr.message);
    }
  }

  const excelCodes = new Set(rows.map((r) => r.codigo));
  const { data: activeRows, error: activeErr } = await admin
    .from("suppliers")
    .select("id, codigo")
    .eq("pais_codigo", pais_codigo)
    .eq("activo", true);

  if (activeErr) {
    throw new Error(activeErr.message);
  }

  const idsToDeactivate = (activeRows ?? [])
    .filter((row) => !excelCodes.has(row.codigo))
    .map((row) => row.id);

  for (const idPart of chunk(idsToDeactivate, DEACTIVATE_CHUNK)) {
    if (idPart.length === 0) continue;
    const { error: deactErr } = await admin
      .from("suppliers")
      .update({ activo: false, updated_at: updatedAt })
      .in("id", idPart);
    if (deactErr) {
      throw new Error(deactErr.message);
    }
  }

  const { error: logErr } = await admin.from("upload_logs").insert({
    admin_email: adminEmail,
    filename,
    total_rows: allRows.length,
    created: preview.newCount,
    updated: preview.updatedCount,
    deactivated: preview.deactivatedCount,
    skipped_warnings,
    pais_codigo,
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
