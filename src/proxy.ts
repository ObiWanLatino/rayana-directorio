import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { handleAdminHostnameRequest } from "@/lib/admin/admin-host-proxy";
import { isAdminRequestHost } from "@/lib/admin/request-host";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isStripeWebhookPublic =
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/webhooks/stripe") ||
    pathname.startsWith("/api/lemonsqueezy/webhook") ||
    pathname.startsWith("/api/webhooks/lemon-squeezy-proveedores");

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/unete-proveedor" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/reset-password") ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/auth/confirm") ||
    isStripeWebhookPublic;

  if (isStripeWebhookPublic) {
    return NextResponse.next();
  }

  if (pathname === "/proveedores") {
    return NextResponse.redirect(new URL("/directorio", request.url), {
      status: 308,
    });
  }
  if (pathname.startsWith("/proveedores/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/directorio${pathname.slice("/proveedores".length)}`;
    return NextResponse.redirect(url, { status: 308 });
  }

  const rawHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (isAdminRequestHost(rawHost)) {
    return handleAdminHostnameRequest(request, pathname);
  }

  if (pathname === "/admin-login" || pathname.startsWith("/admin-login/")) {
    return NextResponse.redirect(new URL("/hub", request.url));
  }
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/hub", request.url));
  }
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (user) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRole) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      );
    }
    const admin = createClient(url, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: profile } = await admin
      .from("profiles")
      .select("suspended, last_session_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.suspended) {
      await supabase.auth.signOut();
      const urlLogin = request.nextUrl.clone();
      urlLogin.pathname = "/login";
      urlLogin.searchParams.set("error", "suspended");
      return NextResponse.redirect(urlLogin);
    }

    const currentSessionId = session?.access_token;
    if (
      currentSessionId &&
      profile?.last_session_id &&
      profile.last_session_id !== currentSessionId
    ) {
      await supabase.auth.signOut();
      const urlLogin = request.nextUrl.clone();
      urlLogin.pathname = "/login";
      urlLogin.searchParams.set("error", "session");
      return NextResponse.redirect(urlLogin);
    }
  }

  if (pathname === "/login" && user) {
    const sub = await fetchSubscriptionAccessRow(supabase, user.id);
    const url = request.nextUrl.clone();
    url.pathname = hasSubscriptionAccess(sub) ? "/hub" : "/checkout";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isPublic) {
    return supabaseResponse;
  }

  if (pathname === "/checkout") {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", "/checkout");
      return NextResponse.redirect(url);
    }
    const sub = await fetchSubscriptionAccessRow(supabase, user.id);
    if (hasSubscriptionAccess(sub)) {
      const url = request.nextUrl.clone();
      url.pathname = "/hub";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const requiresSubscription =
    pathname === "/hub" ||
    pathname.startsWith("/hub/") ||
    pathname === "/proveedores" ||
    pathname.startsWith("/proveedores/") ||
    pathname === "/proveedor" ||
    pathname.startsWith("/proveedor/") ||
    pathname === "/directorio" ||
    pathname.startsWith("/directorio/") ||
    pathname === "/fabricantes" ||
    pathname.startsWith("/fabricantes/") ||
    pathname === "/cursos" ||
    pathname.startsWith("/cursos/");

  if (requiresSubscription) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    const sub = await fetchSubscriptionAccessRow(supabase, user.id);
    if (!hasSubscriptionAccess(sub)) {
      const url = request.nextUrl.clone();
      url.pathname = "/checkout";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/proveedor/dashboard")) {
      const { data: prof } = await supabase
        .from("supplier_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!prof?.onboarding_completed) {
        return NextResponse.redirect(
          new URL("/proveedor/onboarding", request.url),
        );
      }
    }

    if (pathname.startsWith("/proveedor/onboarding")) {
      const { data: prof } = await supabase
        .from("supplier_profiles")
        .select("onboarding_completed")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prof?.onboarding_completed) {
        return NextResponse.redirect(
          new URL("/proveedor/dashboard", request.url),
        );
      }
    }

    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
