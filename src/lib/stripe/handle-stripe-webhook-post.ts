import { NextResponse } from "next/server";
import type Stripe from "stripe";
// import { getStripe } from "@/lib/stripe/client";
import { dispatchStripeWebhookEvent } from "@/lib/stripe/dispatch-webhook-event";

export async function handleStripeWebhookPost(
  request: Request,
): Promise<Response> {
  // TEMPORAL - solo para diagnóstico (sin verificación de firma)
  const rawBodyBuffer = await request.arrayBuffer();
  const rawBody = Buffer.from(rawBodyBuffer).toString("utf-8");
  let event: Stripe.Event;
  try {
    event = JSON.parse(rawBody) as Stripe.Event;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // --- Verificación Stripe (restaurar después del diagnóstico) ---
  // const stripe = getStripe();
  // const signature = request.headers.get("stripe-signature");
  // const secret = process.env.STRIPE_WEBHOOK_SECRET;
  // if (!signature) {
  //   return NextResponse.json(
  //     { error: "Falta el encabezado stripe-signature" },
  //     { status: 400 },
  //   );
  // }
  // if (!secret) {
  //   return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  // }
  // try {
  //   event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  // } catch (err) {
  //   const message = err instanceof Error ? err.message : "Firma inválida";
  //   return NextResponse.json({ error: message }, { status: 400 });
  // }

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
