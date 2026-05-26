import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_BYTES = 2 * 1024 * 1024;

function slugifyNombre(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

export async function POST(request: Request) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const fd = await request.formData();
    const file = fd.get("file");
    const nombreRaw = fd.get("nombre");
    const idRaw = fd.get("id");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
    }

    const nombre =
      typeof nombreRaw === "string" ? nombreRaw.trim() : "";
    if (!nombre) {
      return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Máximo 2 MB por imagen" },
        { status: 400 },
      );
    }

    const id = typeof idRaw === "string" && UUID_RE.test(idRaw.trim())
      ? idRaw.trim()
      : null;

    const admin = createAdminSupabaseClient();
    const path = `categorias/${slugifyNombre(nombre)}-${Date.now()}.jpg`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type.startsWith("image/") ? file.type : "image/jpeg";

    const { error: uploadError } = await admin.storage
      .from("category-photos")
      .upload(path, buffer, { contentType, upsert: true });

    if (uploadError) {
      console.error("[POST /api/admin/upload-category-photo]", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("category-photos").getPublicUrl(path);

    const now = new Date().toISOString();
    const foto_url = `${publicUrl}?v=${encodeURIComponent(now)}`;

    if (id) {
      const { error: updErr } = await admin
        .from("categories")
        .update({ foto_url, updated_at: now })
        .eq("id", id);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      return NextResponse.json({ foto_url, id });
    }

    const { data: existing } = await admin
      .from("categories")
      .select("id, emoji, orden")
      .eq("nombre", nombre)
      .maybeSingle();

    if (existing?.id) {
      const { error: updErr } = await admin
        .from("categories")
        .update({ foto_url, updated_at: now })
        .eq("id", existing.id);

      if (updErr) {
        return NextResponse.json({ error: updErr.message }, { status: 400 });
      }

      return NextResponse.json({ foto_url, id: existing.id });
    }

    const { data: inserted, error: insErr } = await admin
      .from("categories")
      .insert({
        nombre,
        foto_url,
        emoji: "📦",
        orden: 999,
        activo: true,
        updated_at: now,
      })
      .select("id")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 400 });
    }

    return NextResponse.json({ foto_url, id: inserted.id });
  } catch (e) {
    console.error("[POST /api/admin/upload-category-photo] unhandled:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
