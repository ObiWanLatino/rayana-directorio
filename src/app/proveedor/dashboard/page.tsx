import { AnalyticsDashboard } from "@/components/proveedores/AnalyticsDashboard";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import {
  countSupplierProducts,
  getActiveOffers,
  getMySupplierProfile,
  getSupplierAnalytics30d,
  getSupplierReviewStats,
} from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProveedorDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/dashboard");

  if (!(await userHasListAccess(supabase, user.id))) redirect("/checkout");

  const profileRow = await getMySupplierProfile(supabase);
  if (!profileRow?.onboarding_completed) {
    redirect("/proveedor/onboarding");
  }

  const supplierId = profileRow.supplier_id;
  const [analytics, reviewStats, recentOffers, productCount] = await Promise.all([
    getSupplierAnalytics30d(supabase, supplierId),
    getSupplierReviewStats(supabase, supplierId),
    getActiveOffers(supabase, supplierId),
    countSupplierProducts(supabase, supplierId),
  ]);

  const badge = profileRow.badge;
  const showUpgrade = profileRow.plan === "basico";

  return (
    <div className="min-h-screen bg-off px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">Panel proveedor</h1>
            <p className="text-sm text-navy/50">
              {profileRow.suppliers?.tienda ?? "Tu tienda"}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link className="text-primary underline" href="/proveedor/dashboard/perfil">
              Perfil
            </Link>
            <Link className="text-primary underline" href="/proveedor/dashboard/catalogo">
              Catálogo
            </Link>
            <Link className="text-primary underline" href="/proveedor/dashboard/ofertas">
              Ofertas
            </Link>
            <Link className="text-navy/50 underline" href="/hub">
              Hub
            </Link>
          </nav>
        </header>

        <AnalyticsDashboard
          analytics={analytics}
          reviewStats={reviewStats}
          badge={badge}
          activeOfferCount={recentOffers.length}
          recentOffers={recentOffers}
          showUpgrade={showUpgrade}
        />

        <p className="text-xs text-navy/40">
          Productos activos en catálogo: {productCount}
        </p>
      </div>
    </div>
  );
}
