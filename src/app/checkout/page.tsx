import { userHasListAccess } from "@/lib/auth/gifted-access";
import { StripeCheckoutButton } from "@/components/subscription/StripeCheckoutButton";
import {
  getCountryFromHeaders,
  getPriceForRegion,
} from "@/lib/stripe/get-price-for-region";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  if (await userHasListAccess(supabase, user.id)) {
    redirect("/hub");
  }

  const headersList = await headers();
  const country = getCountryFromHeaders(headersList);
  const pricing = getPriceForRegion(country);

  const priceLabel =
    pricing.currency === "CLP"
      ? "$14.990 CLP al mes"
      : "$15 USD al mes";

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-zinc-900">
          Suscripción requerida
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600">
          Plan según tu región: <strong>{priceLabel}</strong>. Sin periodo de
          prueba. Un pago activa el acceso a todos los módulos de la plataforma.
        </p>
        <p className="mt-2 text-xs text-zinc-500">
          Serás redirigida a Stripe Checkout para completar el pago de forma
          segura.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <StripeCheckoutButton pricing={pricing} loginNextPath="/checkout" />
          <Link href="/" className="text-center text-sm text-zinc-500 underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
