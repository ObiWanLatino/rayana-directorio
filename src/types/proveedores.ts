import type { Supplier } from "@/types";

export type SupplierPlan = "basico" | "vitrina" | "pro";
export type SupplierBadge = "nuevo" | "verificado" | "top" | "destacado_mes";
export type SupplierEventType =
  | "profile_view"
  | "wa_click"
  | "catalog_view"
  | "product_view"
  | "offer_view"
  | "offer_wa_click";

export interface SupplierProfile {
  id: string;
  supplier_id: string;
  user_id: string | null;
  bio: string | null;
  cover_url: string | null;
  whatsapp_negocio: string | null;
  website_url: string | null;
  ships_nationally: boolean;
  ships_internationally: boolean;
  shipping_agent_info: string | null;
  plan: SupplierPlan;
  plan_started_at: string | null;
  plan_expires_at: string | null;
  lemon_squeezy_customer_id: string | null;
  lemon_squeezy_subscription_id: string | null;
  lemon_squeezy_variant_id: string | null;
  badge: SupplierBadge;
  badge_updated_at: string | null;
  onboarding_completed: boolean;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  nombre: string;
  descripcion: string | null;
  precio_clp: number | null;
  precio_mayorista: number | null;
  minimo_unidades: number;
  foto_url: string | null;
  categoria: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplierOffer {
  id: string;
  supplier_id: string;
  titulo: string;
  descripcion: string | null;
  descuento_pct: number | null;
  foto_url: string | null;
  activo: boolean;
  starts_at: string;
  expires_at: string;
  created_at: string;
}

export interface SupplierReview {
  id: string;
  supplier_id: string;
  user_id: string;
  rating: number;
  comentario: string | null;
  verified: boolean;
  created_at: string;
}

export interface SupplierAnalytics30d {
  supplier_id: string;
  profile_views: number;
  wa_clicks: number;
  catalog_views: number;
  offer_views: number;
  offer_wa_clicks: number;
  unique_visitors: number;
}

export interface SupplierAnalyticsAll {
  supplier_id: string;
  profile_views: number;
  wa_clicks: number;
  catalog_views: number;
  unique_visitors: number;
  first_event_at: string | null;
}

export interface SupplierReviewStats {
  supplier_id: string;
  total_reviews: number;
  avg_rating: number;
  verified_reviews: number;
}

export type SupplierProfileSummary = Pick<
  SupplierProfile,
  "plan" | "badge" | "onboarding_completed"
>;

export type SupplierWithProfile = Supplier & {
  supplier_profiles: SupplierProfileSummary | SupplierProfileSummary[] | null;
};

export type SupplierDashboardData = {
  supplier: Supplier;
  profile: SupplierProfile;
  analytics: SupplierAnalytics30d | null;
  reviewStats: SupplierReviewStats | null;
  recentOffers: SupplierOffer[];
  productCount: number;
};

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingFormData {
  step: OnboardingStep;
  supplier_id?: string;
  whatsapp_negocio?: string;
  website_url?: string;
  bio?: string;
  cover_url?: string;
  ships_internationally?: boolean;
  shipping_agent_info?: string;
  plan?: SupplierPlan;
}
