import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  applyExcelImport,
  BulkDeactivateConfirmationError,
  LowVolumeConfirmationError,
} from "@/lib/suppliers/apply-excel-import";
import type { ExcelSupplierRow } from "@/lib/utils/excel-parser";
import type { Supplier } from "@/types";

function excelRow(
  codigo: number,
  overrides: Partial<ExcelSupplierRow> = {},
): ExcelSupplierRow {
  return {
    codigo,
    tienda: `Tienda ${codigo}`,
    instagram: null,
    categoria: null,
    direccion: null,
    tipo: "T",
    observacion: null,
    whatsapp: null,
    incompleteWarning: false,
    ...overrides,
  };
}

function dbSupplier(codigo: number, activo = true): Supplier {
  return {
    id: `id-${codigo}`,
    codigo,
    tienda: `Tienda ${codigo}`,
    instagram: null,
    instagram_url: null,
    tiktok_url: null,
    maps_url: null,
    categoria: null,
    direccion: null,
    tipo: "T",
    observacion: null,
    whatsapp: null,
    logo_url: null,
    destacado: false,
    verificado: true,
    foto_1_url: null,
    foto_2_url: null,
    foto_3_url: null,
    activo,
    pais_codigo: "56",
    created_at: "",
    updated_at: "",
  };
}

const rpc = vi.fn();
const uploadInsert = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  rpc.mockResolvedValue({ error: null });
  uploadInsert.mockResolvedValue({ error: null });
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: () => ({
    from: (table: string) => {
      if (table === "suppliers") {
        return {
          select: () => ({
            data: Array.from({ length: 76 }, (_, i) => dbSupplier(i + 1)),
            error: null,
          }),
        };
      }
      if (table === "upload_logs") {
        return {
          insert: uploadInsert,
        };
      }
      return {};
    },
    rpc,
  }),
}));

describe("applyExcelImport (upsert + soft delete)", () => {
  test("exige confirmación de bajo volumen", async () => {
    const rows = Array.from({ length: 30 }, (_, i) => excelRow(i + 1));
    await expect(
      applyExcelImport({
        rows,
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        excludeIncomplete: false,
        confirmBulkDeactivate: true,
        confirmLowVolume: false,
      }),
    ).rejects.toBeInstanceOf(LowVolumeConfirmationError);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("exige confirmación de desactivación masiva", async () => {
    const rows = Array.from({ length: 65 }, (_, i) => excelRow(i + 1));
    await expect(
      applyExcelImport({
        rows,
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        excludeIncomplete: false,
        confirmBulkDeactivate: false,
        confirmLowVolume: true,
      }),
    ).rejects.toBeInstanceOf(BulkDeactivateConfirmationError);
    expect(rpc).not.toHaveBeenCalled();
  });

  test("con confirmaciones llama merge_suppliers_from_excel", async () => {
    const rows = Array.from({ length: 76 }, (_, i) => excelRow(i + 1));
    const out = await applyExcelImport({
      rows,
      adminEmail: "a@b.c",
      filename: "f.xlsx",
      excludeIncomplete: false,
      confirmBulkDeactivate: false,
      confirmLowVolume: false,
    });
    expect(rpc).toHaveBeenCalledWith("merge_suppliers_from_excel", {
      p_rows: expect.any(Array),
    });
    expect(out.created + out.updated + out.deactivated).toBeGreaterThanOrEqual(0);
  });

  test("70 filas con BD 76: desactiva 6 al confirmar todo", async () => {
    const rows = Array.from({ length: 70 }, (_, i) => excelRow(i + 1));
    const out = await applyExcelImport({
      rows,
      adminEmail: "a@b.c",
      filename: "f.xlsx",
      excludeIncomplete: false,
      confirmBulkDeactivate: false,
      confirmLowVolume: false,
    });
    expect(out.deactivated).toBe(6);
    const payload = rpc.mock.calls[0][1].p_rows as { codigo: number }[];
    expect(payload).toHaveLength(70);
  });

  test("0 filas rechaza antes de RPC", async () => {
    await expect(
      applyExcelImport({
        rows: [],
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        excludeIncomplete: false,
        confirmBulkDeactivate: true,
        confirmLowVolume: true,
      }),
    ).rejects.toThrow(/no tiene filas/i);
    expect(rpc).not.toHaveBeenCalled();
  });
});
