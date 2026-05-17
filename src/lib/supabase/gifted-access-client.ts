import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export function giftedAccessTable() {
  return createAdminSupabaseClient().schema("public").from("gifted_access");
}
