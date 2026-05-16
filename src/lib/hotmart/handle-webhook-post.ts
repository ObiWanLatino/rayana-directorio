import { after, NextResponse } from "next/server";
import type { HotmartWebhookEvent } from "@/lib/hotmart/types";
import { dispatchHotmartBusinessEvent } from "@/lib/hotmart/process-webhook-event";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function isHotmartWebhookEvent(body: unknown): body is HotmartWebhookEvent {
  if (!body || typeof body !== "object") return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.event === "string" &&
    o.data !== null &&
    typeof o.data === "object"
  );
}

async function finalizeWebhookRow(
  eventId: string,
  status: "processed" | "failed",
  errorMessage?: string,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("hotmart_webhook_events")
    .update({
      status,
      processed_at: new Date().toISOString(),
      error_message: errorMessage ?? null,
    })
    .eq("id", eventId);
  if (error) {
    console.error("Hotmart webhook: no se pudo actualizar fila de evento", error);
  }
}

export async function processHotmartWebhookPayload(
  event: HotmartWebhookEvent,
): Promise<void> {
  try {
    await dispatchHotmartBusinessEvent(event);
    await finalizeWebhookRow(event.id, "processed");
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Hotmart webhook process error", message);
    await finalizeWebhookRow(event.id, "failed", message);
  }
}

export async function handleHotmartWebhookPost(
  request: Request,
): Promise<Response> {
  const hottok = request.headers.get("X-Hotmart-Hottok");
  if (!hottok || hottok !== process.env.HOTMART_HOTTOK) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isHotmartWebhookEvent(body)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const event = body;
  const admin = createAdminSupabaseClient();

  const { error: insertError } = await admin.from("hotmart_webhook_events").insert({
    id: event.id,
    event_type: event.event,
    status: "pending",
    payload: JSON.parse(JSON.stringify(event)) as object,
  });

  if (insertError?.code === "23505") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  if (insertError) {
    console.error("Hotmart webhook insert", insertError);
    return NextResponse.json(
      { error: "Could not record event" },
      { status: 500 },
    );
  }

  after(() => processHotmartWebhookPayload(event));

  return NextResponse.json({ ok: true });
}
