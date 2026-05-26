// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import {
  parsePaisSlug,
  paisDirectoryLabel,
  paisSlugToCodigo,
  type PaisSlug,
} from "@/lib/admin/supplier-pais";
import { fetchAllSuppliers } from "@/lib/admin/fetch-all-suppliers";
import { SupplierAdminList } from "@/components/admin/SupplierAdminList";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function countryChoiceClass(active: boolean): string {
  return [
    "flex-1 rounded-xl border-2 px-5 py-4 text-left text-sm font-semibold transition sm:min-w-[200px]",
    active
      ? "border-emerald-700 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-700/30"
      : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300",
  ].join(" ");
}

function AdminSuppliersCountryBar({ active }: { active: PaisSlug }) {
  return (
    <section className="mt-6 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">
        ¿Qué directorio vas a editar?
      </h2>
      <p className="text-sm text-zinc-600">
        Elegí el país antes de ver o modificar el listado de proveedores.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/suppliers?pais=cl"
          scroll={false}
          className={countryChoiceClass(active === "cl")}
        >
          <span className="text-2xl leading-none">🇨🇱</span>
          <span className="mt-1 block">Chile</span>
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
            Código país 56
          </span>
        </Link>
        <Link
          href="/suppliers?pais=br"
          scroll={false}
          className={countryChoiceClass(active === "br")}
        >
          <span className="text-2xl leading-none">🇧🇷</span>
          <span className="mt-1 block">Brasil</span>
          <span className="mt-0.5 block text-xs font-normal text-zinc-500">
            Código país 55
          </span>
        </Link>
      </div>
    </section>
  );
}

export default async function AdminSuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ pais?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const { pais: paisParam } = await searchParams;
  const paisSlug = parsePaisSlug(paisParam);
  const pais_codigo = paisSlugToCodigo(paisSlug);

  const admin = createAdminSupabaseClient();
  const rows = await fetchAllSuppliers(admin, pais_codigo);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>

        <AdminSuppliersCountryBar active={paisSlug} />

        <div className="mt-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Proveedores</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Directorio {paisDirectoryLabel(paisSlug)}. Activos e inactivos;
            edición en cada ficha.
          </p>
        </div>

        <div className="mt-8">
          <SupplierAdminList suppliers={rows} paisSlug={paisSlug} />
        </div>
      </div>
    </div>
  );
}
