import { handleHotmartWebhookPost } from "@/lib/hotmart/handle-webhook-post";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleHotmartWebhookPost(request);
}
