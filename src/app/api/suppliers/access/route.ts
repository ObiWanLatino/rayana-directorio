import { NextResponse } from "next/server";
import { userHasListAccess } from "@/lib/auth/gifted-access";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasAccess: false });
  }

  const hasAccess = await userHasListAccess(supabase, user.id);
  return NextResponse.json({ hasAccess });
}
