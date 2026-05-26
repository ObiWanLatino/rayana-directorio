import { NextResponse, type NextRequest } from "next/server";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { UNCATEGORIZED } from "@/components/suppliers/supplier-utils";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  SupplierProfileSummary,
  SupplierWithProfile,
} from "@/types/proveedores";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function resolvePaisCodigo(searchParams: URLSearchParams): string {
  const raw =
    searchParams.get("pais_codigo")?.trim() ??
    searchParams.get("pais")?.trim();
  if (raw === "55" || raw === "56") return raw;
  return "56";
}

function mapSuppliers(
  rows: (SupplierWithProfile & {
    supplier_profiles?: SupplierProfileSummary | SupplierProfileSummary[] | null;
  })[],
): SupplierWithProfile[] {
  return rows.map((row) => {
    const raw = row.supplier_profiles;
    const summary = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
    return { ...row, supplier_profiles: summary };
  });
}

function applySearchFilter<
  T extends {
    eq: (col: string, val: number) => T;
    or: (filters: string) => T;
    ilike: (col: string, pattern: string) => T;
  },
>(query: T, q: string): T {
  const trimmed = q.trim();
  if (!trimmed) return query;

  const num = trimmed.replace(/^#/, "");
  if (/^\d+$/.test(num)) {
    return query.eq("codigo", Number.parseInt(num, 10));
  }

  const escaped = trimmed.replace(/[%_,]/g, "");
  return query.or(
    `tienda.ilike.%${escaped}%,categoria.ilike.%${escaped}%`,
  );
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

  const { searchParams } = request.nextUrl;
  const pais_codigo = resolvePaisCodigo(searchParams);
  const page = Math.max(0, Number.parseInt(searchParams.get("page") ?? "0", 10) || 0);
  const categoria = searchParams.get("categoria")?.trim() ?? "";
  const q = searchParams.get("q")?.trim() ?? "";

  let query = supabase
    .from("suppliers")
    .select("*, supplier_profiles (plan, badge, onboarding_completed)", {
      count: "exact",
    })
    .eq("activo", true)
    .eq("destacado", false)
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

  if (categoria === UNCATEGORIZED) {
    query = query.is("categoria", null);
  } else if (categoria) {
    query = query.eq("categoria", categoria);
  }

  query = applySearchFilter(query, q);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suppliers = mapSuppliers(
    (data ?? []) as (SupplierWithProfile & {
      supplier_profiles?: SupplierProfileSummary | SupplierProfileSummary[] | null;
    })[],
  );

  const total = count ?? 0;

  return NextResponse.json(
    {
      data: suppliers,
      count: total,
      hasMore: (page + 1) * PAGE_SIZE < total,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
