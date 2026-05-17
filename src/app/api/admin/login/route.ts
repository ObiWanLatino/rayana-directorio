import {
  adminSessionCookieOptions,
  createAdminSession,
} from "@/lib/admin/admin-session";
import { constantTimeStringEqual } from "@/lib/admin/constant-time";
import { isAdminRequestHost } from "@/lib/admin/request-host";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const headerStore = await headers();
  const rawHost =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!isAdminRequestHost(rawHost)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  if (!ADMIN_SECRET) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  let body: { email?: string; password?: string; secret?: string };
  try {
    body = (await request.json()) as {
      email?: string;
      password?: string;
      secret?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = body.email?.trim() ?? "";
  const password = body.password ?? "";
  const secret = body.secret ?? "";

  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const response = NextResponse.json({ success: true });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const admin = createAdminSupabaseClient();

  async function logAttempt(row: {
    email: string;
    user_id?: string | null;
    action: string;
    success: boolean;
    reason: string | null;
  }) {
    try {
      await admin.from("admin_access_log").insert({
        email: row.email,
        user_id: row.user_id ?? null,
        action: row.action,
        ip_address: ip,
        user_agent: userAgent,
        success: row.success,
        reason: row.reason,
      });
    } catch {
      /* ignore */
    }
  }

  if (!constantTimeStringEqual(secret, ADMIN_SECRET)) {
    await logAttempt({
      email: emailRaw,
      action: "LOGIN_ATTEMPT",
      success: false,
      reason: "Invalid admin secret",
    });
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  const email = emailRaw.toLowerCase();
  const { data: adminUser } = await admin
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!adminUser) {
    await logAttempt({
      email,
      action: "LOGIN_ATTEMPT",
      success: false,
      reason: "Email not in admin whitelist",
    });
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await logAttempt({
      email,
      action: "LOGIN_ATTEMPT",
      success: false,
      reason: "Invalid Supabase credentials",
    });
    return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const { data: adminUser2 } = await admin
    .from("admin_users")
    .select("email")
    .eq("email", data.user.email?.trim().toLowerCase() ?? "")
    .eq("active", true)
    .maybeSingle();

  if (!adminUser2) {
    await supabase.auth.signOut();
    await logAttempt({
      email,
      user_id: data.user.id,
      action: "LOGIN_ATTEMPT",
      success: false,
      reason: "User not in admin whitelist after auth",
    });
    return NextResponse.json({ error: "Acceso denegado" }, { status: 401 });
  }

  await logAttempt({
    email,
    user_id: data.user.id,
    action: "LOGIN_SUCCESS",
    success: true,
    reason: null,
  });

  let sessionToken: string;
  try {
    sessionToken = await createAdminSession(data.user.id);
  } catch {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "No se pudo crear la sesión" },
      { status: 500 },
    );
  }

  response.cookies.set("admin_session", sessionToken, adminSessionCookieOptions());

  return response;
}
