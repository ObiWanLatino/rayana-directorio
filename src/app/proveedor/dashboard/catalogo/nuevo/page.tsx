import { CatalogoUpgradeGate, NuevoProductoForm } from "./NuevoProductoForm";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import {
  getDistinctSupplierCategorias,
  getMySupplierProfile,
} from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/dashboard/catalogo/nuevo");

  if (!(await userHasListAccess(supabase, user.id))) redirect("/checkout");

  const profileRow = await getMySupplierProfile(supabase);
  if (!profileRow?.onboarding_completed) redirect("/proveedor/onboarding");

  const plan = profileRow.plan;
  if (plan === "basico") {
    return (
      <div className="min-h-screen bg-off px-4 py-10">
        <div className="mx-auto max-w-lg">
          <Link href="/proveedor/dashboard/catalogo" className="text-sm text-primary underline">
            ← Catálogo
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Nuevo producto</h1>
          <div className="mt-6">
            <CatalogoUpgradeGate />
          </div>
        </div>
      </div>
    );
  }

  const categorias = await getDistinctSupplierCategorias(supabase);

  return (
    <div className="min-h-screen bg-off px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/proveedor/dashboard/catalogo" className="text-sm text-primary underline">
          ← Catálogo
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy">Nuevo producto</h1>
        <div className="rounded-2xl border border-primary/12 bg-white p-6">
          <NuevoProductoForm supplierId={profileRow.supplier_id} categorias={categorias} />
        </div>
      </div>
    </div>
  );
}
