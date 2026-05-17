import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 8;

export function generateAdminSessionToken(): string {
  return (
    crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "")
  );
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
    path: "/",
  };
}

export async function createAdminSession(userId: string): Promise<string> {
  const token = generateAdminSessionToken();
  const expiresAt = new Date(
    Date.now() + ADMIN_SESSION_MAX_AGE_SEC * 1000,
  ).toISOString();

  const svc = createAdminSupabaseClient();
  const { error } = await svc.from("admin_sessions").insert({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`Failed to create admin session: ${error.message}`);
  }

  return token;
}

export async function resolveAdminSessionToken(
  token: string | undefined | null,
): Promise<{ user_id: string } | null> {
  if (!token) return null;

  const svc = createAdminSupabaseClient();
  const { data, error } = await svc
    .from("admin_sessions")
    .select("user_id")
    .eq("token", token)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

export async function revokeAdminSessionToken(
  token: string | undefined | null,
): Promise<void> {
  if (!token) return;

  const svc = createAdminSupabaseClient();
  await svc
    .from("admin_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token", token)
    .is("revoked_at", null);
}
