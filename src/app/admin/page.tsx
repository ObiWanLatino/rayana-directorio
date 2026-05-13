import { isAdminEmail } from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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
    title: "Ver / Editar proveedores",
    description: "Listado completo, activos e inactivos, con enlace a edición.",
    href: "/admin/suppliers?pais=cl",
    cta: "Abrir lista",
  },
  {
    title: "Agregar nuevo proveedor",
    description: "Formulario con validación y códigos únicos.",
    href: "/admin/suppliers/new?pais=cl",
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
    href: "/admin/upload",
    cta: "Ir a carga masiva",
  },
  {
    title: "Suscriptores",
    description: "Panel completo de suscriptores, accesos y cobros.",
    href: "/admin/subscriptions",
    cta: "Abrir panel",
  },
];

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
    <div className="min-h-screen bg-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/hub"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Hub
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900">
          Administración
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Hub de herramientas para el directorio de proveedores.
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {cards.map((c) => (
            <li key={c.title}>
              <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">{c.title}</h2>
                <p className="mt-2 flex-1 text-sm text-zinc-600">{c.description}</p>
                <div className="mt-6">
                  {c.isDownload ? (
                    <a
                      href={c.href}
                      className="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
                    >
                      {c.cta}
                    </a>
                  ) : (
                    <Link
                      href={c.href}
                      className="inline-flex rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
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
