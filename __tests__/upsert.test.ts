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
    cover_url: null,
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

const upsertMock = vi.fn().mockResolvedValue({ error: null });
const updateInMock = vi.fn().mockResolvedValue({ error: null });
const uploadInsert = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  upsertMock.mockResolvedValue({ error: null });
  updateInMock.mockResolvedValue({ error: null });
  uploadInsert.mockResolvedValue({ error: null });
});

function mockSuppliersTable(rows: Supplier[]) {
  const activePick = rows.filter((s) => s.activo).map((s) => ({
    id: s.id,
    codigo: s.codigo,
  }));
  return {
    select: vi.fn((cols?: string) => {
      if (cols && cols.includes("id") && cols.includes("codigo")) {
        return {
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: activePick,
              error: null,
            })),
          })),
        };
      }
      return {
        eq: vi.fn(() => ({
          data: rows,
          error: null,
        })),
      };
    }),
    upsert: upsertMock,
    update: vi.fn(() => ({
      in: updateInMock,
    })),
  };
}

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: () => ({
    from: (table: string) => {
      if (table === "suppliers") {
        return mockSuppliersTable(
          Array.from({ length: 76 }, (_, i) => dbSupplier(i + 1)),
        );
      }
      if (table === "upload_logs") {
        return {
          insert: uploadInsert,
        };
      }
      return {};
    },
  }),
}));

describe("applyExcelImport (upsert + soft delete por país)", () => {
  test("exige confirmación de bajo volumen", async () => {
    const rows = Array.from({ length: 30 }, (_, i) => excelRow(i + 1));
    await expect(
      applyExcelImport({
        rows,
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        pais_codigo: "56",
        excludeIncomplete: false,
        confirmBulkDeactivate: true,
        confirmLowVolume: false,
      }),
    ).rejects.toBeInstanceOf(LowVolumeConfirmationError);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("exige confirmación de desactivación masiva", async () => {
    const rows = Array.from({ length: 65 }, (_, i) => excelRow(i + 1));
    await expect(
      applyExcelImport({
        rows,
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        pais_codigo: "56",
        excludeIncomplete: false,
        confirmBulkDeactivate: false,
        confirmLowVolume: true,
      }),
    ).rejects.toBeInstanceOf(BulkDeactivateConfirmationError);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("con confirmaciones hace upsert con onConflict codigo,pais_codigo", async () => {
    const rows = Array.from({ length: 76 }, (_, i) => excelRow(i + 1));
    const out = await applyExcelImport({
      rows,
      adminEmail: "a@b.c",
      filename: "f.xlsx",
      pais_codigo: "56",
      excludeIncomplete: false,
      confirmBulkDeactivate: false,
      confirmLowVolume: false,
    });
    expect(upsertMock).toHaveBeenCalled();
    expect(upsertMock.mock.calls[0][1]).toEqual(
      expect.objectContaining({ onConflict: "codigo,pais_codigo" }),
    );
    expect(out.created + out.updated + out.deactivated).toBeGreaterThanOrEqual(
      0,
    );
  });

  test("70 filas con BD 76: desactiva 6 al confirmar todo", async () => {
    const rows = Array.from({ length: 70 }, (_, i) => excelRow(i + 1));
    const out = await applyExcelImport({
      rows,
      adminEmail: "a@b.c",
      filename: "f.xlsx",
      pais_codigo: "56",
      excludeIncomplete: false,
      confirmBulkDeactivate: false,
      confirmLowVolume: false,
    });
    expect(out.deactivated).toBe(6);
    const payload = upsertMock.mock.calls[0][0] as { codigo: number }[];
    expect(payload).toHaveLength(70);
  });

  test("0 filas rechaza antes de upsert", async () => {
    await expect(
      applyExcelImport({
        rows: [],
        adminEmail: "a@b.c",
        filename: "f.xlsx",
        pais_codigo: "56",
        excludeIncomplete: false,
        confirmBulkDeactivate: true,
        confirmLowVolume: true,
      }),
    ).rejects.toThrow(/no tiene filas/i);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  test("registra pais_codigo en upload_logs", async () => {
    const rows = Array.from({ length: 76 }, (_, i) => excelRow(i + 1));
    await applyExcelImport({
      rows,
      adminEmail: "admin@test.com",
      filename: "br.xlsx",
      pais_codigo: "55",
      excludeIncomplete: false,
      confirmBulkDeactivate: false,
      confirmLowVolume: false,
    });
    expect(uploadInsert).toHaveBeenCalledWith(
      expect.objectContaining({ pais_codigo: "55" }),
    );
  });
});
