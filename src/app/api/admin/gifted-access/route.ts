import { notifyGiftedAccessByEmail } from "@/lib/email/send-gifted-access-email";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { giftedAccessTable } from "@/lib/supabase/gifted-access-client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type GrantBody = {
  user_id?: string;
  reason?: string | null;
  expires_at?: string | null;
};

type RevokeBody = {
  gifted_access_id?: string;
};

async function findActiveGiftedForUser(userId: string) {
  const now = new Date().toISOString();
  return giftedAccessTable()
    .select("id")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .maybeSingle();
}

export async function GET(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = new URL(request.url).searchParams.get("user_id")?.trim();
  const now = new Date().toISOString();

  let query = giftedAccessTable()
    .select(
      "id, user_id, reason, expires_at, created_at, granted_by, profiles:user_id (email)",
    )
    .is("revoked_at", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((row) => {
    const profile = row.profiles as { email?: string | null } | null;
    return {
      id: row.id,
      user_id: row.user_id,
      email: profile?.email ?? null,
      reason: row.reason,
      expires_at: row.expires_at,
      created_at: row.created_at,
      granted_by: row.granted_by,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: GrantBody;
  try {
    body = (await request.json()) as GrantBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  try {
    const userId = body.user_id?.trim();
    if (!userId) {
      return NextResponse.json({ error: "user_id es requerido" }, { status: 400 });
    }

    const expiresAt =
      body.expires_at === undefined || body.expires_at === null || body.expires_at === ""
        ? null
        : body.expires_at;

    if (expiresAt !== null && Number.isNaN(Date.parse(expiresAt))) {
      return NextResponse.json({ error: "expires_at inválido" }, { status: 400 });
    }

    const existing = await findActiveGiftedForUser(userId);
    if (existing.data) {
      return NextResponse.json(
        { error: "El usuario ya tiene un obsequio activo" },
        { status: 409 },
      );
    }

    const admin = createAdminSupabaseClient();
    const { data: inserted, error } = await giftedAccessTable()
      .insert({
        user_id: userId,
        granted_by: adminUser.id,
        reason: body.reason?.trim() || null,
        expires_at: expiresAt,
      })
      .select("id, user_id, expires_at, created_at")
      .single();

    if (error || !inserted) {
      console.error(
        "[gifted-access POST]",
        error instanceof Error ? error.message : JSON.stringify(error),
      );
      return NextResponse.json(
        { error: error?.message ?? "No se pudo crear el obsequio" },
        { status: 500 },
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.email) {
      notifyGiftedAccessByEmail({
        to: profile.email,
        expiresAt: inserted.expires_at,
        reason: body.reason,
      });
    }

    return NextResponse.json({
      id: inserted.id,
      user_id: inserted.user_id,
      expires_at: inserted.expires_at,
      created_at: inserted.created_at,
    });
  } catch (error) {
    console.error(
      "[gifted-access POST]",
      error instanceof Error ? error.message : JSON.stringify(error),
    );
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: RevokeBody;
  try {
    body = (await request.json()) as RevokeBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const giftedAccessId = body.gifted_access_id?.trim();
  if (!giftedAccessId) {
    return NextResponse.json(
      { error: "gifted_access_id es requerido" },
      { status: 400 },
    );
  }

  const { error } = await giftedAccessTable()
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", giftedAccessId)
    .is("revoked_at", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ revoked: true });
}
