import type { EmailOtpType } from "@supabase/auth-js";
import { NextResponse } from "next/server";
import { getAuthRedirectOrigin } from "@/lib/app-url";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function safeInternalNext(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  try {
    const decoded = decodeURIComponent(raw);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    // ignore malformed next
  }
  return null;
}

async function updateProfileLastSession(userId: string, accessToken: string) {
  const admin = createAdminSupabaseClient();
  await admin
    .from("profiles")
    .update({
      last_session_id: accessToken,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const base = getAuthRedirectOrigin(request);
  const token_hash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next");
  const nextOrCheckout = safeInternalNext(nextRaw) ?? "/checkout";

  const supabase = await createServerSupabaseClient();

  /** Confirmación de email / magic link — no usar exchangeCodeForSession aquí. */
  if (token_hash && typeParam) {
    const type = typeParam as EmailOtpType;
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (error) {
      return NextResponse.redirect(`${base}/login?error=invalid_link`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${base}/login?error=invalid_link`);
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const sessionId = session?.access_token;
    if (sessionId) {
      await updateProfileLastSession(user.id, sessionId);
    }

    if (typeParam === "recovery") {
      return NextResponse.redirect(`${base}/auth/reset-password`);
    }

    return NextResponse.redirect(`${base}${nextOrCheckout}`);
  }

  /** PKCE: verificación de email u OAuth (intercambio de `code`). */
  if (!code) {
    return NextResponse.redirect(`${base}/login?error=invalid_link`);
  }

  const { data: exchangeData, error } =
    await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${base}/login?error=verification_failed`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(
      `${base}/login?error=verification_failed`,
    );
  }

  const sessionId = exchangeData.session?.access_token;
  if (sessionId) {
    await updateProfileLastSession(user.id, sessionId);
  }

  return NextResponse.redirect(`${base}${nextOrCheckout}`);
}
