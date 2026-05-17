import { getAdminUser } from "@/lib/auth/require-admin";
import { getAppUrl } from "@/lib/app-url";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const cards: {
  title: string;
  description: string;
  href: string;
  cta: string;
  isDownload?: boolean;
}[] = [
  {
    title: "Perfiles proveedor (Makeray Pro)",
    description: "Planes, badges, activación y métricas 30d de supplier_profiles.",
    href: "/proveedores",
    cta: "Abrir perfiles",
  },
  {
    title: "Ver / Editar proveedores",
    description: "Listado completo, activos e inactivos, con enlace a edición.",
    href: "/suppliers?pais=cl",
    cta: "Abrir lista",
  },
  {
    title: "Agregar nuevo proveedor",
    description: "Formulario con validación y códigos únicos.",
    href: "/suppliers/new?pais=cl",
    cta: "Nuevo proveedor",
  },
  {
    title: "Descargar lista actual",
    description:
      "Excel de respaldo con todos los registros (activos e inactivos).",
    href: "/api/admin/download-excel",
    cta: "Descargar .xlsx",
    isDownload: true,
  },
  {
    title: "Carga masiva",
    description: "Importación por Excel con pasos de seguridad y vista previa.",
    href: "/upload",
    cta: "Ir a carga masiva",
  },
  {
    title: "Suscriptores",
    description: "Panel completo de suscriptores, accesos y cobros.",
    href: "/subscriptions",
    cta: "Abrir panel",
  },
];

export default async function AdminHomePage() {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin-login");
  }

  const supabase = createAdminSupabaseClient();

  const [
    { count: totalUsers },
    { count: activeSubscriptions },
    { count: totalSuppliers },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("suppliers")
      .select("*", { count: "exact", head: true })
      .eq("activo", true),
    supabase
      .from("admin_access_log")
      .select("id, email, action, ip_address, success, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  let hubUrl = "/hub";
  try {
    hubUrl = `${getAppUrl()}/hub`;
  } catch {
    /* use relative fallback */
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Panel Admin · Makeray
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Sesión: {user.email}
            </p>
          </div>
          <a
            href={hubUrl}
            className="text-sm text-zinc-400 underline hover:text-zinc-200"
          >
            Ir al hub (sitio principal)
          </a>
        </div>

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Usuarios totales</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {totalUsers ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Suscripciones activas</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {activeSubscriptions ?? "—"}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Proveedores activos</p>
            <p className="mt-1 text-3xl font-bold tabular-nums">
              {totalSuppliers ?? "—"}
            </p>
          </div>
        </div>

        <div className="mb-12 rounded-xl bg-zinc-900 p-6">
          <h2 className="mb-4 text-sm font-medium text-zinc-400">
            Últimos accesos admin
          </h2>
          <div className="space-y-2">
            {(recentLogs ?? []).length === 0 ? (
              <p className="text-sm text-zinc-500">Sin registros aún.</p>
            ) : (
              (recentLogs ?? []).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2 text-sm last:border-0"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${log.success ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <span className="text-zinc-300">{log.email ?? "—"}</span>
                    <span className="text-zinc-500">{log.action}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-zinc-500">
                    <span>{log.ip_address ?? "—"}</span>
                    <span>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString("es-CL")
                        : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <h2 className="mb-4 text-lg font-semibold text-zinc-200">
          Herramientas
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <li key={c.title}>
              <div className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
                <h3 className="text-lg font-semibold text-zinc-100">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm text-zinc-400">{c.description}</p>
                <div className="mt-6">
                  {c.isDownload ? (
                    <a
                      href={c.href}
                      className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                    >
                      {c.cta}
                    </a>
                  ) : (
                    <Link
                      href={c.href}
                      className="inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100"
                    >
                      {c.cta}
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
