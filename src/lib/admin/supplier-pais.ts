/** URL slug (?pais=) for admin supplier directory */
export type PaisSlug = "cl" | "br";

const SLUG_TO_CODIGO: Record<PaisSlug, string> = {
  cl: "56",
  br: "55",
};

const CODIGO_TO_SLUG = new Map<string, PaisSlug>([
  ["56", "cl"],
  ["55", "br"],
]);

export function parsePaisSlug(raw: string | undefined): PaisSlug {
  const s = raw?.trim().toLowerCase();
  if (s === "br") return "br";
  return "cl";
}

export function paisSlugToCodigo(slug: PaisSlug): string {
  return SLUG_TO_CODIGO[slug];
}

export function paisCodigoToSlug(codigo: string | undefined | null): PaisSlug {
  const c = codigo?.trim() ?? "56";
  return CODIGO_TO_SLUG.get(c) ?? "cl";
}

export function paisDirectoryLabel(slug: PaisSlug): string {
  return slug === "br" ? "🇧🇷 Brasil" : "🇨🇱 Chile";
}
