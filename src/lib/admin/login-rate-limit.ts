import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export const ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES = 10;

const RATE_LIMIT_MESSAGE = "Demasiados intentos. Espera 15 minutos.";

export function adminLoginRateLimitResponse(): NextResponse {
  return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
}

export async function countRecentFailedLoginAttempts(ip: string): Promise<number> {
  const since = new Date(Date.now() - ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS).toISOString();
  const admin = createAdminSupabaseClient();

  const { count, error } = await admin
    .from("admin_access_log")
    .select("id", { count: "exact", head: true })
    .eq("ip_address", ip)
    .eq("action", "LOGIN_FAIL")
    .gte("created_at", since);

  if (error) {
    return 0;
  }

  return count ?? 0;
}

export async function isAdminLoginRateLimited(ip: string): Promise<boolean> {
  const failures = await countRecentFailedLoginAttempts(ip);
  return failures >= ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES;
}

export async function logAdminLoginRateLimited(
  ip: string,
  userAgent: string,
  email = "",
): Promise<void> {
  try {
    const admin = createAdminSupabaseClient();
    await admin.from("admin_access_log").insert({
      email: email || null,
      user_id: null,
      action: "RATE_LIMITED",
      ip_address: ip,
      user_agent: userAgent,
      success: false,
      reason: "Rate limit exceeded",
    });
  } catch {
    /* ignore */
  }
}

/**
 * Returns a 429 response when the IP exceeded failed login attempts in the window.
 */
export async function enforceAdminLoginRateLimit(
  ip: string,
  userAgent: string,
  email = "",
): Promise<NextResponse | null> {
  if (!(await isAdminLoginRateLimited(ip))) {
    return null;
  }

  await logAdminLoginRateLimited(ip, userAgent, email);
  return adminLoginRateLimitResponse();
}
