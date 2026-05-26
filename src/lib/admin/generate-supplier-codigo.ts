import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateSupplierCodigo(
  supabase: SupabaseClient,
): Promise<number> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("codigo")
    .order("codigo", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Error generando código: ${error.message}`);
  }

  return (data?.codigo ?? 0) + 1;
}
