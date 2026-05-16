import { BADGE_CRITERIA, computeBadge } from "@/lib/proveedores/badges";
import type {
  SupplierAnalytics30d,
  SupplierBadge,
  SupplierReviewStats,
} from "@/types/proveedores";

const TOOLTIP: Record<SupplierBadge, string> = {
  nuevo: `Siguiente: Verificado — ${BADGE_CRITERIA.verificado.min_wa_clicks_30d} clics WA en 30 días o 1 reseña verificada.`,
  verificado: `Siguiente: Top — ${BADGE_CRITERIA.top.min_wa_clicks_30d} clics WA en 30 días o rating ≥4 con 5 reseñas verificadas.`,
  top: "Siguiente: Destacado del mes (asignación manual Makeray).",
  destacado_mes: "Badge máximo del programa.",
};

function hintWithProgress(
  badge: SupplierBadge,
  analytics: SupplierAnalytics30d | null,
  reviewStats: SupplierReviewStats | null,
): string {
  const a =
    analytics ??
    ({
      supplier_id: "",
      profile_views: 0,
      wa_clicks: 0,
      catalog_views: 0,
      offer_views: 0,
      offer_wa_clicks: 0,
      unique_visitors: 0,
    } satisfies SupplierAnalytics30d);
  const r =
    reviewStats ??
    ({
      supplier_id: "",
      total_reviews: 0,
      avg_rating: 0,
      verified_reviews: 0,
    } satisfies SupplierReviewStats);
  const earned = computeBadge(a, r, "nuevo");
  if (earned !== badge) {
    return `${TOOLTIP[badge]} (progreso: ya calificas como «${earned}»).`;
  }
  return TOOLTIP[badge];
}

const STYLES: Record<
  SupplierBadge,
  { bg: string; text: string; border: string }
> = {
  nuevo: {
    bg: "rgba(120,120,120,.12)",
    text: "#4b5563",
    border: "rgba(120,120,120,.25)",
  },
  verificado: {
    bg: "rgba(37,99,235,.12)",
    text: "#2563eb",
    border: "rgba(37,99,235,.25)",
  },
  top: {
    bg: "rgba(89,47,146,.12)",
    text: "var(--color-primary, #592f92)",
    border: "rgba(89,47,146,.28)",
  },
  destacado_mes: {
    bg: "rgba(245,166,35,.15)",
    text: "#b45309",
    border: "rgba(245,166,35,.45)",
  },
};

export function BadgePill({
  badge,
  size = "md",
  analytics,
  reviewStats,
}: {
  badge: SupplierBadge;
  size?: "sm" | "md";
  analytics?: SupplierAnalytics30d | null;
  reviewStats?: SupplierReviewStats | null;
}) {
  const s = STYLES[badge];
  const pad =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]";
  const title =
    analytics != null || reviewStats != null
      ? hintWithProgress(badge, analytics ?? null, reviewStats ?? null)
      : TOOLTIP[badge];

  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center rounded-full border font-bold uppercase tracking-wide ${pad}`}
      style={{
        background: s.bg,
        color: s.text,
        borderColor: s.border,
      }}
    >
      {badge === "destacado_mes" ? "Destacado" : badge}
    </span>
  );
}
