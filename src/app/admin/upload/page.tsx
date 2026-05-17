// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import { ExcelUploadClient } from "@/components/admin/ExcelUploadClient";
import { getAdminUser } from "@/lib/auth/require-admin";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminUploadPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <ExcelUploadClient />
    </div>
  );
}
