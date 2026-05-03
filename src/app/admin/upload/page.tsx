import { ExcelUploadClient } from "@/components/admin/ExcelUploadClient";
import { isAdminEmail } from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUploadPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/upload");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/hub");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <ExcelUploadClient />
    </div>
  );
}
