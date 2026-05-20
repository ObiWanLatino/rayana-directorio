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
  destacado?: boolean;
  verificado?: boolean;
  logo_url?: null;
  cover_url?: string | null;
  cover_height?: number | null;
  foto_1_url?: null;
  foto_2_url?: null;
  foto_3_url?: null;
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
  if (body.logo_url !== undefined) {
    if (body.logo_url !== null) {
      return NextResponse.json(
        { error: "logo_url solo puede enviarse como null para quitar" },
        { status: 400 },
      );
    }
    patch.logo_url = null;
  }
  if (body.cover_url !== undefined) {
    if (body.cover_url === null) {
      patch.cover_url = null;
    } else {
      const url = sanitizeHttpUrl(body.cover_url);
      patch.cover_url = url;
    }
  }
  if (body.cover_height !== undefined) {
    if (body.cover_height === null) {
      patch.cover_height = null;
    } else {
      const h = Math.round(Number(body.cover_height));
      if (!Number.isFinite(h) || h < 80 || h > 280) {
        return NextResponse.json(
          { error: "cover_height debe estar entre 80 y 280" },
          { status: 400 },
        );
      }
      patch.cover_height = h;
    }
  }
  for (const col of ["foto_1_url", "foto_2_url", "foto_3_url"] as const) {
    if (body[col] === undefined) continue;
    if (body[col] !== null) {
      return NextResponse.json(
        { error: `${col} solo puede enviarse como null para quitar` },
        { status: 400 },
      );
    }
    patch[col] = null;
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
