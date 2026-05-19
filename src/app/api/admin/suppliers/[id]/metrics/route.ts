import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { FeaturedEventType, FeaturedSupplierMetrics } from "@/types/proveedores";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMPTY_METRICS: FeaturedSupplierMetrics = {
  view: 0,
  wa_click: 0,
  catalog_click: 0,
  profile_click: 0,
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 30);

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("featured_supplier_events")
    .select("event_type")
    .eq("supplier_id", id)
    .gte("created_at", since.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const metrics: FeaturedSupplierMetrics = { ...EMPTY_METRICS };
  for (const row of data ?? []) {
    const t = row.event_type as FeaturedEventType;
    if (t in metrics) {
      metrics[t] += 1;
    }
  }

  return NextResponse.json({ metrics });
}
