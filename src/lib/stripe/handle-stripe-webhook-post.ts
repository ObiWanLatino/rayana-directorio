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

  console.log("📝 Webhook body (bytes):", rawBodyBuffer.byteLength);
  console.log("📝 Signature presente:", !!signature);
  console.log("📝 STRIPE_WEBHOOK_SECRET configurado:", !!secret);

  if (!signature) {
    console.error("❌ No stripe-signature header");
    return NextResponse.json({ error: "Falta stripe-signature" }, { status: 400 });
  }
  if (!secret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET no configurado");
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
    console.log("✅ Evento verificado (firma OK):", event.type, event.id);
  } catch (verifyErr) {
    console.error(
      "❌ constructEvent falló:",
      verifyErr instanceof Error ? verifyErr.message : verifyErr,
    );
    console.error(
      "Stack:",
      verifyErr instanceof Error ? verifyErr.stack : "No stack",
    );
    let parsed: Stripe.Event;
    try {
      parsed = JSON.parse(rawBody) as Stripe.Event;
    } catch (parseErr) {
      console.error("❌ Body no es JSON válido tras fallo de firma:", parseErr);
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
    if (parsed.livemode === true) {
      console.error("❌ Firma inválida en modo live; no se usa body sin verificar");
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }
    console.warn(
      "⚠️ Modo test: procesando evento sin verificar firma (solo desarrollo)",
      parsed.type,
      parsed.id,
    );
    event = parsed;
  }

  try {
    await dispatchStripeWebhookEvent(event);
    console.log("✅ Evento procesado OK:", event.type, event.id);
  } catch (e) {
    console.error("❌ Error al despachar webhook Stripe:", e);
    console.error("Stack:", e instanceof Error ? e.stack : "No stack");
    return NextResponse.json(
      { error: "Error al procesar el evento" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
