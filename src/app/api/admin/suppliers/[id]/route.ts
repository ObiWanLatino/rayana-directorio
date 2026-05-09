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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

type PatchByIdBody = {
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
  pais_codigo?: string;
  destacado?: boolean;
  verificado?: boolean;
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  let body: PatchByIdBody;
  try {
    body = (await request.json()) as PatchByIdBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
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
    if (body.tipo === null) {
      patch.tipo = null;
    } else {
      const t = sanitizeOptionalText(body.tipo);
      if (!t) {
        return NextResponse.json(
          { error: "tipo no puede estar vacío" },
          { status: 400 },
        );
      }
      patch.tipo = t;
    }
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
  if (body.destacado !== undefined) {
    patch.destacado = Boolean(body.destacado);
  }
  if (body.verificado !== undefined) {
    patch.verificado = Boolean(body.verificado);
  }
  if (body.pais_codigo !== undefined) {
    const p = String(body.pais_codigo).trim();
    if (!/^\d+$/.test(p)) {
      return NextResponse.json(
        { error: "pais_codigo debe ser numérico" },
        { status: 400 },
      );
    }
    patch.pais_codigo = p;
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
    .eq("id", id)
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
