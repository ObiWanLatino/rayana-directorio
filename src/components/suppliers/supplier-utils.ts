import type { Supplier } from "@/types";

const UNCATEGORIZED = "__sin_categoria__";

export { UNCATEGORIZED };

const CATEGORY_EMOJI: Record<string, string> = {
  "Moda Femenina": "👗",
  Joyas: "💍",
  "Deco Hogar": "🏠",
  Jeans: "👖",
  Cosméticos: "💄",
  Accesorios: "👜",
  Infantil: "👶",
  Importadoras: "🏭",
};

/** Emoji for directory sidebar / marketing grids keyed by DB category label. */
export function categorySidebarEmoji(categoryKey: string): string {
  if (categoryKey === UNCATEGORIZED) return "📁";
  return CATEGORY_EMOJI[categoryKey] ?? "📦";
}

export function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = s.charCodeAt(i) + ((h << 5) - h);
  }
  return Math.abs(h) % 360;
}

export function supplierInitial(tienda: string): string {
  const t = tienda.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

export function buildCategoryOptions(suppliers: Supplier[]): string[] {
  const set = new Set<string>();
  for (const s of suppliers) {
    if (s.categoria?.trim()) {
      set.add(s.categoria.trim());
    } else {
      set.add(UNCATEGORIZED);
    }
  }
  return [...set].sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b, "es");
  });
}

export function categoryPillLabel(key: string): string {
  return key === UNCATEGORIZED ? "Sin categoría" : key;
}

export function matchesCategoryFilter(
  s: Supplier,
  selected: string | null,
): boolean {
  if (selected == null) return true;
  const cat = s.categoria?.trim();
  if (selected === UNCATEGORIZED) {
    return !cat;
  }
  return cat === selected;
}

export function matchesSearch(s: Supplier, q: string): boolean {
  if (!q) return true;
  const query = q.toLowerCase().trim();
  const qNum = query.replace("#", "");
  return (
    s.tienda.toLowerCase().includes(query) ||
    (s.categoria?.toLowerCase().includes(query) ?? false) ||
    (s.tipo?.toLowerCase().includes(query) ?? false) ||
    (s.direccion?.toLowerCase().includes(query) ?? false) ||
    (s.observacion?.toLowerCase().includes(query) ?? false) ||
    String(s.codigo) === qNum ||
    (qNum.length > 0 && String(s.codigo).includes(qNum))
  );
}
