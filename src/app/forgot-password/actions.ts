"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requestPasswordReset(
  email: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) {
    return { error: error.message };
  }
  return {};
}
