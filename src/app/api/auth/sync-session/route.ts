import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (!user || !session?.access_token) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  await admin
    .from("profiles")
    .update({
      last_session_id: session.access_token,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  return NextResponse.json({ ok: true });
}
