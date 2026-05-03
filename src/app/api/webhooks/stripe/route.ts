import { handleStripeWebhookPost } from "@/lib/stripe/handle-stripe-webhook-post";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleStripeWebhookPost(request);
}
