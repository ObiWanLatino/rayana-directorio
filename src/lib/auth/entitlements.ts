import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubscriptionStatus } from "@/types";

export type SubscriptionAccessRow = {
  status: SubscriptionStatus;
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
};

export function hasSubscriptionAccess(
  row: SubscriptionAccessRow | null | undefined,
): boolean {
  if (!row) return false;
  if (row.status === "expired") return false;
  if (row.status === "active" || row.status === "past_due" || row.status === "trialing")
    return true;
  if (
    row.cancel_at_period_end &&
    row.current_period_end &&
    new Date(row.current_period_end) > new Date()
  ) {
    return true;
  }
  return false;
}

export async function fetchSubscriptionAccessRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<SubscriptionAccessRow | null> {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, cancel_at_period_end, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    status: data.status as SubscriptionStatus,
    cancel_at_period_end: data.cancel_at_period_end,
    current_period_end: data.current_period_end,
  };
}
