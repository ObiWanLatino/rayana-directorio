import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_BYTES = 2 * 1024 * 1024;

const FOTO_COL = {
  "1": "foto_1_url",
  "2": "foto_2_url",
  "3": "foto_3_url",
} as const;

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const supplierIdRaw = form.get("supplier_id");
  const fotoIndexRaw = form.get("foto_index");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }

  const supplierId =
    typeof supplierIdRaw === "string" ? supplierIdRaw.trim() : "";
  if (!UUID_RE.test(supplierId)) {
    return NextResponse.json(
      { error: "supplier_id inválido" },
      { status: 400 },
    );
  }

  const fotoIndex =
    typeof fotoIndexRaw === "string" ? fotoIndexRaw.trim() : "";
  if (fotoIndex !== "1" && fotoIndex !== "2" && fotoIndex !== "3") {
    return NextResponse.json(
      { error: "foto_index debe ser 1, 2 o 3" },
      { status: 400 },
    );
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
    .from("suppliers")
    .select("id")
    .eq("id", supplierId)
    .maybeSingle();

  if (findErr || !existing) {
    return NextResponse.json(
      { error: "Proveedor no encontrado" },
      { status: 404 },
    );
  }

  const path = `${supplierId}/foto_${fotoIndex}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: upErr } = await admin.storage
    .from("supplier-photos")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (upErr) {
    return NextResponse.json({ error: upErr.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("supplier-photos").getPublicUrl(path);

  const col = FOTO_COL[fotoIndex];
  const now = new Date().toISOString();
  const versionedUrl = `${publicUrl}?v=${encodeURIComponent(now)}`;
  const { error: updErr } = await admin
    .from("suppliers")
    .update({ [col]: versionedUrl, updated_at: now })
    .eq("id", supplierId);

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({ url: versionedUrl });
}
