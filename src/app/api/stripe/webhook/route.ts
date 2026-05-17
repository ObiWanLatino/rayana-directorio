import { handleStripeWebhookPost } from "@/lib/stripe/handle-stripe-webhook-post";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("🔔 Webhook Stripe recibido (POST /api/stripe/webhook)");
  return handleStripeWebhookPost(request);
}
