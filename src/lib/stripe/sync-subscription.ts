import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/types";
import { getStripe } from "@/lib/stripe/client";
import { mapStripeSubscriptionStatus } from "@/lib/stripe/map-status";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function customerIdOf(sub: Stripe.Subscription): string {
  return typeof sub.customer === "string"
    ? sub.customer
    : sub.customer.id;
}

/** Stripe API versions may expose period end on items instead of the subscription root. */
function subscriptionCurrentPeriodEndIso(sub: Stripe.Subscription): string | null {
  const fromItems = (sub.items?.data ?? [])
    .map((item) => item.current_period_end)
    .filter((t): t is number => typeof t === "number");
  if (fromItems.length > 0) {
    const max = Math.max(...fromItems);
    return new Date(max * 1000).toISOString();
  }
  const legacy = sub as unknown as { current_period_end?: number };
  if (legacy.current_period_end != null) {
    return new Date(legacy.current_period_end * 1000).toISOString();
  }
  return null;
}

export async function retrieveSubscriptionExpanded(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data"],
  });
}

export function subscriptionToDbPayload(
  sub: Stripe.Subscription,
  userId: string,
): {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
} {
  return {
    user_id: userId,
    stripe_customer_id: customerIdOf(sub),
    stripe_subscription_id: sub.id,
    status: mapStripeSubscriptionStatus(sub.status),
    current_period_end: subscriptionCurrentPeriodEndIso(sub),
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };
}

export async function upsertSubscriptionFromStripe(
  sub: Stripe.Subscription,
  userId: string,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const row = subscriptionToDbPayload(sub, userId);
  const { error } = await admin.from("subscriptions").upsert(row, {
    onConflict: "user_id",
  });
  if (error) {
    console.error("Supabase error:", JSON.stringify(error));
    throw new Error(`subscriptions upsert failed: ${error.message}`);
  }
}

export async function resolveUserIdForStripeSubscription(
  sub: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = sub.metadata?.user_id;
  if (fromMeta) {
    return fromMeta;
  }
  const admin = createAdminSupabaseClient();
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", sub.id)
    .maybeSingle();
  return data?.user_id ?? null;
}

export async function markSubscriptionCanceledByStripeId(
  stripeSubscriptionId: string,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "canceled" as const,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) {
    throw new Error(`subscriptions cancel update failed: ${error.message}`);
  }
}
