import type Stripe from "stripe";

/** Resolves subscription id from newer `parent.subscription_details` or legacy fields. */
export function getInvoiceSubscriptionId(
  invoice: Stripe.Invoice,
): string | null {
  const parent = invoice.parent;
  if (
    parent?.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === "string" ? sub : sub.id;
  }
  const loose = invoice as unknown as {
    subscription?: string | Stripe.Subscription | null;
  };
  if (!loose.subscription) {
    return null;
  }
  return typeof loose.subscription === "string"
    ? loose.subscription
    : loose.subscription.id;
}
