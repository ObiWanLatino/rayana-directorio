import type Stripe from "stripe";
import type { SubscriptionStatus } from "@/types";

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): SubscriptionStatus {
  switch (status) {
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    case "trialing":
      return "active";
    case "incomplete":
    case "incomplete_expired":
    case "paused":
    default:
      return "inactive";
  }
}
