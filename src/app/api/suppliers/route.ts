import { NextResponse } from "next/server";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) {
    return NextResponse.json({ error: "Suscripción requerida" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("activo", true)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suppliers: (data ?? []) as Supplier[] });
}
