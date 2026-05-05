import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type SuspendBody = {
  user_id?: string;
  suspended?: boolean;
};

export async function POST(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: SuspendBody;
  try {
    body = (await request.json()) as SuspendBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const userId = body.user_id?.trim();
  if (!userId) {
    return NextResponse.json({ error: "user_id es requerido" }, { status: 400 });
  }
  if (typeof body.suspended !== "boolean") {
    return NextResponse.json(
      { error: "suspended debe ser boolean" },
      { status: 400 },
    );
  }

  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("profiles")
    .update({
      suspended: body.suspended,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
