import { resolveAdminSessionToken } from "@/lib/admin/admin-session";
import { isAdminRequestHost } from "@/lib/admin/request-host";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

function logAccess(row: {
  email?: string | null;
  user_id?: string | null;
  action: string;
  ip_address?: string | null;
  user_agent?: string | null;
  success: boolean;
  reason?: string | null;
}) {
  void (async () => {
    try {
      const svc = createAdminSupabaseClient();
      await svc.from("admin_access_log").insert(row);
    } catch {
      /* ignore */
    }
  })();
}

function unauthorizedResponse(
  request: NextRequest,
  isApi: boolean,
  error: "invalid_session" | "login",
): NextResponse {
  if (isApi) {
    const out = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    out.cookies.delete("admin_session");
    return out;
  }
  const query = error === "invalid_session" ? "?error=invalid_session" : "";
  const out = NextResponse.redirect(
    new URL(`/admin-login${query}`, request.url),
  );
  out.cookies.delete("admin_session");
  return out;
}

/**
 * Request handling when Host is the dedicated admin hostname (e.g. admin.makeray.cl).
 * Next.js 16 uses `src/proxy.ts` instead of `middleware.ts`.
 */
export async function handleAdminHostnameRequest(
  request: NextRequest,
  pathname: string,
): Promise<NextResponse> {
  const env = getSupabaseEnv();
  if (!env) {
    return new NextResponse("Supabase env missing", { status: 503 });
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) {
    return new NextResponse("Service role missing", { status: 503 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = request.headers.get("user-agent") ?? "unknown";

  if (pathname === "/api/admin/login" || pathname.startsWith("/api/admin/login/")) {
    return NextResponse.next({ request });
  }
  if (pathname === "/api/admin/logout" || pathname.startsWith("/api/admin/logout/")) {
    return NextResponse.next({ request });
  }
  if (pathname === "/admin-login" || pathname.startsWith("/admin-login/")) {
    return NextResponse.next({ request });
  }

  const isApi = pathname.startsWith("/api/");
  const rewriteTargetPath = `/admin${pathname === "/" ? "" : pathname}`;
  const rewriteUrl = new URL(rewriteTargetPath, request.url);

  let res: NextResponse;
  if (isApi) {
    res = NextResponse.next({ request });
  } else {
    res = NextResponse.rewrite(rewriteUrl, { request });
  }

  const sessionToken = request.cookies.get("admin_session")?.value;
  const adminSession = await resolveAdminSessionToken(sessionToken);
  if (!adminSession) {
    return unauthorizedResponse(request, isApi, "invalid_session");
  }

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || user.id !== adminSession.user_id) {
    return unauthorizedResponse(request, isApi, "login");
  }

  const email = user.email.trim().toLowerCase();
  const svc = createAdminSupabaseClient();

  const { data: adminUser } = await svc
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!adminUser) {
    logAccess({
      email,
      user_id: user.id,
      action: "ACCESS_DENIED",
      ip_address: ip,
      user_agent: ua,
      success: false,
      reason: "Email not in admin whitelist",
    });
    if (isApi) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const out = NextResponse.redirect(
      new URL("/admin-login?error=unauthorized", request.url),
    );
    out.cookies.delete("admin_session");
    return out;
  }

  return res;
}
