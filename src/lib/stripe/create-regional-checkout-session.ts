import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { getAppUrl } from "@/lib/app-url";
import { getStripe } from "@/lib/stripe/client";
import {
  getCountryFromHeaders,
  getPriceForRegion,
  type PricingInfo,
} from "@/lib/stripe/get-price-for-region";

export type RegionalCheckoutOptions = {
  /** Ruta absoluta desde la raíz del sitio, sin origin (ej. `/pricing`). */
  cancelPath: string;
};

export type RegionalCheckoutResult =
  | { ok: true; url: string; pricing: PricingInfo }
  | { ok: false; status: number; error: string };

export async function createRegionalStripeSubscriptionCheckoutSession(
  headers: Headers,
  supabase: SupabaseClient,
  user: { id: string; email?: string | null },
  options: RegionalCheckoutOptions,
): Promise<RegionalCheckoutResult> {
  if (!user.email) {
    return { ok: false, status: 401, error: "No autorizado" };
  }

  const access = await fetchSubscriptionAccessRow(supabase, user.id);
  if (hasSubscriptionAccess(access)) {
    return {
      ok: false,
      status: 400,
      error: "Ya tienes una suscripción activa",
    };
  }

  const country = getCountryFromHeaders(headers);
  const pricing = getPriceForRegion(country);

  const { data: existingRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const stripe = getStripe();
  const origin = getAppUrl();
  const cancelPath = options.cancelPath.startsWith("/")
    ? options.cancelPath
    : `/${options.cancelPath}`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: pricing.priceId, quantity: 1 }],
    success_url: `${origin}/hub?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${cancelPath}`,
    client_reference_id: user.id,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        user_id: user.id,
        currency: pricing.currency,
        country: pricing.country,
      },
    },
    metadata: {
      user_id: user.id,
      currency: pricing.currency,
      country: pricing.country,
      plan_name:
        pricing.currency === "CLP" ? "Premium CLP" : "Premium USD",
      amount: String(pricing.amount),
    },
    ...(existingRow?.stripe_customer_id
      ? { customer: existingRow.stripe_customer_id }
      : { customer_email: user.email }),
  });

  if (!session.url) {
    return {
      ok: false,
      status: 500,
      error: "Stripe no devolvió URL de checkout",
    };
  }

  return { ok: true, url: session.url, pricing };
}
