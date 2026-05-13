import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import {
  sanitizeCategoria,
  sanitizeHttpUrl,
  sanitizeInstagram,
  sanitizeOptionalText,
  sanitizeTienda,
  sanitizeWhatsapp,
} from "@/lib/utils/sanitize";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Supplier } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const paisRaw = searchParams.get("pais_codigo")?.trim() ?? "56";
  const pais_codigo = /^\d+$/.test(paisRaw) ? paisRaw : "56";

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("suppliers")
    .select("*")
    .eq("pais_codigo", pais_codigo)
    .order("codigo", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let list = (data ?? []) as Supplier[];
  if (q) {
    list = list.filter(
      (s) =>
        s.tienda.toLowerCase().includes(q) ||
        (s.categoria?.toLowerCase().includes(q) ?? false) ||
        (s.direccion?.toLowerCase().includes(q) ?? false) ||
        (s.tipo?.toLowerCase().includes(q) ?? false) ||
        (s.observacion?.toLowerCase().includes(q) ?? false) ||
        String(s.codigo).includes(q),
    );
  }

  return NextResponse.json({ suppliers: list });
}

type PostBody = {
  codigo: number;
  tienda: string;
  instagram?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  maps_url?: string | null;
  categoria?: string | null;
  direccion?: string | null;
  tipo: string;
  observacion?: string | null;
  whatsapp?: string | null;
  activo?: boolean;
  pais_codigo?: string;
};

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const codigo = Number(body.codigo);
  if (!Number.isInteger(codigo)) {
    return NextResponse.json({ error: "codigo inválido" }, { status: 400 });
  }

  const tienda = sanitizeTienda(body.tienda);
  if (!tienda) {
    return NextResponse.json({ error: "tienda es requerido" }, { status: 400 });
  }

  const tipoSan = sanitizeOptionalText(body.tipo);
  if (!tipoSan) {
    return NextResponse.json({ error: "tipo es requerido" }, { status: 400 });
  }

  const pais = body.pais_codigo?.trim() ?? "56";
  if (!/^\d+$/.test(pais)) {
    return NextResponse.json(
      { error: "pais_codigo debe ser numérico" },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();
  const { data: dup } = await admin
    .from("suppliers")
    .select("id")
    .eq("codigo", codigo)
    .eq("pais_codigo", pais)
    .maybeSingle();

  if (dup) {
    return NextResponse.json(
      { error: "Ya existe un proveedor con ese código" },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const insert = {
    codigo,
    tienda,
    instagram: sanitizeInstagram(body.instagram),
    instagram_url: sanitizeHttpUrl(body.instagram_url),
    tiktok_url: sanitizeHttpUrl(body.tiktok_url),
    maps_url: sanitizeHttpUrl(body.maps_url),
    categoria: sanitizeCategoria(body.categoria),
    direccion: sanitizeOptionalText(body.direccion),
    tipo: tipoSan,
    observacion: sanitizeOptionalText(body.observacion),
    whatsapp: sanitizeWhatsapp(body.whatsapp),
    activo: body.activo !== false,
    pais_codigo: pais,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await admin
    .from("suppliers")
    .insert(insert)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ supplier: data as Supplier }, { status: 201 });
}

type PatchBody = {
  codigo: number;
  tienda?: string;
  instagram?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  maps_url?: string | null;
  categoria?: string | null;
  direccion?: string | null;
  tipo?: string | null;
  observacion?: string | null;
  whatsapp?: string | null;
  activo?: boolean;
};

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const codigo = Number(body.codigo);
  if (!Number.isInteger(codigo)) {
    return NextResponse.json({ error: "codigo inválido" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.tienda !== undefined) {
    patch.tienda = sanitizeTienda(body.tienda);
    if (!patch.tienda) {
      return NextResponse.json(
        { error: "tienda no puede estar vacío" },
        { status: 400 },
      );
    }
  }
  if (body.instagram !== undefined) {
    patch.instagram =
      body.instagram === null
        ? null
        : sanitizeInstagram(body.instagram);
  }
  if (body.instagram_url !== undefined) {
    patch.instagram_url =
      body.instagram_url === null
        ? null
        : sanitizeHttpUrl(body.instagram_url);
  }
  if (body.tiktok_url !== undefined) {
    patch.tiktok_url =
      body.tiktok_url === null ? null : sanitizeHttpUrl(body.tiktok_url);
  }
  if (body.maps_url !== undefined) {
    patch.maps_url =
      body.maps_url === null ? null : sanitizeHttpUrl(body.maps_url);
  }
  if (body.categoria !== undefined) {
    patch.categoria =
      body.categoria === null
        ? null
        : sanitizeCategoria(body.categoria);
  }
  if (body.direccion !== undefined) {
    patch.direccion =
      body.direccion === null
        ? null
        : sanitizeOptionalText(body.direccion);
  }
  if (body.tipo !== undefined) {
    patch.tipo =
      body.tipo === null ? null : sanitizeOptionalText(body.tipo);
  }
  if (body.observacion !== undefined) {
    patch.observacion =
      body.observacion === null
        ? null
        : sanitizeOptionalText(body.observacion);
  }
  if (body.whatsapp !== undefined) {
    patch.whatsapp =
      body.whatsapp === null
        ? null
        : sanitizeWhatsapp(body.whatsapp);
  }
  if (body.activo !== undefined) {
    patch.activo = Boolean(body.activo);
  }

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json(
      { error: "No hay campos para actualizar" },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("suppliers")
    .update(patch)
    .eq("codigo", codigo)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "Proveedor no encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ supplier: data as Supplier });
}
