import { describe, expect, test } from "vitest";
import {
  needsLowVolumeConfirmation,
  validateImportableRows,
} from "@/lib/suppliers/import-validation";
import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";

function row(p: Partial<ExcelSupplierRow> & Pick<ExcelSupplierRow, "codigo">): ExcelSupplierRow {
  return {
    tienda: "T",
    instagram: null,
    categoria: null,
    direccion: null,
    tipo: "Tipo",
    observacion: null,
    whatsapp: null,
    incompleteWarning: false,
    ...p,
  };
}

describe("validateImportableRows", () => {
  test("rechaza 0 filas", () => {
    const v = validateImportableRows([]);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.error).toMatch(/no tiene filas/i);
  });

  test("rechaza códigos duplicados", () => {
    const v = validateImportableRows([
      row({ codigo: 1, tienda: "A" }),
      row({ codigo: 1, tienda: "B" }),
    ]);
    expect(v.ok).toBe(false);
    if (v.ok) return;
    expect(v.error).toMatch(/duplicado/i);
  });

  test("rechaza tienda vacía", () => {
    const v = validateImportableRows([row({ codigo: 1, tienda: "  " })]);
    expect(v.ok).toBe(false);
  });

  test("rechaza tipo vacío", () => {
    const v = validateImportableRows([row({ codigo: 1, tipo: "" })]);
    expect(v.ok).toBe(false);
  });
});

describe("needsLowVolumeConfirmation", () => {
  test("no advierte si BD sin activos", () => {
    expect(needsLowVolumeConfirmation(1, 0)).toBe(false);
  });

  test("advierte si Excel < 50% activos en BD", () => {
    expect(needsLowVolumeConfirmation(30, 76)).toBe(true);
  });

  test("no advierte si Excel >= 50% activos", () => {
    expect(needsLowVolumeConfirmation(38, 76)).toBe(false);
  });
});
