import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FeaturedEventType } from "@/types/proveedores";

export const dynamic = "force-dynamic";

const EVENT_TYPES: FeaturedEventType[] = [
  "view",
  "wa_click",
  "catalog_click",
  "profile_click",
];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type TrackBody = {
  supplier_id?: string;
  event_type?: string;
  session_id?: string | null;
  pais_codigo?: string | null;
};

export async function POST(request: Request) {
  let body: TrackBody;
  try {
    body = (await request.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const supplierId = body.supplier_id?.trim() ?? "";
  const eventType = body.event_type?.trim() ?? "";

  if (!UUID_RE.test(supplierId) || !EVENT_TYPES.includes(eventType as FeaturedEventType)) {
    return NextResponse.json({ ok: true });
  }

  const paisRaw = body.pais_codigo?.trim();
  const pais_codigo = paisRaw === "55" || paisRaw === "56" ? paisRaw : null;
  const session_id =
    typeof body.session_id === "string" && body.session_id.length > 0
      ? body.session_id.slice(0, 128)
      : null;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("featured_supplier_events").insert({
      supplier_id: supplierId,
      event_type: eventType,
      user_id: user?.id ?? null,
      session_id,
      pais_codigo,
    });
  } catch {
    // fire-and-forget
  }

  return NextResponse.json({ ok: true });
}
