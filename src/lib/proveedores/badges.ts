import type {
  SupplierAnalytics30d,
  SupplierBadge,
  SupplierReviewStats,
} from "@/types/proveedores";

export const BADGE_CRITERIA = {
  verificado: {
    min_wa_clicks_30d: 20,
  },
  top: {
    min_wa_clicks_30d: 50,
  },
  destacado_mes: {},
} as const;

function num(n: number | null | undefined): number {
  return typeof n === "number" && Number.isFinite(n) ? n : 0;
}

export function computeBadge(
  analytics: SupplierAnalytics30d,
  reviewStats: SupplierReviewStats | null,
  currentBadge: SupplierBadge,
): SupplierBadge {
  if (currentBadge === "destacado_mes") return "destacado_mes";

  const wa = num(analytics.wa_clicks);
  const avg = Number(reviewStats?.avg_rating ?? 0);
  const verifiedReviews = num(reviewStats?.verified_reviews);

  if (
    wa >= BADGE_CRITERIA.top.min_wa_clicks_30d ||
    (avg >= 4 && verifiedReviews >= 5)
  ) {
    return "top";
  }

  if (
    wa >= BADGE_CRITERIA.verificado.min_wa_clicks_30d ||
    verifiedReviews >= 1
  ) {
    return "verificado";
  }

  return currentBadge;
}
