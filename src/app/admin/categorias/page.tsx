import { CategoryPhotoAdmin } from "@/components/admin/CategoryPhotoAdmin";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Categoria } from "@/types/categories";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("categories")
    .select("id, nombre, emoji, foto_url, orden")
    .order("orden", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Categorías — fotos landing
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Sube la imagen de fondo de cada categoría en la página principal.
          JPG o PNG — se comprime automáticamente.
        </p>

        <CategoryPhotoAdmin initialCategorias={(data ?? []) as Categoria[]} />
      </div>
    </div>
  );
}
