import { isAdminEmail } from "@/lib/auth/entitlements";
import { formatCodigo } from "@/lib/utils/format-codigo";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";
import Link from "next/link";
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

  const rows = (data ?? []) as Supplier[];

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-[1200px]">
        <Link
          href="/admin"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              Proveedores
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Activos e inactivos. Edición detallada en cada ficha.
            </p>
          </div>
          <Link
            href="/admin/suppliers/new"
            className="inline-flex w-fit rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Agregar nuevo proveedor
          </Link>
        </div>

        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Tienda</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Instagram</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r: Supplier) => (
                <tr key={r.id} className="hover:bg-zinc-50/80">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-rose-900">
                    {formatCodigo(r.codigo)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-900">
                    {r.tienda}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-zinc-600">
                    {r.categoria ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {r.whatsapp ?? "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-zinc-600">
                    {r.instagram ? `@${r.instagram}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.activo
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700"
                      }
                    >
                      {r.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/admin/suppliers/${r.id}/edit`}
                      className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-600"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-zinc-500">
          {rows.length} proveedor{rows.length === 1 ? "" : "es"} en total.
        </p>
      </div>
    </div>
  );
}
