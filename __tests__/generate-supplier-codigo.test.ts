import { generateSupplierCodigo } from "@/lib/admin/generate-supplier-codigo";
import { describe, expect, test } from "vitest";

function mockAdmin(maxCodigo: number | null, usedCodes = new Set<number>()) {
  return {
    from: (table: string) => {
      if (table !== "suppliers") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          order: () => ({
            limit: () => ({
              maybeSingle: () =>
                Promise.resolve({
                  data: maxCodigo != null ? { codigo: maxCodigo } : null,
                  error: null,
                }),
            }),
          }),
          eq: (col: string, val: unknown) => {
            if (col === "codigo") {
              return {
                maybeSingle: () =>
                  Promise.resolve({
                    data: usedCodes.has(val as number) ? { id: "x" } : null,
                    error: null,
                  }),
              };
            }
            throw new Error(`unexpected eq ${col}`);
          },
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

  test("salta código ya ocupado", async () => {
    const used = new Set([1023]);
    const admin = mockAdmin(1022, used);
    await expect(generateSupplierCodigo(admin as never)).resolves.toBe(1024);
  });
});
