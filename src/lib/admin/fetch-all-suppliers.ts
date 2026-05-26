import type { SupabaseClient } from "@supabase/supabase-js";
import type { Supplier } from "@/types";

const PAGE_SIZE = 1000;

/** PostgREST devuelve máx. 1000 filas por request — paginar hasta traer todo. */
export async function fetchAllSuppliers(
  admin: SupabaseClient,
  paisCodigo: string,
): Promise<Supplier[]> {
  const all: Supplier[] = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await admin
      .from("suppliers")
      .select("*")
      .eq("pais_codigo", paisCodigo)
      .order("codigo", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const batch = (data ?? []) as Supplier[];
    all.push(...batch);
    if (batch.length < PAGE_SIZE) {
      break;
    }
    from += PAGE_SIZE;
  }

  return all;
}
