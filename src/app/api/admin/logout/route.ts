import {
  adminSessionCookieOptions,
  revokeAdminSessionToken,
} from "@/lib/admin/admin-session";
import { isAdminRequestHost } from "@/lib/admin/request-host";
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

  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;

  await revokeAdminSessionToken(token);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const response = NextResponse.redirect(
    new URL("/admin-login", request.url),
  );

  response.cookies.set("admin_session", "", {
    ...adminSessionCookieOptions(),
    maxAge: 0,
  });

  if (url && anonKey) {
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
    await supabase.auth.signOut();
  }

  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
