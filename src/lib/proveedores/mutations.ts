import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupplierPlan } from "@/types/proveedores";

export async function insertSupplierProfileBasico(input: {
  supabase: SupabaseClient;
  userId: string;
  supplierId: string;
  whatsapp_negocio: string | null;
  website_url: string | null;
  bio: string | null;
  cover_url: string | null;
  ships_internationally: boolean;
  shipping_agent_info: string | null;
}): Promise<{ data: { id: string } | null; error: Error | null }> {
  const {
    supabase,
    userId,
    supplierId,
    whatsapp_negocio,
    website_url,
    bio,
    cover_url,
    ships_internationally,
    shipping_agent_info,
  } = input;

  const { data, error } = await supabase
    .from("supplier_profiles")
    .insert({
      supplier_id: supplierId,
      user_id: userId,
      whatsapp_negocio,
      website_url,
      bio,
      cover_url,
      ships_internationally,
      shipping_agent_info,
      plan: "basico" satisfies SupplierPlan,
      onboarding_completed: true,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as { id: string }, error: null };
}

export async function insertSupplierProfilePendingPaidPlan(input: {
  supabase: SupabaseClient;
  userId: string;
  supplierId: string;
  whatsapp_negocio: string | null;
  website_url: string | null;
  bio: string | null;
  cover_url: string | null;
  ships_internationally: boolean;
  shipping_agent_info: string | null;
}): Promise<{ data: { id: string } | null; error: Error | null }> {
  const { data, error } = await input.supabase
    .from("supplier_profiles")
    .insert({
      supplier_id: input.supplierId,
      user_id: input.userId,
      whatsapp_negocio: input.whatsapp_negocio,
      website_url: input.website_url,
      bio: input.bio,
      cover_url: input.cover_url,
      ships_internationally: input.ships_internationally,
      shipping_agent_info: input.shipping_agent_info,
      plan: "basico",
      onboarding_completed: true,
    })
    .select("id")
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }
  return { data: data as { id: string }, error: null };
}

export async function updateSupplierProfile(
  supabase: SupabaseClient,
  profileId: string,
  patch: Record<string, unknown>,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("supplier_profiles")
    .update(patch)
    .eq("id", profileId);

  if (error) return { error: new Error(error.message) };
  return { error: null };
}

export async function insertSupplierProduct(input: {
  supabase: SupabaseClient;
  supplierId: string;
  nombre: string;
  descripcion: string | null;
  precio_clp: number | null;
  precio_mayorista: number | null;
  minimo_unidades: number;
  foto_url: string | null;
  categoria: string | null;
}): Promise<{ data: { id: string } | null; error: Error | null }> {
  const { data, error } = await input.supabase
    .from("supplier_products")
    .insert({
      supplier_id: input.supplierId,
      nombre: input.nombre,
      descripcion: input.descripcion,
      precio_clp: input.precio_clp,
      precio_mayorista: input.precio_mayorista,
      minimo_unidades: input.minimo_unidades,
      foto_url: input.foto_url,
      categoria: input.categoria,
    })
    .select("id")
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as { id: string }, error: null };
}

export async function insertSupplierOffer(input: {
  supabase: SupabaseClient;
  supplierId: string;
  titulo: string;
  descripcion: string | null;
  descuento_pct: number | null;
  foto_url: string | null;
  expires_at: string;
}): Promise<{ data: { id: string } | null; error: Error | null }> {
  const { data, error } = await input.supabase
    .from("supplier_offers")
    .insert({
      supplier_id: input.supplierId,
      titulo: input.titulo,
      descripcion: input.descripcion,
      descuento_pct: input.descuento_pct,
      foto_url: input.foto_url,
      expires_at: input.expires_at,
    })
    .select("id")
    .single();

  if (error) return { data: null, error: new Error(error.message) };
  return { data: data as { id: string }, error: null };
}

export async function upsertSupplierReview(input: {
  supabase: SupabaseClient;
  supplierId: string;
  userId: string;
  rating: number;
  comentario: string | null;
  verified: boolean;
}): Promise<{ error: Error | null }> {
  const { error } = await input.supabase.from("supplier_reviews").upsert(
    {
      supplier_id: input.supplierId,
      user_id: input.userId,
      rating: input.rating,
      comentario: input.comentario,
      verified: input.verified,
    },
    { onConflict: "supplier_id,user_id" },
  );

  if (error) return { error: new Error(error.message) };
  return { error: null };
}
