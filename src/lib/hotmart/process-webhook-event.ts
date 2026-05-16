import type { HotmartWebhookEvent } from "@/lib/hotmart/types";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function escapeForIlikeExact(email: string): string {
  return email.trim().replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function findProfileIdByEmail(
  admin: ReturnType<typeof createAdminSupabaseClient>,
  email: string,
): Promise<string | null> {
  const trimmed = email.trim();
  if (!trimmed) return null;
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", escapeForIlikeExact(trimmed))
    .maybeSingle();
  if (error) {
    console.error("Hotmart webhook: profiles lookup error", error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function activateSubscription(
  event: HotmartWebhookEvent,
): Promise<void> {
  const sub = event.data.subscription;
  if (!sub) {
    return;
  }
  const email = event.data.buyer.email;
  const { subscriber_code, plan } = sub;
  const { transaction } = event.data.purchase;

  const admin = createAdminSupabaseClient();
  const userId = await findProfileIdByEmail(admin, email);
  if (!userId) {
    console.warn(
      "Hotmart PURCHASE_APPROVED: sin perfil para email",
      email,
      "subscriber",
      subscriber_code,
    );
    return;
  }

  const approved = event.data.purchase.approved_date;
  const startedAt =
    approved != null ? new Date(approved).toISOString() : new Date().toISOString();

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      payment_processor: "hotmart",
      provider: "hotmart",
      provider_subscription_id: subscriber_code,
      provider_transaction_id: transaction,
      status: "active" as const,
      plan_name: plan.name,
      plan_id: plan.id,
      buyer_email: email,
      started_at: startedAt,
      updated_at: new Date().toISOString(),
      cancel_at_period_end: false,
      last_purchase_amount: event.data.purchase.price?.value ?? null,
      last_purchase_currency: event.data.purchase.price?.currency_value ?? null,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Hotmart activateSubscription: ${error.message}`);
  }
}

export async function cancelSubscriptionFromEvent(
  event: HotmartWebhookEvent,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const subCode = event.data.subscription?.subscriber_code;
  const email = event.data.buyer.email;
  const transaction = event.data.purchase.transaction;

  if (subCode) {
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "canceled" as const,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider", "hotmart")
      .eq("provider_subscription_id", subCode);
    if (error) {
      throw new Error(`Hotmart cancel by subscriber_code: ${error.message}`);
    }
    return;
  }

  if (email) {
    const userId = await findProfileIdByEmail(admin, email);
    if (userId) {
      const { error } = await admin
        .from("subscriptions")
        .update({
          status: "canceled" as const,
          cancelled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("payment_processor", "hotmart");
      if (error) {
        throw new Error(`Hotmart cancel by user/email: ${error.message}`);
      }
    }
  }

  if (transaction) {
    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "canceled" as const,
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("provider_transaction_id", transaction)
      .eq("payment_processor", "hotmart");
    if (error) {
      throw new Error(`Hotmart cancel by transaction: ${error.message}`);
    }
  }
}

export async function markSubscriptionOverdue(
  event: HotmartWebhookEvent,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const subCode = event.data.subscription?.subscriber_code;
  if (!subCode) return;
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "past_due" as const,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", "hotmart")
    .eq("provider_subscription_id", subCode);
  if (error) {
    throw new Error(`Hotmart mark overdue: ${error.message}`);
  }
}

export async function expireSubscription(
  event: HotmartWebhookEvent,
): Promise<void> {
  const admin = createAdminSupabaseClient();
  const subCode = event.data.subscription?.subscriber_code;

  if (!subCode) return;
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "expired" as const,
      ends_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("provider", "hotmart")
    .eq("provider_subscription_id", subCode);
  if (error) {
    throw new Error(`Hotmart expire: ${error.message}`);
  }
}

export async function dispatchHotmartBusinessEvent(
  event: HotmartWebhookEvent,
): Promise<void> {
  switch (event.event) {
    case "PURCHASE_APPROVED":
      await activateSubscription(event);
      break;
    case "SUBSCRIPTION_CANCELLATION":
    case "PURCHASE_CANCELED":
    case "PURCHASE_REFUNDED":
    case "PURCHASE_CHARGEBACK":
      await cancelSubscriptionFromEvent(event);
      break;
    case "PURCHASE_OVERDUE":
      await markSubscriptionOverdue(event);
      break;
    case "PURCHASE_COMPLETE":
      await expireSubscription(event);
      break;
    default:
      break;
  }
}
