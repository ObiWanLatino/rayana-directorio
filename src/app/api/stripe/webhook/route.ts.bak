import { handleStripeWebhookPost } from "@/lib/stripe/handle-stripe-webhook-post";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("Webhook received", {
    hasSignature: !!request.headers.get("stripe-signature"),
    hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    secretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 10),
  });
  return handleStripeWebhookPost(request);
}
