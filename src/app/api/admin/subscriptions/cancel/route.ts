import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { getStripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CancelBody = {
  user_id?: string;
};

export async function POST(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: CancelBody;
  try {
    body = (await request.json()) as CancelBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const userId = body.user_id?.trim();
  if (!userId) {
    return NextResponse.json({ error: "user_id es requerido" }, { status: 400 });
  }

  const db = createAdminSupabaseClient();
  const { data: subscription, error: subError } = await db
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }
  if (!subscription) {
    return NextResponse.json(
      { error: "Suscripción no encontrada para ese usuario" },
      { status: 404 },
    );
  }

  const stripeSubscriptionId = subscription.stripe_subscription_id;
  if (stripeSubscriptionId) {
    const stripe = getStripe();
    await stripe.subscriptions.cancel(stripeSubscriptionId);
  }

  const { error: updateError } = await db
    .from("subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
