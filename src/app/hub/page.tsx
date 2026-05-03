import { SignOutButton } from "@/components/auth/SignOutButton";
import { BillingPortalButton } from "@/components/stripe/BillingPortalButton";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const modules = [
  {
    title: "Proveedores Chile",
    description: "Directorio de proveedores",
    href: "/proveedores",
    available: true,
  },
  {
    title: "Fabricantes Brasil",
    description: "Próximamente",
    href: "/fabricantes",
    available: false,
  },
  {
    title: "Cursos educativos",
    description: "Próximamente",
    href: "/cursos",
    available: false,
  },
];

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const showPaymentThanks = Boolean(params.session_id);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) {
    redirect("/checkout");
  }

  const { data: billingRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const canUseBillingPortal = Boolean(billingRow?.stripe_customer_id);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 sm:py-10">
      <header className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">Hola,</p>
          <p className="font-medium text-zinc-900">
            {user.user_metadata?.full_name ?? user.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BillingPortalButton disabled={!canUseBillingPortal} />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto mt-8 max-w-6xl sm:mt-10">
        {showPaymentThanks ? (
          <p
            className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
            role="status"
          >
            Pago recibido. Tu suscripción debería estar activa; si algo no
            carga, espera unos segundos o actualiza la página.
          </p>
        ) : null}
        <h1 className="text-xl font-semibold text-zinc-900">Tu hub</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Elige un módulo para continuar.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <li key={m.href}>
              {m.available ? (
                <Link
                  href={m.href}
                  className="flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md active:scale-[0.99]"
                >
                  <p className="font-medium text-zinc-900">{m.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{m.description}</p>
                </Link>
              ) : (
                <div className="flex min-h-[5.5rem] flex-col justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-100/80 p-5 opacity-80">
                  <p className="font-medium text-zinc-700">{m.title}</p>
                  <p className="mt-1 text-sm text-zinc-500">{m.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
