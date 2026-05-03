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
  if (row.status === "active" || row.status === "past_due") return true;
  if (
    row.cancel_at_period_end &&
    row.current_period_end &&
    new Date(row.current_period_end) > new Date()
  ) {
    return true;
  }
  return false;
}

export function parseAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return parseAdminEmails().includes(normalized);
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
