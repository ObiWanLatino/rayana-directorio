import type Stripe from "stripe";
import {
  handleCheckoutSessionCompleted,
  handleCustomerSubscriptionDeleted,
  handleCustomerSubscriptionUpdated,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
} from "@/lib/stripe/webhook-handlers";

/** Procesa un evento ya verificado por Stripe (constructEvent). */
export async function dispatchStripeWebhookEvent(
  event: Stripe.Event,
): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(
        event.data.object as Stripe.Invoice,
      );
      break;
    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case "customer.subscription.updated":
      await handleCustomerSubscriptionUpdated(
        event.data.object as Stripe.Subscription,
      );
      break;
    case "customer.subscription.deleted":
      await handleCustomerSubscriptionDeleted(
        event.data.object as Stripe.Subscription,
      );
      break;
    default:
      break;
  }
}
