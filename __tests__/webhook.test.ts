import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { handleStripeWebhookPost } from "@/lib/stripe/handle-stripe-webhook-post";

const { constructEvent, dispatch } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripe: () => ({
    webhooks: { constructEvent },
  }),
}));

vi.mock("@/lib/stripe/dispatch-webhook-event", () => ({
  dispatchStripeWebhookEvent: dispatch,
}));

describe("Stripe webhook HTTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    dispatch.mockResolvedValue(undefined);
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  test("400 sin stripe-signature", async () => {
    const res = await handleStripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  test("400 con firma inválida", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const res = await handleStripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=bad" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    expect(dispatch).not.toHaveBeenCalled();
  });

  test("invoice.payment_succeeded verificado → despacha (status active vía handler real en prod)", async () => {
    const evt = { id: "evt_1", type: "invoice.payment_succeeded", data: {} };
    constructEvent.mockReturnValue(evt);
    const res = await handleStripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=ok" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(200);
    expect(dispatch).toHaveBeenCalledWith(evt);
  });

  test("customer.subscription.deleted verificado → despacha", async () => {
    const evt = {
      id: "evt_sub",
      type: "customer.subscription.deleted",
      data: {},
    };
    constructEvent.mockReturnValue(evt);
    const res = await handleStripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=ok" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(200);
    expect(dispatch).toHaveBeenCalledWith(evt);
  });

  test("evento no manejado → 200 (ack)", async () => {
    const evt = { id: "evt_2", type: "charge.succeeded", data: {} };
    constructEvent.mockReturnValue(evt);
    const res = await handleStripeWebhookPost(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=ok" },
        body: "{}",
      }),
    );
    expect(res.status).toBe(200);
    expect(dispatch).toHaveBeenCalled();
  });
});
