import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  SupplierFeaturedProfileSummary,
  SupplierWithFeaturedProfile,
} from "@/types/proveedores";

export const dynamic = "force-dynamic";

function resolvePaisCodigo(searchParams: URLSearchParams): string {
  const raw = searchParams.get("pais_codigo")?.trim();
  if (raw === "55" || raw === "56") return raw;
  return "56";
}

export async function GET(request: NextRequest) {
  const pais_codigo = resolvePaisCodigo(request.nextUrl.searchParams);
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*, supplier_profiles(cover_url, plan, badge)")
    .eq("activo", true)
    .eq("destacado", true)
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as (SupplierWithFeaturedProfile & {
    supplier_profiles?:
      | SupplierFeaturedProfileSummary
      | SupplierFeaturedProfileSummary[]
      | null;
  })[];

  const suppliers: SupplierWithFeaturedProfile[] = rows.map((row) => {
    const raw = row.supplier_profiles;
    const summary = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
    return { ...row, supplier_profiles: summary };
  });

  return NextResponse.json({ suppliers });
}
