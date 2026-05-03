import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";
import { describe, expect, test } from "vitest";
import { parseSupplierExcel } from "@/lib/utils/excel-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REAL_FIXTURE = join(
  __dirname,
  "fixtures",
  "fornecedores_atualizado.xlsx",
);

function buildXlsxFromRows(
  headers: string[],
  dataRows: (string | number | null)[][],
): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  const aoa = [headers, ...dataRows];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Proveedores");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("parseSupplierExcel", () => {
  test("fixture real fornecedores_atualizado.xlsx: 76 filas, código 1, tildes/encoding", () => {
    const nodeBuf = readFileSync(REAL_FIXTURE);
    const buf = nodeBuf.buffer.slice(
      nodeBuf.byteOffset,
      nodeBuf.byteOffset + nodeBuf.byteLength,
    );
    const r = parseSupplierExcel(buf);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows).toHaveLength(76);
    const first = r.rows.find((row) => row.codigo === 1);
    expect(first).toBeDefined();
    expect(first!.tienda).toBe("B3 Bani");
    expect(first!.instagram).toBe("b_tres383");
    expect(first!.whatsapp).toBeNull();
  });

  test("mapea Código (tilde) y Whatsapp; instagram sin @", () => {
    const buf = buildXlsxFromRows(
      [
        "Código",
        "Tienda",
        "Instagram",
        "Categoría",
        "Dirección",
        "Tipo",
        "Observación",
        "Whatsapp",
      ],
      [
        [
          1,
          "B3 Bani",
          "@b_tres383",
          "Test",
          "Calle 1",
          "Mayorista",
          "",
          "",
        ],
      ],
    );
    const r = parseSupplierExcel(buf);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows).toHaveLength(1);
    expect(r.rows[0].codigo).toBe(1);
    expect(r.rows[0].tienda).toBe("B3 Bani");
    expect(r.rows[0].instagram).toBe("b_tres383");
  });

  test("mapea typo whatssapp", () => {
    const buf = buildXlsxFromRows(
      ["codigo", "tienda", "tipo", "whatssapp"],
      [[2, "X", "Retail", ""]],
    );
    const r = parseSupplierExcel(buf);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows[0].whatsapp).toBeNull();
  });

  test("parsea 76 filas de datos", () => {
    const headers = [
      "Código",
      "Tienda",
      "Instagram",
      "Categoría",
      "Dirección",
      "Tipo",
      "Observación",
      "Whatsapp",
    ];
    const dataRows: (string | number | null)[][] = [];
    for (let c = 1; c <= 76; c++) {
      dataRows.push([
        c,
        `Tienda ${c}`,
        c % 5 === 0 ? null : `@user${c}`,
        "Cat",
        null,
        "Tipo",
        "",
        "",
      ]);
    }
    const buf = buildXlsxFromRows(headers, dataRows);
    const r = parseSupplierExcel(buf);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.rows).toHaveLength(76);
    expect(r.rows[75].codigo).toBe(76);
  });
});
