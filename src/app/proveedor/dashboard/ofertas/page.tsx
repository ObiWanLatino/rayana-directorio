import { OfferCard } from "@/components/proveedores/OfferCard";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { getMySupplierProfile, listSupplierOffers } from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProveedorOfertasPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/dashboard/ofertas");

  if (!(await userHasListAccess(supabase, user.id))) redirect("/checkout");

  const profileRow = await getMySupplierProfile(supabase);
  if (!profileRow?.onboarding_completed) redirect("/proveedor/onboarding");

  const offers = await listSupplierOffers(supabase, profileRow.supplier_id);
  const canEdit = profileRow.plan === "vitrina" || profileRow.plan === "pro";

  return (
    <div className="min-h-screen bg-off px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/proveedor/dashboard" className="text-sm text-primary underline">
            ← Dashboard
          </Link>
          {canEdit ? (
            <Link
              href="/proveedor/dashboard/ofertas/nueva"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white"
            >
              Nueva oferta
            </Link>
          ) : null}
        </div>
        <h1 className="font-display text-2xl font-bold text-navy">Ofertas</h1>
        {offers.length === 0 ? (
          <p className="text-sm text-navy/55">No hay ofertas registradas.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
