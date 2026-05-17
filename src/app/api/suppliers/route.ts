import { NextResponse, type NextRequest } from "next/server";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  SupplierProfileSummary,
  SupplierWithProfile,
} from "@/types/proveedores";

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

  if (!(await userHasListAccess(supabase, user.id))) {
    return NextResponse.json({ error: "Suscripción requerida" }, { status: 403 });
  }

  const pais_codigo = resolvePaisCodigo(request.nextUrl.searchParams);

  const { data, error } = await supabase
    .from("suppliers")
    .select("*, supplier_profiles (plan, badge, onboarding_completed)")
    .eq("activo", true)
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as (SupplierWithProfile & {
    supplier_profiles?: SupplierProfileSummary | SupplierProfileSummary[] | null;
  })[];

  const suppliers: SupplierWithProfile[] = rows.map((row) => {
    const raw = row.supplier_profiles;
    const summary = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
    return { ...row, supplier_profiles: summary };
  });

  return NextResponse.json({ suppliers });
}
