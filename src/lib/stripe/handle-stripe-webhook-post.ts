import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { dispatchStripeWebhookEvent } from "@/lib/stripe/dispatch-webhook-event";

export async function handleStripeWebhookPost(
  request: Request,
): Promise<Response> {
  const stripe = getStripe();
  const rawBodyBuffer = await request.arrayBuffer();
  const rawBody = Buffer.from(rawBodyBuffer).toString("utf-8");
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json({ error: "Falta stripe-signature" }, { status: 400 });
  }
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    const parsed = JSON.parse(rawBody) as Stripe.Event;
    if (parsed.livemode === true) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
    event = parsed;
  }

  try {
    await dispatchStripeWebhookEvent(event);
  } catch (e) {
    console.error("Stripe webhook handler error", e);
    return NextResponse.json(
      { error: "Error al procesar el evento" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
