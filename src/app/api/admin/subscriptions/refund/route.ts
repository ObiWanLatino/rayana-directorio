import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { getStripe } from "@/lib/stripe/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type RefundBody = {
  user_id?: string;
};

export async function POST(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: RefundBody;
  try {
    body = (await request.json()) as RefundBody;
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
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }
  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No hay cliente Stripe asociado para este usuario" },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const paymentIntents = await stripe.paymentIntents.list({
    customer: subscription.stripe_customer_id,
    limit: 20,
  });

  const latestSuccessful = paymentIntents.data.find(
    (pi) => pi.status === "succeeded" && pi.amount_received > 0,
  );

  if (!latestSuccessful) {
    return NextResponse.json(
      { error: "No se encontró un pago exitoso para reembolsar" },
      { status: 404 },
    );
  }

  const refund = await stripe.refunds.create({
    payment_intent: latestSuccessful.id,
  });

  const { error: updateError } = await db
    .from("subscriptions")
    .update({
      refunded_at: new Date().toISOString(),
      refunded_amount: refund.amount ?? latestSuccessful.amount_received,
      refund_id: refund.id,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    refund_id: refund.id,
    refunded_amount: refund.amount,
  });
}
