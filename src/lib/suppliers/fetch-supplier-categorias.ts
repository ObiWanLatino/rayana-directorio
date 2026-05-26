import type { SupabaseClient } from "@supabase/supabase-js";

const PAGE_SIZE = 1000;

export type SupplierCategoriaRow = {
  key: string;
  label: string;
  count: number;
};

/** Agrega categorías activas (excluye destacados) paginando solo la columna categoria. */
export async function fetchSupplierCategorias(
  supabase: SupabaseClient,
  paisCodigo: string,
): Promise<{ total: number; rows: SupplierCategoriaRow[] }> {
  const counts = new Map<string, number>();
  let total = 0;
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from("suppliers")
      .select("categoria")
      .eq("activo", true)
      .eq("destacado", false)
      .eq("pais_codigo", paisCodigo)
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const batch = data ?? [];
    for (const row of batch) {
      total += 1;
      const key = row.categoria?.trim() || "__sin_categoria__";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    if (batch.length < PAGE_SIZE) {
      break;
    }
    from += PAGE_SIZE;
  }

  const rows = [...counts.entries()]
    .sort(([a], [b]) => {
      if (a === "__sin_categoria__") return 1;
      if (b === "__sin_categoria__") return -1;
      return a.localeCompare(b, "es");
    })
    .map(([key, count]) => ({
      key,
      label: key === "__sin_categoria__" ? "Sin categoría" : key,
      count,
    }));

  return { total, rows };
}
