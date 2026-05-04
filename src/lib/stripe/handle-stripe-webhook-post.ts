import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { dispatchStripeWebhookEvent } from "@/lib/stripe/dispatch-webhook-event";

/**
 * Verificación de firma: mismo flujo para Workbench y endpoints “clásicos”.
 * Cada destino en Workbench tiene su propio signing secret (whsec_…); debe
 * coincidir con STRIPE_WEBHOOK_SECRET en el entorno que recibe ese URL.
 * No mezclar con el secret de `stripe listen` ni con otro endpoint.
 * @see https://docs.stripe.com/webhooks/signatures
 * @see https://docs.stripe.com/workbench/webhooks
 */
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
  } catch (err) {
    console.error("Firma inválida:", err instanceof Error ? err.message : err);
    // Solo desarrollo local: si falla la firma, parsear sin verificar (p. ej. secret distinto al del forwarder).
    if (process.env.NODE_ENV !== "production") {
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
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
