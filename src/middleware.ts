import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
  isAdminEmail,
} from "@/lib/auth/entitlements";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isStripeWebhookPublic =
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/webhooks/stripe");

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/auth/confirm") ||
    isStripeWebhookPublic;

  if (isStripeWebhookPublic) {
    return NextResponse.next();
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
    return supabaseResponse;
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdminEmail(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/hub";
      url.search = "";
      return NextResponse.redirect(url);
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
