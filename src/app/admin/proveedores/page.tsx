// DEPRECATED: Esta ruta será migrada a admin.makeray.cl
// TODO: Eliminar después de migración completa

import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SupplierBadge } from "@/types/proveedores";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  supplier_id: string;
  plan: string;
  badge: string;
  activo: boolean;
  plan_expires_at: string | null;
  suppliers: {
    codigo: number;
    tienda: string;
    categoria: string | null;
    pais_codigo: string;
  } | null;
};

async function updateProveedorAdmin(formData: FormData) {
  "use server";
  const user = await getAdminUser();
  if (!user) redirect("/admin-login");

  const id = String(formData.get("id") ?? "");
  const action = String(formData.get("action") ?? "");
  if (!id) return;

  const admin = createAdminSupabaseClient();
  if (action === "badge") {
    const badge = String(formData.get("badge") ?? "") as SupplierBadge;
    const allowed: SupplierBadge[] = [
      "nuevo",
      "verificado",
      "top",
      "destacado_mes",
    ];
    if (!allowed.includes(badge)) return;
    await admin
      .from("supplier_profiles")
      .update({ badge, badge_updated_at: new Date().toISOString() })
      .eq("id", id);
  }
  if (action === "activo") {
    const activo = formData.get("activo") === "true";
    await admin.from("supplier_profiles").update({ activo }).eq("id", id);
  }
  redirect("/proveedores");
}

export default async function AdminProveedoresPage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const admin = createAdminSupabaseClient();
  const { data: profiles, error } = await admin
    .from("supplier_profiles")
    .select(
      `
      id, supplier_id, plan, badge, activo, plan_expires_at,
      suppliers (codigo, tienda, categoria, pais_codigo)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  type RawProfile = {
    id: string;
    supplier_id: string;
    plan: string;
    badge: string;
    activo: boolean;
    plan_expires_at: string | null;
    suppliers:
      | {
          codigo: number;
          tienda: string;
          categoria: string | null;
          pais_codigo: string;
        }
      | {
          codigo: number;
          tienda: string;
          categoria: string | null;
          pais_codigo: string;
        }[]
      | null;
  };

  const rows: ProfileRow[] = (profiles ?? []).map((raw) => {
    const r = raw as RawProfile;
    const s = r.suppliers;
    const supplier = Array.isArray(s) ? s[0] ?? null : s;
    return { ...r, suppliers: supplier };
  });
  const ids = rows.map((r) => r.supplier_id);
  let analyticsById = new Map<
    string,
    { wa_clicks: number; profile_views: number }
  >();
  if (ids.length > 0) {
    const { data: arows } = await admin
      .from("supplier_analytics_30d")
      .select("supplier_id, wa_clicks, profile_views")
      .in("supplier_id", ids);
    analyticsById = new Map(
      (arows ?? []).map((a: { supplier_id: string; wa_clicks: number; profile_views: number }) => [
        a.supplier_id,
        { wa_clicks: a.wa_clicks ?? 0, profile_views: a.profile_views ?? 0 },
      ]),
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-zinc-500 underline">
          ← Admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Perfiles proveedor
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Planes, badges y métricas 30d (service role).
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase text-zinc-500">
              <tr>
                <th className="px-3 py-2">Tienda</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Expira</th>
                <th className="px-3 py-2">WA 30d</th>
                <th className="px-3 py-2">Vistas</th>
                <th className="px-3 py-2">Badge</th>
                <th className="px-3 py-2">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((r) => {
                const s = r.suppliers;
                const a = analyticsById.get(r.supplier_id);
                return (
                  <tr key={r.id} className="align-top">
                    <td className="px-3 py-2">
                      <div className="font-medium text-zinc-900">
                        {s?.tienda ?? "—"}
                      </div>
                      <div className="text-xs text-zinc-500">
                        #{s?.codigo} · {s?.pais_codigo}
                      </div>
                    </td>
                    <td className="px-3 py-2">{r.plan}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-zinc-600">
                      {r.plan_expires_at
                        ? new Date(r.plan_expires_at).toLocaleDateString("es-CL")
                        : "—"}
                    </td>
                    <td className="px-3 py-2">{a?.wa_clicks ?? 0}</td>
                    <td className="px-3 py-2">{a?.profile_views ?? 0}</td>
                    <td className="px-3 py-2">
                      <form action={updateProveedorAdmin} className="flex flex-col gap-1">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="action" value="badge" />
                        <select
                          name="badge"
                          defaultValue={r.badge}
                          className="max-w-[160px] rounded border px-2 py-1 text-xs"
                        >
                          {(
                            [
                              "nuevo",
                              "verificado",
                              "top",
                              "destacado_mes",
                            ] as const
                          ).map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded bg-zinc-900 px-2 py-1 text-[11px] font-medium text-white"
                        >
                          Guardar badge
                        </button>
                      </form>
                    </td>
                    <td className="px-3 py-2">
                      <form action={updateProveedorAdmin}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="action" value="activo" />
                        <input
                          type="hidden"
                          name="activo"
                          value={r.activo ? "false" : "true"}
                        />
                        <button
                          type="submit"
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            r.activo
                              ? "bg-emerald-100 text-emerald-900"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {r.activo ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
