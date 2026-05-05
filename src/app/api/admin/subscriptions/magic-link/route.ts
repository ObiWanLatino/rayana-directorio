import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type MagicLinkBody = {
  email?: string;
};

export async function POST(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body: MagicLinkBody;
  try {
    body = (await request.json()) as MagicLinkBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email es requerido" }, { status: 400 });
  }

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const magicLink = data.properties?.action_link;
  if (!magicLink) {
    return NextResponse.json(
      { error: "No se pudo generar magic link" },
      { status: 500 },
    );
  }

  return NextResponse.json({ magic_link: magicLink });
}
