import { describe, expect, test, vi } from "vitest";
import { dispatchStripeWebhookEvent } from "@/lib/stripe/dispatch-webhook-event";

const { handleInvoicePaymentSucceeded, handleCustomerSubscriptionDeleted } =
  vi.hoisted(() => ({
    handleInvoicePaymentSucceeded: vi.fn(),
    handleCustomerSubscriptionDeleted: vi.fn(),
  }));

vi.mock("@/lib/stripe/webhook-handlers", () => ({
  handleCheckoutSessionCompleted: vi.fn(),
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed: vi.fn(),
  handleCustomerSubscriptionUpdated: vi.fn(),
  handleCustomerSubscriptionDeleted,
}));

describe("dispatchStripeWebhookEvent", () => {
  test("invoice.payment_succeeded delega al handler", async () => {
    const inv = { id: "in_1" };
    await dispatchStripeWebhookEvent({
      type: "invoice.payment_succeeded",
      data: { object: inv },
    } as never);
    expect(handleInvoicePaymentSucceeded).toHaveBeenCalledWith(inv);
  });

  test("customer.subscription.deleted delega al handler", async () => {
    const sub = { id: "sub_1" };
    await dispatchStripeWebhookEvent({
      type: "customer.subscription.deleted",
      data: { object: sub },
    } as never);
    expect(handleCustomerSubscriptionDeleted).toHaveBeenCalledWith(sub);
  });
});
