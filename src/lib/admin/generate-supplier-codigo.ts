import type { SupabaseClient } from "@supabase/supabase-js";

/** Siguiente `codigo` global (INTEGER UNIQUE en toda la tabla). */
export async function generateSupplierCodigo(
  admin: SupabaseClient,
): Promise<number> {
  const { data, error } = await admin
    .from("suppliers")
    .select("codigo")
    .order("codigo", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const last = data?.codigo;
  let candidate =
    last != null && Number.isFinite(last) ? last + 1 : 1;

  for (let attempt = 0; attempt < 100; attempt++) {
    const { data: dup } = await admin
      .from("suppliers")
      .select("id")
      .eq("codigo", candidate)
      .maybeSingle();

    if (!dup) {
      return candidate;
    }
    candidate += 1;
  }

  throw new Error("No se pudo generar un código único");
}
