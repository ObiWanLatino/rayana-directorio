import { NextResponse } from "next/server";
import { processLemonSqueezyWebhook } from "@/lib/lemonsqueezy/process-webhook";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy/verify-webhook-signature";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-signature") ?? request.headers.get("X-Signature");

  if (!verifyLemonSqueezyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    await processLemonSqueezyWebhook(body);
  } catch (e) {
    console.error("Lemon Squeezy webhook handler error", e);
    return NextResponse.json(
      { error: "Error al procesar el evento" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
