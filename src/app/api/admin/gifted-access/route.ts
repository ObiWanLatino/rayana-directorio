import { notifyGiftedAccessByEmail } from "@/lib/email/send-gifted-access-email";
import { getAdminUser } from "@/lib/auth/require-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  rpcCheckActiveGiftedAccess,
  rpcGetActiveGiftedAccess,
  rpcGrantGiftedAccess,
  rpcRevokeGiftedAccess,
} from "@/lib/supabase/gifted-access-client";
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

export async function GET(request: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const userId = new URL(request.url).searchParams.get("user_id")?.trim() || null;
  const { data: rows, error } = await rpcGetActiveGiftedAccess(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const emailByUserId = new Map<string, string | null>();

  if (userIds.length > 0) {
    const admin = createAdminSupabaseClient();
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("id, email")
      .in("id", userIds);

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    for (const profile of profiles ?? []) {
      emailByUserId.set(profile.id as string, (profile.email as string | null) ?? null);
    }
  }

  const items = rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    email: emailByUserId.get(row.user_id) ?? null,
    reason: row.reason,
    expires_at: row.expires_at,
    created_at: row.created_at,
    granted_by: null,
  }));

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

    const { data: alreadyActive, error: checkError } =
      await rpcCheckActiveGiftedAccess(userId);
    if (checkError) {
      throw checkError;
    }
    if (alreadyActive) {
      return NextResponse.json(
        { error: "El usuario ya tiene un obsequio activo" },
        { status: 409 },
      );
    }

    const { data: inserted, error: grantError } = await rpcGrantGiftedAccess(
      userId,
      adminUser.id,
      body.reason?.trim() || null,
      expiresAt,
    );

    if (grantError || !inserted) {
      console.error("[gifted-access POST] message:", grantError?.message);
      return NextResponse.json(
        { error: grantError?.message ?? "No se pudo crear el obsequio" },
        { status: 500 },
      );
    }

    const admin = createAdminSupabaseClient();
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
    const err = error as any;
    const msg = `code=${err?.code} | message=${err?.message} | hint=${err?.hint} | details=${err?.details}`;
    console.error("[gifted-access POST]", msg);
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

  const { data: revoked, error } = await rpcRevokeGiftedAccess(giftedAccessId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!revoked) {
    return NextResponse.json(
      { error: "Obsequio no encontrado o ya revocado" },
      { status: 404 },
    );
  }

  return NextResponse.json({ revoked: true });
}
