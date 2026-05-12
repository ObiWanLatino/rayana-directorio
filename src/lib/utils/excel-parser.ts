import * as XLSX from "xlsx";
import {
  sanitizeCategoria,
  sanitizeInstagram,
  sanitizeOptionalText,
  sanitizeTienda,
  sanitizeWhatsapp,
} from "@/lib/utils/sanitize";

export type ExcelSupplierRow = {
  codigo: number;
  tienda: string;
  instagram: string | null;
  categoria: string | null;
  direccion: string | null;
  tipo: string;
  observacion: string | null;
  whatsapp: string | null;
  incompleteWarning: boolean;
};

export type ExcelParseFailure = {
  ok: false;
  error: string;
};

export type ExcelParseSuccess = {
  ok: true;
  rows: ExcelSupplierRow[];
  sheetName: string;
};

export type ExcelParseResult = ExcelParseFailure | ExcelParseSuccess;

const DEFAULT_TIPO_SIN_COLUMNA = "Proveedor";

/** Normalizado sin tildes ni espacios laterales → clave canónica de columna. */
const COLUMN_MAP: Record<string, keyof ColIndexShape> = {
  codigo: "codigo",
  código: "codigo",
  contacto: "tienda",
  tienda: "tienda",
  instagram: "instagram",
  categoria: "categoria",
  categoría: "categoria",
  direccion: "direccion",
  dirección: "direccion",
  tipo: "tipo",
  observacion: "observacion",
  observación: "observacion",
  whatsapp: "whatsapp",
  whatssapp: "whatsapp",
};

type ColIndexShape = {
  codigo?: number;
  tienda?: number;
  instagram?: number;
  categoria?: number;
  direccion?: number;
  tipo?: number;
  observacion?: number;
  whatsapp?: number;
};

const REQUIRED_CANONICAL: (keyof ColIndexShape)[] = [
  "codigo",
  "tienda",
  "tipo",
];

function normalizeHeaderLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function pickSheetName(sheetNames: string[]): string | null {
  if (!sheetNames.length) return null;
  const idx = sheetNames.findIndex(
    (n) => normalizeHeaderLabel(n) === "contactos",
  );
  if (idx >= 0) return sheetNames[idx];
  return sheetNames[0];
}

function parseCodigo(cell: unknown): number | null {
  if (cell == null || cell === "") return null;
  if (typeof cell === "number" && Number.isInteger(cell)) return cell;
  const n = Number(String(cell).trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

function cellValue(
  line: unknown[],
  index: number | undefined,
): string | number | null | undefined {
  if (index === undefined) return undefined;
  const v = line[index];
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === "string" || typeof v === "number") return v;
  return String(v);
}

function countIncompleteFields(row: {
  codigo: number;
  tienda: string;
  instagram: string | null;
  categoria: string | null;
  direccion: string | null;
  tipo: string;
  observacion: string | null;
  whatsapp: string | null;
}): number {
  const cells: unknown[] = [
    row.codigo,
    row.tienda,
    row.instagram,
    row.categoria,
    row.direccion,
    row.tipo,
    row.observacion,
    row.whatsapp,
  ];
  let empty = 0;
  for (const c of cells) {
    if (c == null || c === "") empty++;
  }
  return empty;
}

export function parseSupplierExcel(buffer: ArrayBuffer): ExcelParseResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { ok: false, error: "No se pudo leer el archivo." };
  }

  const sheetName = pickSheetName(workbook.SheetNames);
  if (!sheetName) {
    return { ok: false, error: "El archivo no tiene hojas." };
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null | undefined)[]>(
    sheet,
    { header: 1, defval: null, raw: true },
  ) as unknown[][];

  if (!matrix.length) {
    return { ok: false, error: "La hoja está vacía." };
  }

  const headerRow = matrix[0].map((cell) =>
    cell == null ? "" : String(cell),
  );

  const colIndex: ColIndexShape = {};

  for (let i = 0; i < headerRow.length; i++) {
    const normalized = normalizeHeaderLabel(headerRow[i] ?? "");
    if (!normalized) continue;
    const canonical = COLUMN_MAP[normalized];
    if (!canonical) continue;
    colIndex[canonical] = i;
  }

  const tipoColumnPresent = colIndex.tipo !== undefined;

  for (const key of REQUIRED_CANONICAL) {
    if (key === "tipo" && !tipoColumnPresent) {
      continue;
    }
    if (colIndex[key] === undefined) {
      return {
        ok: false,
        error: `Falta la columna obligatoria mapeada a "${key}" (ej. Código, Tienda o Tipo).`,
      };
    }
  }

  const rows: ExcelSupplierRow[] = [];

  for (let r = 1; r < matrix.length; r++) {
    const line = matrix[r];
    if (!line || line.every((c) => c == null || String(c).trim() === "")) {
      continue;
    }

    const rawCodigo = line[colIndex.codigo!];
    const codigo = parseCodigo(rawCodigo);
    const tienda = sanitizeTienda(cellValue(line, colIndex.tienda));
    const tipoRaw = tipoColumnPresent
      ? cellValue(line, colIndex.tipo)
      : DEFAULT_TIPO_SIN_COLUMNA;
    const tipo = tipoColumnPresent
      ? sanitizeTienda(tipoRaw)
      : DEFAULT_TIPO_SIN_COLUMNA;

    if (codigo == null || !tienda) {
      return {
        ok: false,
        error: `Fila ${r + 1}: "Código" y "Tienda" son obligatorios y deben ser válidos.`,
      };
    }

    if (tipoColumnPresent && !tipo) {
      return {
        ok: false,
        error: `Fila ${r + 1}: "Tipo" es obligatorio y no puede estar vacío.`,
      };
    }

    const instagram = sanitizeInstagram(cellValue(line, colIndex.instagram));
    const categoria = sanitizeCategoria(cellValue(line, colIndex.categoria));
    const direccion = sanitizeOptionalText(
      cellValue(line, colIndex.direccion),
    );
    const observacion = sanitizeOptionalText(
      cellValue(line, colIndex.observacion),
    );
    const whatsapp = sanitizeWhatsapp(cellValue(line, colIndex.whatsapp));

    const incompleteWarning = countIncompleteFields({
      codigo,
      tienda,
      instagram,
      categoria,
      direccion,
      tipo,
      observacion,
      whatsapp,
    }) >= 5;

    rows.push({
      codigo,
      tienda,
      instagram,
      categoria,
      direccion,
      tipo,
      observacion,
      whatsapp,
      incompleteWarning,
    });
  }

  const seen = new Set<number>();
  for (const row of rows) {
    if (seen.has(row.codigo)) {
      return {
        ok: false,
        error: `El código ${row.codigo} aparece más de una vez en el Excel.`,
      };
    }
    seen.add(row.codigo);
  }

  return { ok: true, rows, sheetName };
}
