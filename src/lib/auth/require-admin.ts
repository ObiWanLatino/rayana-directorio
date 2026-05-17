import { resolveAdminSessionToken } from "@/lib/admin/admin-session";
import { isAdminRequestHost } from "@/lib/admin/request-host";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

export async function getAdminUser(): Promise<User | null> {
  const headerStore = await headers();
  const rawHost =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  if (!isAdminRequestHost(rawHost)) {
    return null;
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;
  const adminSession = await resolveAdminSessionToken(sessionToken);
  if (!adminSession) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || user.id !== adminSession.user_id) {
    return null;
  }

  const email = user.email.trim().toLowerCase();
  const admin = createAdminSupabaseClient();
  const { data: row } = await admin
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .eq("active", true)
    .maybeSingle();

  if (!row) {
    return null;
  }

  return user;
}
