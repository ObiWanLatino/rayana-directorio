export function sanitizeWhatsapp(
  raw: string | number | null | undefined,
): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number" && Number.isNaN(raw)) return null;
  const str = String(raw).trim();
  if (str === "" || str === "NaN" || str === "nan") return null;
  const digits = str.replace(/\D/g, "");
  if (digits.length === 0) return null;
  if (digits.startsWith("56") && digits.length === 11) return digits;
  if (digits.length === 9) return `56${digits}`;
  if (digits.length === 8) return `569${digits}`;
  return digits;
}

export function sanitizeInstagram(
  raw: string | number | null | undefined,
): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s) return null;
  let clean = s;
  clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  clean = clean.replace(/^@/, "");
  clean = clean.replace(/\/$/, "");
  return clean || null;
}

export function titleCaseWords(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function sanitizeCategoria(
  raw: string | number | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  const t = String(raw).trim();
  if (!t) return null;
  return titleCaseWords(t);
}

export function sanitizeOptionalText(
  raw: string | number | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  const t = String(raw).trim();
  return t || null;
}

export function sanitizeTienda(
  raw: string | number | null | undefined,
): string {
  return String(raw ?? "").trim();
}

/** Full http(s) URL for supplier social/map links; null if invalid or empty. */
export function sanitizeHttpUrl(
  raw: string | number | null | undefined,
): string | null {
  if (raw == null || raw === "") return null;
  const t = String(raw).trim();
  if (!t) return null;
  let url: URL;
  try {
    url = new URL(t);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.toString();
}
