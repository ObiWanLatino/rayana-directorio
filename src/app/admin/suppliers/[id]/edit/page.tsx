// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import { SupplierAdminForm } from "@/components/admin/SupplierAdminForm";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminEditSupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <SupplierAdminForm mode="edit" supplier={data as Supplier} />
      </div>
    </div>
  );
}
