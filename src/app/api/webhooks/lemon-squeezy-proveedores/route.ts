import { processLemonSqueezyProveedoresWebhook } from "@/lib/proveedores/lemon-proveedores-webhook";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy/verify-webhook-signature";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET_PROVEEDORES?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 500 },
    );
  }

  const rawBody = await request.text();
  const signature =
    request.headers.get("x-signature") ?? request.headers.get("X-Signature");

  if (!verifyLemonSqueezyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    await processLemonSqueezyProveedoresWebhook(body);
  } catch (e) {
    console.error("Lemon proveedores webhook", e);
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
