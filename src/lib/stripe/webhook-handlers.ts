import type Stripe from "stripe";
import { getInvoiceSubscriptionId } from "@/lib/stripe/invoice-subscription";
import {
  markSubscriptionCanceledByStripeId,
  resolveUserIdForStripeSubscription,
  retrieveSubscriptionExpanded,
  upsertSubscriptionFromStripe,
} from "@/lib/stripe/sync-subscription";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  if (session.mode !== "subscription") {
    return;
  }
  const subId = session.subscription;
  const userId =
    session.client_reference_id ?? session.metadata?.user_id ?? undefined;
  if (typeof subId !== "string" || !userId) {
    console.error(
      "checkout.session.completed: missing subscription id or user reference",
    );
    return;
  }
  const sub = await retrieveSubscriptionExpanded(subId);
  await upsertSubscriptionFromStripe(sub, userId);
}

export async function handleInvoicePaymentSucceeded(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = getInvoiceSubscriptionId(invoice);
  if (!subId) {
    return;
  }
  const sub = await retrieveSubscriptionExpanded(subId);
  const userId = await resolveUserIdForStripeSubscription(sub);
  if (!userId) {
    console.error(
      "invoice.payment_succeeded: could not resolve user",
      sub.id,
    );
    return;
  }
  await upsertSubscriptionFromStripe(sub, userId);
}

export async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const subId = getInvoiceSubscriptionId(invoice);
  if (!subId) {
    return;
  }
  const admin = createAdminSupabaseClient();
  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subId);
  if (error) {
    throw new Error(`invoice.payment_failed update: ${error.message}`);
  }
}

export async function handleCustomerSubscriptionUpdated(
  sub: Stripe.Subscription,
): Promise<void> {
  const fresh = await retrieveSubscriptionExpanded(sub.id);
  const userId = await resolveUserIdForStripeSubscription(fresh);
  if (!userId) {
    console.error(
      "customer.subscription.updated: could not resolve user",
      fresh.id,
    );
    return;
  }
  await upsertSubscriptionFromStripe(fresh, userId);
}

export async function handleCustomerSubscriptionDeleted(
  sub: Stripe.Subscription,
): Promise<void> {
  await markSubscriptionCanceledByStripeId(sub.id);
}
