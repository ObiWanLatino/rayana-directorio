import { getSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import type { SubscriptionStatus } from "@/types";
import { initLemonSqueezy } from "@/lib/lemonsqueezy/client";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type JsonObject = Record<string, unknown>;

function asObject(v: unknown): JsonObject | null {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as JsonObject)
    : null;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
}

function getUserIdFromMeta(meta: JsonObject | null): string | null {
  const custom = asObject(meta?.custom_data);
  const raw = custom?.user_id ?? custom?.userId;
  const s = str(raw);
  if (!s) return null;
  const trimmed = s.trim();
  if (!/^[0-9a-f-]{36}$/i.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

function mapLemonSubscriptionStatus(
  lemon: string | undefined,
): SubscriptionStatus {
  switch (lemon) {
    case "active":
    case "on_trial":
    case "paused":
    case "pause":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "cancelled":
    case "expired":
      return "canceled";
    default:
      return "inactive";
  }
}

/** JSON:API `data.attributes` from webhook root. */
function resourceAttributes(root: JsonObject | null): JsonObject | null {
  const inner = asObject(root?.data);
  return asObject(inner?.attributes);
}

function resourceId(root: JsonObject | null): string | null {
  const inner = asObject(root?.data);
  return str(inner?.id);
}

async function refreshSubscriptionFromApi(subscriptionId: string): Promise<{
  renews_at: string | null;
  customer_portal: string | null;
  status: SubscriptionStatus;
  cancel_at_period_end: boolean;
} | null> {
  initLemonSqueezy();
  const { data, error } = await getSubscription(subscriptionId);
  if (error || !data?.data?.attributes) return null;
  const a = data.data.attributes as JsonObject;
  const renews = str(a.renews_at ?? a.renewsAt);
  const urls = asObject(a.urls);
  const portal = str(urls?.customer_portal ?? urls?.customerPortal);
  const statusRaw = str(a.status) ?? undefined;
  const cancelled = Boolean(a.cancelled ?? a.cancelled);
  return {
    renews_at: renews,
    customer_portal: portal,
    status: mapLemonSubscriptionStatus(statusRaw),
    cancel_at_period_end: cancelled,
  };
}

export async function processLemonSqueezyWebhook(
  body: unknown,
): Promise<void> {
  const root = asObject(body);
  if (!root) return;

  const meta = asObject(root.meta);
  const eventName = str(meta?.event_name ?? meta?.eventName);
  if (!eventName) {
    console.warn("Lemon webhook: missing meta.event_name");
    return;
  }

  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  if (eventName === "order_created") {
    const userId = getUserIdFromMeta(meta);
    const id = resourceId(root);
    const attrs = resourceAttributes(root);
    if (!userId || !id) {
      console.warn("order_created: missing user_id or order id");
      return;
    }
    const customerId = str(attrs?.customer_id ?? attrs?.customerId);
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        lemon_squeezy_order_id: id,
        lemon_squeezy_customer_id: customerId,
        status: "active" as const,
        payment_processor: "lemonsqueezy",
        cancel_at_period_end: false,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(`order_created upsert: ${error.message}`);
    return;
  }

  if (eventName === "subscription_created") {
    const userId = getUserIdFromMeta(meta);
    const subId = resourceId(root);
    const attrs = resourceAttributes(root);
    if (!userId || !subId || !attrs) {
      console.warn(
        "subscription_created: missing user_id, subscription id, or attributes",
      );
      return;
    }
    const urls = asObject(attrs.urls as unknown);
    const customerPortal = str(
      urls?.customer_portal ?? urls?.customerPortal,
    );
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        lemon_squeezy_subscription_id: subId,
        lemon_squeezy_customer_id: str(attrs.customer_id ?? attrs.customerId),
        lemon_squeezy_order_id: str(attrs.order_id ?? attrs.orderId),
        lemon_squeezy_variant_id: str(attrs.variant_id ?? attrs.variantId),
        customer_portal_url: customerPortal,
        status: mapLemonSubscriptionStatus(
          str(attrs.status) ?? undefined,
        ) as SubscriptionStatus,
        current_period_end: str(attrs.renews_at ?? attrs.renewsAt),
        cancel_at_period_end: false,
        payment_processor: "lemonsqueezy",
        updated_at: now,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(`subscription_created upsert: ${error.message}`);
    return;
  }

  if (eventName === "subscription_updated") {
    const subId = resourceId(root);
    const attrs = resourceAttributes(root);
    if (!subId || !attrs) return;
    const urls = asObject(attrs.urls as unknown);
    const customerPortal = str(
      urls?.customer_portal ?? urls?.customerPortal,
    );
    const lemonStatus = str(attrs.status) ?? undefined;
    const cancelled = Boolean(attrs.cancelled ?? attrs.cancelled);
    const endsAt = str(attrs.ends_at ?? attrs.endsAt);
    let status = mapLemonSubscriptionStatus(lemonStatus);
    if (cancelled && endsAt) {
      const end = new Date(endsAt);
      if (!Number.isNaN(end.getTime()) && end <= new Date()) {
        status = "canceled";
      } else if (status !== "canceled") {
        status = "active";
      }
    }
    const { error } = await admin
      .from("subscriptions")
      .update({
        status,
        current_period_end: str(attrs.renews_at ?? attrs.renewsAt),
        cancel_at_period_end: cancelled,
        customer_portal_url: customerPortal ?? undefined,
        lemon_squeezy_variant_id:
          str(attrs.variant_id ?? attrs.variantId) ?? undefined,
        updated_at: now,
      })
      .eq("lemon_squeezy_subscription_id", subId);
    if (error) throw new Error(`subscription_updated: ${error.message}`);
    return;
  }

  if (eventName === "subscription_cancelled") {
    const subId = resourceId(root);
    const attrs = resourceAttributes(root);
    if (!subId || !attrs) return;
    const endsAt = str(attrs.ends_at ?? attrs.endsAt);
    const urls = asObject(attrs.urls as unknown);
    const customerPortal = str(
      urls?.customer_portal ?? urls?.customerPortal,
    );
    let status: SubscriptionStatus = "active";
    if (endsAt) {
      const end = new Date(endsAt);
      if (!Number.isNaN(end.getTime()) && end <= new Date()) {
        status = "canceled";
      }
    }
    const { error } = await admin
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        status,
        current_period_end: str(attrs.renews_at ?? attrs.renewsAt),
        customer_portal_url: customerPortal ?? undefined,
        updated_at: now,
      })
      .eq("lemon_squeezy_subscription_id", subId);
    if (error) throw new Error(`subscription_cancelled: ${error.message}`);
    return;
  }

  if (eventName === "subscription_expired") {
    const subId = resourceId(root);
    if (!subId) return;
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "canceled" as const,
        cancel_at_period_end: false,
        updated_at: now,
      })
      .eq("lemon_squeezy_subscription_id", subId);
    if (error) throw new Error(`subscription_expired: ${error.message}`);
    return;
  }

  if (
    eventName === "subscription_payment_failed" ||
    eventName === "subscription_payment_success" ||
    eventName === "subscription_payment_recovered"
  ) {
    const inner = asObject(root.data);
    const attrs = asObject(inner?.attributes);
    const subId = str(
      attrs?.subscription_id ?? attrs?.subscriptionId,
    );
    if (!subId) {
      console.warn(`${eventName}: missing subscription_id`);
      return;
    }
    if (eventName === "subscription_payment_failed") {
      const { error } = await admin
        .from("subscriptions")
        .update({ status: "past_due" as const, updated_at: now })
        .eq("lemon_squeezy_subscription_id", subId);
      if (error) {
        throw new Error(`subscription_payment_failed: ${error.message}`);
      }
      return;
    }
    const fresh = await refreshSubscriptionFromApi(subId);
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "active" as const,
        current_period_end: fresh?.renews_at ?? undefined,
        customer_portal_url: fresh?.customer_portal ?? undefined,
        updated_at: now,
      })
      .eq("lemon_squeezy_subscription_id", subId);
    if (error) {
      throw new Error(`subscription_payment_success/recovered: ${error.message}`);
    }
    return;
  }

  if (eventName === "order_refunded") {
    const orderId = resourceId(root);
    if (!orderId) return;
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "canceled" as const,
        updated_at: now,
      })
      .eq("lemon_squeezy_order_id", orderId);
    if (error) throw new Error(`order_refunded: ${error.message}`);
  }
}
