import type { SupabaseClient } from "@supabase/supabase-js";

/** Brasil arranca en 10000 para no chocar con la secuencia chilena (1, 2, …). */
const BR_FLOOR = 10000;

export async function generateSupplierCodigo(
  admin: SupabaseClient,
  paisCodigo: string,
): Promise<number> {
  const floor = paisCodigo === "55" ? BR_FLOOR : 1;

  const { data, error } = await admin
    .from("suppliers")
    .select("codigo")
    .eq("pais_codigo", paisCodigo)
    .order("codigo", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  let candidate =
    data?.[0]?.codigo != null && Number.isFinite(data[0].codigo)
      ? data[0].codigo + 1
      : floor;

  if (paisCodigo === "55") {
    candidate = Math.max(candidate, BR_FLOOR + 1);
  }

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
