import { CategoriasLandingAdmin } from "@/components/admin/CategoriasLandingAdmin";
import { getAdminUser } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  return <CategoriasLandingAdmin />;
}
