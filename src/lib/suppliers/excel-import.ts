import type { Supplier } from "@/types";
import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";

export type ImportPreview = {
  newCount: number;
  updatedCount: number;
  deactivatedCount: number;
  unchangedCount: number;
  newCodes: number[];
  updatedCodes: number[];
  deactivatedCodes: number[];
  unchangedCodes: number[];
  incompleteCodes: number[];
  needsBulkDeactivateConfirm: boolean;
};

export function supplierDataMatchesDb(
  excel: ExcelSupplierRow,
  db: Pick<
    Supplier,
    | "tienda"
    | "instagram"
    | "categoria"
    | "direccion"
    | "tipo"
    | "observacion"
    | "whatsapp"
  >,
): boolean {
  return (
    excel.tienda === db.tienda &&
    excel.instagram === db.instagram &&
    excel.categoria === db.categoria &&
    excel.direccion === db.direccion &&
    excel.tipo === db.tipo &&
    excel.observacion === db.observacion &&
    excel.whatsapp === db.whatsapp
  );
}

export function computeImportPreview(
  rows: ExcelSupplierRow[],
  dbSuppliers: Supplier[],
): ImportPreview {
  const byCodigo = new Map<number, Supplier>();
  for (const s of dbSuppliers) {
    byCodigo.set(s.codigo, s);
  }

  const excelCodes = new Set(rows.map((r) => r.codigo));
  const newCodes: number[] = [];
  const updatedCodes: number[] = [];
  const unchangedCodes: number[] = [];

  for (const row of rows) {
    const existing = byCodigo.get(row.codigo);
    if (!existing) {
      newCodes.push(row.codigo);
      continue;
    }
    if (!existing.activo || !supplierDataMatchesDb(row, existing)) {
      updatedCodes.push(row.codigo);
      continue;
    }
    unchangedCodes.push(row.codigo);
  }

  const deactivatedCodes: number[] = [];
  for (const s of dbSuppliers) {
    if (s.activo && !excelCodes.has(s.codigo)) {
      deactivatedCodes.push(s.codigo);
    }
  }

  const incompleteCodes = rows
    .filter((r) => r.incompleteWarning)
    .map((r) => r.codigo);

  return {
    newCount: newCodes.length,
    updatedCount: updatedCodes.length,
    deactivatedCount: deactivatedCodes.length,
    unchangedCount: unchangedCodes.length,
    newCodes,
    updatedCodes,
    deactivatedCodes,
    unchangedCodes,
    incompleteCodes,
    needsBulkDeactivateConfirm: deactivatedCodes.length > 10,
  };
}

export function filterRowsForApply(
  rows: ExcelSupplierRow[],
  excludeIncomplete: boolean,
): ExcelSupplierRow[] {
  if (!excludeIncomplete) {
    return rows;
  }
  return rows.filter((r) => !r.incompleteWarning);
}
