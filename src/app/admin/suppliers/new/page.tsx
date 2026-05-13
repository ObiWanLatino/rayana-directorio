import { SupplierAdminForm } from "@/components/admin/SupplierAdminForm";
import {
  parsePaisSlug,
  paisSlugToCodigo,
} from "@/lib/admin/supplier-pais";
import { isAdminEmail } from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminNewSupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ pais?: string }>;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/suppliers/new");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/hub");
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
