import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";

export function needsLowVolumeConfirmation(
  excelRowCount: number,
  databaseActiveCount: number,
): boolean {
  if (databaseActiveCount <= 0) return false;
  return excelRowCount < databaseActiveCount * 0.5;
}

/** Validación previa a tocar la BD (post-parse, post-filtro incompletos). */
export function validateImportableRows(rows: ExcelSupplierRow[]): {
  ok: true;
} | { ok: false; error: string } {
  if (rows.length === 0) {
    return {
      ok: false,
      error:
        "El archivo no tiene filas de datos válidas. La base de datos no se modificó.",
    };
  }

  const seen = new Set<number>();
  for (const r of rows) {
    if (seen.has(r.codigo)) {
      return {
        ok: false,
        error: `Código duplicado en el archivo: ${r.codigo}.`,
      };
    }
    seen.add(r.codigo);
    if (!r.tienda.trim()) {
      return {
        ok: false,
        error: `Fila código ${r.codigo}: "Tienda" no puede estar vacío.`,
      };
    }
    if (!r.tipo.trim()) {
      return {
        ok: false,
        error: `Fila código ${r.codigo}: "Tipo" no puede estar vacío.`,
      };
    }
  }

  return { ok: true };
}
