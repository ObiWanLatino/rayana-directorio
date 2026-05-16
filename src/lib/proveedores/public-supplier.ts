import type { Supplier } from "@/types";
import type {
  SupplierBadge,
  SupplierOffer,
  SupplierPlan,
  SupplierProduct,
  SupplierProfile,
} from "@/types/proveedores";

export type PublicSupplierPayload = {
  supplier: Supplier;
  profile: Pick<
    SupplierProfile,
    | "bio"
    | "cover_url"
    | "ships_nationally"
    | "ships_internationally"
    | "shipping_agent_info"
    | "plan"
    | "badge"
    | "website_url"
    | "whatsapp_negocio"
    | "user_id"
  > | null;
  products: SupplierProduct[];
  offers: SupplierOffer[];
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export function parsePublicSupplierRow(
  row: Record<string, unknown> | null,
): PublicSupplierPayload | null {
  if (!row || typeof row !== "object") return null;
  const supplier = row as unknown as Supplier;
  const rawProfiles = row.supplier_profiles as unknown;
  const profWrap = first(rawProfiles as object | object[] | null) as Record<
    string,
    unknown
  > | null;

  if (!profWrap) {
    return { supplier, profile: null, products: [], offers: [] };
  }

  const profile: PublicSupplierPayload["profile"] = {
    bio: (profWrap.bio as string | null) ?? null,
    cover_url: (profWrap.cover_url as string | null) ?? null,
    ships_nationally: Boolean(profWrap.ships_nationally ?? true),
    ships_internationally: Boolean(profWrap.ships_internationally),
    shipping_agent_info: (profWrap.shipping_agent_info as string | null) ?? null,
    plan: (profWrap.plan as SupplierPlan) ?? "basico",
    badge: (profWrap.badge as SupplierBadge) ?? "nuevo",
    website_url: (profWrap.website_url as string | null) ?? null,
    whatsapp_negocio: (profWrap.whatsapp_negocio as string | null) ?? null,
    user_id: (profWrap.user_id as string | null) ?? null,
  };

  const rawProducts = profWrap.supplier_products as unknown;
  const productsList = Array.isArray(rawProducts)
    ? rawProducts
    : rawProducts
      ? [rawProducts]
      : [];
  const products = (productsList as SupplierProduct[]).filter(
    (p) => p.activo !== false,
  );

  const rawOffers = profWrap.supplier_offers as unknown;
  const offersList = Array.isArray(rawOffers)
    ? rawOffers
    : rawOffers
      ? [rawOffers]
      : [];
  const now = Date.now();
  const offers = (offersList as SupplierOffer[]).filter((o) => {
    if (!o.activo) return false;
    return new Date(o.expires_at).getTime() > now;
  });

  const canShowCatalog = profile.plan === "vitrina" || profile.plan === "pro";

  return {
    supplier,
    profile,
    products: canShowCatalog ? products : [],
    offers: canShowCatalog ? offers : [],
  };
}
