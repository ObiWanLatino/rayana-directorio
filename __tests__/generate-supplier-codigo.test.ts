import { describe, expect, test } from "vitest";

function mockAdmin(sequence: Array<{ codigo: number | null }>) {
  let selectCalls = 0;
  const usedCodes = new Set<number>();

  return {
    from: (table: string) => {
      if (table !== "suppliers") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          eq: (col: string, val: unknown) => {
            if (col === "pais_codigo") {
              return {
                order: () => ({
                  limit: () => {
                    const row = sequence[selectCalls] ?? null;
                    selectCalls += 1;
                    return Promise.resolve({ data: row ? [row] : [], error: null });
                  },
                }),
              };
            }
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
    _markUsed(code: number) {
      usedCodes.add(code);
    },
  };
}

describe("generateSupplierCodigo", () => {
  test("Chile sin proveedores → 1", async () => {
    const admin = mockAdmin([]);
    await expect(generateSupplierCodigo(admin as never, "56")).resolves.toBe(1);
  });

  test("Chile con último 47 → 48", async () => {
    const admin = mockAdmin([{ codigo: 47 }]);
    await expect(generateSupplierCodigo(admin as never, "56")).resolves.toBe(48);
  });

  test("Brasil sin proveedores → 10001", async () => {
    const admin = mockAdmin([]);
    await expect(generateSupplierCodigo(admin as never, "55")).resolves.toBe(10001);
  });

  test("Brasil con último 10005 → 10006", async () => {
    const admin = mockAdmin([{ codigo: 10005 }]);
    await expect(generateSupplierCodigo(admin as never, "55")).resolves.toBe(10006);
  });
});
