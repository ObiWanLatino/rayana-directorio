import { isAdminEmail } from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }
  if (!isAdminEmail(user.email)) {
    redirect("/hub");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/hub"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Hub
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">
          Administración
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Importación Excel, lista de proveedores y logos.
        </p>
        <ul className="mt-8 flex flex-col gap-3 text-sm">
          <li>
            <Link
              href="/admin/upload"
              className="font-medium text-zinc-900 underline"
            >
              Subir Excel
            </Link>
            <span className="ml-2 text-zinc-500">
              — validación, vista previa, importación
            </span>
          </li>
          <li>
            <Link
              href="/admin/suppliers"
              className="font-medium text-zinc-900 underline"
            >
              Lista de proveedores
            </Link>
            <span className="ml-2 text-zinc-500">
              — edición inline y logos
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
