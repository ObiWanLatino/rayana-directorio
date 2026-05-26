import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAdminUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { id } = await params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = (await request.json()) as { foto_url?: string | null };
    if (!("foto_url" in body)) {
      return NextResponse.json({ error: "foto_url requerido" }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const now = new Date().toISOString();
    const { error } = await admin
      .from("categories")
      .update({ foto_url: body.foto_url, updated_at: now })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[PATCH /api/admin/categories/[id]]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
