import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const form = await request.formData();
    const file = form.get("file");
    const categoryIdRaw = form.get("category_id");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
    }

    const categoryId =
      typeof categoryIdRaw === "string" ? categoryIdRaw.trim() : "";
    if (!UUID_RE.test(categoryId)) {
      return NextResponse.json({ error: "category_id inválido" }, { status: 400 });
    }

    const ext = ALLOWED.get(file.type);
    if (!ext) {
      return NextResponse.json(
        { error: "Solo JPG, PNG o WEBP" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Máximo 2 MB por imagen" },
        { status: 400 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data: existing, error: findErr } = await admin
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 },
      );
    }

    const path = `${categoryId}/cover.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await admin.storage
      .from("category-photos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (upErr) {
      console.error("[POST /api/admin/upload-category-photo]", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 400 });
    }

    const {
      data: { publicUrl },
    } = admin.storage.from("category-photos").getPublicUrl(path);

    const now = new Date().toISOString();
    const versionedUrl = `${publicUrl}?v=${encodeURIComponent(now)}`;
    const { error: updErr } = await admin
      .from("categories")
      .update({ foto_url: versionedUrl, updated_at: now })
      .eq("id", categoryId);

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    return NextResponse.json({ foto_url: versionedUrl });
  } catch (error) {
    console.error("[POST /api/admin/upload-category-photo] unhandled:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error) },
      { status: 500 },
    );
  }
}
