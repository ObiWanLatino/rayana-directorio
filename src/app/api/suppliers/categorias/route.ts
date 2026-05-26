import { NextResponse, type NextRequest } from "next/server";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { fetchSupplierCategorias } from "@/lib/suppliers/fetch-supplier-categorias";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function resolvePaisCodigo(searchParams: URLSearchParams): string {
  const raw =
    searchParams.get("pais_codigo")?.trim() ??
    searchParams.get("pais")?.trim();
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

  try {
    const { total, rows } = await fetchSupplierCategorias(supabase, pais_codigo);
    return NextResponse.json(
      { total, categorias: rows },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error al cargar categorías" },
      { status: 500 },
    );
  }
}
