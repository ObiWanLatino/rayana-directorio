import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { getAuthRedirectOrigin } from "@/lib/app-url";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const base = getAuthRedirectOrigin(request);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore when not mutable
          }
        },
      },
    },
  );

  const { data: exchangeData, error } = await supabase.auth.exchangeCodeForSession(
    code,
  );
  if (error) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${base}/login?error=oauth`);
  }

  const sessionId = exchangeData.session?.access_token;
  if (sessionId) {
    const admin = createAdminSupabaseClient();
    await admin
      .from("profiles")
      .update({
        last_session_id: sessionId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
  }

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  const path = hasSubscriptionAccess(sub) ? "/hub" : "/checkout";
  return NextResponse.redirect(`${base}${path}`);
}
