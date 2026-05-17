import {
  rpcCheckActiveGiftedAccess,
  rpcGetActiveGiftedAccess,
} from "@/lib/supabase/gifted-access-client";
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
  console.log("[hasActiveGiftedAccess] checking userId:", userId);
  const result = await rpcCheckActiveGiftedAccess(userId);
  console.log("[hasActiveGiftedAccess] result:", result);
  return result.data;
}

export async function fetchActiveGiftedAccess(
  userId: string,
): Promise<ActiveGiftedAccess | null> {
  const { data, error } = await rpcGetActiveGiftedAccess(userId);
  if (error || data.length === 0) {
    return null;
  }

  const row = data[0];
  return {
    id: row.id,
    user_id: row.user_id,
    reason: row.reason,
    expires_at: row.expires_at,
    created_at: row.created_at,
  };
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
