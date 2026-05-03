import { SuppliersAdminTable } from "@/components/admin/SuppliersAdminTable";
import { isAdminEmail } from "@/lib/auth/entitlements";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminSuppliersPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/suppliers");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/hub");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("suppliers")
    .select("*")
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-[1400px]">
        <SuppliersAdminTable initial={(data ?? []) as Supplier[]} />
      </div>
    </div>
  );
}
