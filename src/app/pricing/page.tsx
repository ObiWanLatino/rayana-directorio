import { StripeCheckoutButton } from "@/components/subscription/StripeCheckoutButton";
import {
  getCountryFromHeaders,
  getPriceForRegion,
} from "@/lib/stripe/get-price-for-region";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const headersList = await headers();
  const country = getCountryFromHeaders(headersList);
  const pricing = getPriceForRegion(country);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            Suscripción Makeray Premium
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            Acceso completo al directorio de proveedores mayoristas
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {process.env.NODE_ENV === "development" ? (
            <div className="mb-4 text-center text-xs text-zinc-500">
              País detectado: {pricing.country}
            </div>
          ) : null}

          <div className="mb-6 text-center">
            <div className="text-5xl font-bold text-zinc-900">
              {pricing.currency === "CLP" ? "$14.990" : "$15"}
            </div>
            <div className="mt-1 text-sm text-zinc-600">
              {pricing.currency === "CLP"
                ? "pesos chilenos al mes"
                : "USD al mes"}
            </div>
          </div>

          <ul className="mb-8 space-y-3 text-sm text-zinc-700">
            <li className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Acceso completo al directorio de proveedores</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Datos de contacto verificados</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Actualizaciones semanales</span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Cancela cuando quieras</span>
            </li>
          </ul>

          {user ? (
            <StripeCheckoutButton pricing={pricing} variant="large" />
          ) : (
            <div className="space-y-2">
              <Link
                href="/login?next=/pricing"
                className="block w-full rounded-xl bg-zinc-900 px-8 py-4 text-center text-lg font-semibold text-white hover:bg-zinc-800"
              >
                Iniciar sesión para suscribirte
              </Link>
              <p className="text-center text-xs text-zinc-500">
                Te redirigiremos a Stripe Checkout de forma segura
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-zinc-400">
            <Link href="/" className="underline decoration-zinc-300 underline-offset-2">
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
