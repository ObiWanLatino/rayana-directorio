import { BadgePill } from "@/components/proveedores/BadgePill";
import { OfferCard } from "@/components/proveedores/OfferCard";
import type {
  SupplierAnalytics30d,
  SupplierBadge,
  SupplierOffer,
  SupplierReviewStats,
} from "@/types/proveedores";
import Link from "next/link";

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-primary/12 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-navy/45">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}

export function AnalyticsDashboard({
  analytics,
  reviewStats,
  badge,
  activeOfferCount,
  recentOffers,
  showUpgrade,
}: {
  analytics: SupplierAnalytics30d | null;
  reviewStats: SupplierReviewStats | null;
  badge: SupplierBadge;
  activeOfferCount: number;
  recentOffers: SupplierOffer[];
  showUpgrade: boolean;
}) {
  const a = analytics ?? {
    supplier_id: "",
    profile_views: 0,
    wa_clicks: 0,
    catalog_views: 0,
    offer_views: 0,
    offer_wa_clicks: 0,
    unique_visitors: 0,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Resumen</h2>
          <p className="text-sm text-navy/50">Últimos 30 días</p>
        </div>
        <BadgePill
          badge={badge}
          analytics={analytics}
          reviewStats={reviewStats}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Vistas de perfil" value={a.profile_views} />
        <Metric label="Clics WhatsApp" value={a.wa_clicks} />
        <Metric label="Visitantes únicos" value={a.unique_visitors} />
        <Metric label="Ofertas activas" value={activeOfferCount} />
      </div>

      {showUpgrade ? (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm text-navy/70">
          <span className="font-semibold text-navy">Plan Básico.</span>{" "}
          <Link href="/proveedor/onboarding" className="font-bold text-primary underline">
            Mejorá a Vitrina o Pro
          </Link>{" "}
          para catálogo y ofertas.
        </div>
      ) : null}

      {recentOffers.length > 0 ? (
        <section>
          <h3 className="mb-3 font-semibold text-navy">Tus ofertas activas</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentOffers.slice(0, 4).map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
          <Link
            href="/proveedor/dashboard/ofertas"
            className="mt-3 inline-block text-sm font-bold text-primary underline"
          >
            Gestionar ofertas
          </Link>
        </section>
      ) : null}
    </div>
  );
}
