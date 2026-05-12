import { NextResponse, type NextRequest } from "next/server";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types";

export const dynamic = "force-dynamic";

function resolvePaisCodigo(searchParams: URLSearchParams): string {
  const raw = searchParams.get("pais_codigo")?.trim();
  if (raw === "55" || raw === "56") return raw;
  return "56";
}

export async function GET(request: NextRequest) {
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

  const pais_codigo = resolvePaisCodigo(request.nextUrl.searchParams);

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("activo", true)
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suppliers: (data ?? []) as Supplier[] });
}
