import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";

export type ActiveGiftedAccess = {
  id: string;
  user_id: string;
  reason: string | null;
  expires_at: string | null;
  created_at: string;
};

export async function hasActiveGiftedAccess(userId: string): Promise<boolean> {
  const row = await fetchActiveGiftedAccess(userId);
  return row !== null;
}

export async function fetchActiveGiftedAccess(
  userId: string,
): Promise<ActiveGiftedAccess | null> {
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await admin
    .from("gifted_access")
    .select("id, user_id, reason, expires_at, created_at")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

/** Stripe subscription OR active gifted_access. */
export async function userHasListAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const sub = await fetchSubscriptionAccessRow(supabase, userId);
  if (hasSubscriptionAccess(sub)) {
    return true;
  }
  return hasActiveGiftedAccess(userId);
}
