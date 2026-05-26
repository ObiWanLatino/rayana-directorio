import { generateSupplierCodigo } from "@/lib/admin/generate-supplier-codigo";
import { describe, expect, test } from "vitest";

function mockAdmin(maxCodigo: number | null) {
  return {
    from: (table: string) => {
      if (table !== "suppliers") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          order: () => ({
            limit: () => ({
              single: () => {
                if (maxCodigo == null) {
                  return Promise.resolve({
                    data: null,
                    error: { code: "PGRST116", message: "No rows" },
                  });
                }
                return Promise.resolve({
                  data: { codigo: maxCodigo },
                  error: null,
                });
              },
            }),
          }),
        }),
      };
    },
  };
}

describe("generateSupplierCodigo", () => {
  test("sin proveedores → 1", async () => {
    const admin = mockAdmin(null);
    await expect(generateSupplierCodigo(admin as never)).resolves.toBe(1);
  });

  test("último global 1022 → 1023", async () => {
    const admin = mockAdmin(1022);
    await expect(generateSupplierCodigo(admin as never)).resolves.toBe(1023);
  });
});
