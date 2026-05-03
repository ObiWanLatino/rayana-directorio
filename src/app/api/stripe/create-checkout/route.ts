import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { getStripe } from "@/lib/stripe/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const access = await fetchSubscriptionAccessRow(supabase, user.id);
    if (hasSubscriptionAccess(access)) {
      return NextResponse.json(
        { error: "Ya tienes una suscripción activa" },
        { status: 400 },
      );
    }

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { error: "STRIPE_PRICE_ID no configurado" },
        { status: 500 },
      );
    }

    const { data: existingRow } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = getStripe();
    const origin = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/hub?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      client_reference_id: user.id,
      allow_promotion_codes: false,
      subscription_data: {
        metadata: { user_id: user.id },
      },
      metadata: { user_id: user.id },
      ...(existingRow?.stripe_customer_id
        ? { customer: existingRow.stripe_customer_id }
        : { customer_email: user.email }),
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe no devolvió URL de checkout" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al crear la sesión de pago";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
