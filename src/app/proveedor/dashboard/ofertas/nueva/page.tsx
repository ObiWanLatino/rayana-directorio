import { NuevaOfertaForm, OfertasUpgradeGate } from "./NuevaOfertaForm";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { getMySupplierProfile } from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NuevaOfertaPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/dashboard/ofertas/nueva");

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) redirect("/checkout");

  const profileRow = await getMySupplierProfile(supabase);
  if (!profileRow?.onboarding_completed) redirect("/proveedor/onboarding");

  const plan = profileRow.plan;
  if (plan === "basico") {
    return (
      <div className="min-h-screen bg-off px-4 py-10">
        <div className="mx-auto max-w-lg">
          <Link href="/proveedor/dashboard/ofertas" className="text-sm text-primary underline">
            ← Ofertas
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Nueva oferta</h1>
          <div className="mt-6">
            <OfertasUpgradeGate />
          </div>
        </div>
      </div>
    );
  }

  const maxDays = plan === "pro" ? 60 : 30;

  return (
    <div className="min-h-screen bg-off px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/proveedor/dashboard/ofertas" className="text-sm text-primary underline">
          ← Ofertas
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy">Nueva oferta</h1>
        <p className="text-xs text-navy/45">Máximo {maxDays} días desde hoy.</p>
        <div className="rounded-2xl border border-primary/12 bg-white p-6">
          <NuevaOfertaForm supplierId={profileRow.supplier_id} maxDays={maxDays} />
        </div>
      </div>
    </div>
  );
}
