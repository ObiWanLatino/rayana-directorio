// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import { SupplierAdminForm } from "@/components/admin/SupplierAdminForm";
import {
  parsePaisSlug,
  paisSlugToCodigo,
} from "@/lib/admin/supplier-pais";
import { getAdminUser } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminNewSupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ pais?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const { pais: paisParam } = await searchParams;
  const listPaisSlug = parsePaisSlug(paisParam);
  const paisCodigo = paisSlugToCodigo(listPaisSlug);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <SupplierAdminForm
          mode="new"
          listPaisSlug={listPaisSlug}
          paisCodigo={paisCodigo}
        />
      </div>
    </div>
  );
}
