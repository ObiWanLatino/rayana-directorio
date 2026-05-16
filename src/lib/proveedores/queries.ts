import type { SupabaseClient } from "@supabase/supabase-js";
import type { Supplier } from "@/types";
import type {
  SupplierAnalytics30d,
  SupplierOffer,
  SupplierProduct,
  SupplierProfile,
  SupplierReview,
  SupplierReviewStats,
} from "@/types/proveedores";

export type MySupplierProfileRow = SupplierProfile & {
  suppliers: Pick<
    Supplier,
    | "id"
    | "codigo"
    | "tienda"
    | "categoria"
    | "whatsapp"
    | "logo_url"
    | "foto_1_url"
    | "foto_2_url"
    | "foto_3_url"
    | "pais_codigo"
    | "verificado"
    | "destacado"
  > | null;
};

export async function getMySupplierProfile(
  supabase: SupabaseClient,
): Promise<MySupplierProfileRow | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("supplier_profiles")
    .select(
      `
      *,
      suppliers (
        id, codigo, tienda, categoria, whatsapp,
        logo_url, foto_1_url, foto_2_url, foto_3_url,
        pais_codigo, verificado, destacado
      )
    `,
    )
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as MySupplierProfileRow;
}

export async function getPublicSupplierProfile(
  supabase: SupabaseClient,
  codigo: number,
): Promise<unknown | null> {
  const { data, error } = await supabase
    .from("suppliers")
    .select(
      `
      *,
      supplier_profiles (
        bio, cover_url, ships_nationally, ships_internationally,
        shipping_agent_info, plan, badge, website_url, user_id,
        whatsapp_negocio,
        supplier_products (id, nombre, descripcion, precio_clp, precio_mayorista, minimo_unidades, foto_url, activo, categoria),
        supplier_offers (id, titulo, descripcion, descuento_pct, foto_url, expires_at, activo, starts_at)
      )
    `,
    )
    .eq("codigo", codigo)
    .eq("activo", true)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function getSupplierAnalytics30d(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<SupplierAnalytics30d | null> {
  const { data, error } = await supabase
    .from("supplier_analytics_30d")
    .select("*")
    .eq("supplier_id", supplierId)
    .maybeSingle();

  if (error || !data) return null;
  return data as SupplierAnalytics30d;
}

export async function getSupplierReviewStats(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<SupplierReviewStats | null> {
  const { data, error } = await supabase
    .from("supplier_review_stats")
    .select("*")
    .eq("supplier_id", supplierId)
    .maybeSingle();

  if (error || !data) return null;
  return data as SupplierReviewStats;
}

export async function getActiveOffers(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<SupplierOffer[]> {
  const { data, error } = await supabase
    .from("supplier_offers")
    .select("*")
    .eq("supplier_id", supplierId)
    .eq("activo", true)
    .gte("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true });

  if (error) return [];
  return (data ?? []) as SupplierOffer[];
}

export async function countSupplierProducts(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("supplier_products")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", supplierId)
    .eq("activo", true);

  if (error) return 0;
  return count ?? 0;
}

export async function listSupplierProducts(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<SupplierProduct[]> {
  const { data, error } = await supabase
    .from("supplier_products")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as SupplierProduct[];
}

export async function listSupplierOffers(
  supabase: SupabaseClient,
  supplierId: string,
): Promise<SupplierOffer[]> {
  const { data, error } = await supabase
    .from("supplier_offers")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("expires_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as SupplierOffer[];
}

export async function getDistinctSupplierCategorias(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("categoria")
    .eq("activo", true)
    .not("categoria", "is", null);

  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    const c = (row as { categoria: string | null }).categoria?.trim();
    if (c) set.add(c);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "es"));
}

export async function getSupplierReviews(
  supabase: SupabaseClient,
  supplierId: string,
  limit = 24,
): Promise<SupplierReview[]> {
  const { data, error } = await supabase
    .from("supplier_reviews")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as SupplierReview[];
}

export async function userHadWaClickForSupplier(
  supabase: SupabaseClient,
  supplierId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("supplier_events")
    .select("id")
    .eq("supplier_id", supplierId)
    .eq("user_id", userId)
    .eq("event_type", "wa_click")
    .limit(1)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}
