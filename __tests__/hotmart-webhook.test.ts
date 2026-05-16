import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { HotmartWebhookEvent } from "@/lib/hotmart/types";
import {
  handleHotmartWebhookPost,
  processHotmartWebhookPayload,
} from "@/lib/hotmart/handle-webhook-post";

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return {
    ...actual,
    after: (fn: () => void | Promise<void>) => {
      void Promise.resolve(fn());
    },
  };
});

const insertWebhookMock = vi.fn();
const updateWebhookEventsMock = vi.fn();
const upsertSubscriptionsMock = vi.fn();
const updateSubscriptionsMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from(table: string) {
      if (table === "hotmart_webhook_events") {
        return {
          insert: insertWebhookMock,
          update: updateWebhookEventsMock,
        };
      }
      if (table === "subscriptions") {
        return {
          upsert: upsertSubscriptionsMock,
          update: updateSubscriptionsMock,
        };
      }
      if (table === "profiles") {
        return {
          select: vi.fn().mockReturnThis(),
          ilike: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: "11111111-1111-1111-1111-111111111111" },
            error: null,
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

function baseApprovedEvent(
  overrides: Partial<HotmartWebhookEvent> = {},
): HotmartWebhookEvent {
  return {
    id: "evt-hotmart-1",
    creation_date: Date.now(),
    event: "PURCHASE_APPROVED",
    version: "2.0.0",
    data: {
      product: { id: 1, ucode: "u", name: "Makeray" },
      buyer: {
        email: "buyer@example.com",
        name: "Buyer",
        document: "",
      },
      purchase: {
        transaction: "txn-1",
        status: "approved",
        price: { value: 9.99, currency_value: "USD" },
        payment: { type: "card", installments_number: 1 },
        approved_date: Date.now(),
      },
      subscription: {
        subscriber_code: "SUB-1",
        status: "ACTIVE",
        plan: { name: "Pro", id: "plan-1" },
      },
    },
    ...overrides,
  };
}

describe("POST /api/hotmart/webhook (handleHotmartWebhookPost)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.HOTMART_HOTTOK = "secret-hottok";
    insertWebhookMock.mockResolvedValue({ error: null });
    updateWebhookEventsMock.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    upsertSubscriptionsMock.mockResolvedValue({ error: null });
    updateSubscriptionsMock.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  afterEach(() => {
    delete process.env.HOTMART_HOTTOK;
  });

  test("rechaza request sin hottok", async () => {
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseApprovedEvent()),
      }),
    );
    expect(res.status).toBe(401);
    expect(insertWebhookMock).not.toHaveBeenCalled();
  });

  test("rechaza hottok incorrecto", async () => {
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hotmart-Hottok": "wrong",
        },
        body: JSON.stringify(baseApprovedEvent()),
      }),
    );
    expect(res.status).toBe(401);
  });

  test("procesa PURCHASE_APPROVED correctamente (payload en background)", async () => {
    const event = baseApprovedEvent();
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hotmart-Hottok": "secret-hottok",
        },
        body: JSON.stringify(event),
      }),
    );
    expect(res.status).toBe(200);
    expect(insertWebhookMock).toHaveBeenCalledTimes(1);
    await new Promise((r) => setTimeout(r, 0));
    expect(upsertSubscriptionsMock).toHaveBeenCalled();
  });

  test("es idempotente para el mismo event.id", async () => {
    insertWebhookMock.mockResolvedValueOnce({ error: { code: "23505" } });
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hotmart-Hottok": "secret-hottok",
        },
        body: JSON.stringify(baseApprovedEvent({ id: "dup-1" })),
      }),
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { duplicate?: boolean };
    expect(body.duplicate).toBe(true);
  });

  test("procesa SUBSCRIPTION_CANCELLATION correctamente", async () => {
    const event = baseApprovedEvent({
      id: "evt-cancel-1",
      event: "SUBSCRIPTION_CANCELLATION",
    });
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hotmart-Hottok": "secret-hottok",
        },
        body: JSON.stringify(event),
      }),
    );
    expect(res.status).toBe(200);
    await new Promise((r) => setTimeout(r, 0));
    expect(updateSubscriptionsMock).toHaveBeenCalled();
  });

  test("responde 200 para eventos desconocidos (no crashear)", async () => {
    const event = {
      ...baseApprovedEvent({ id: "evt-unknown", event: "SWITCH_PLAN" as const }),
    };
    const res = await handleHotmartWebhookPost(
      new Request("http://localhost/api/hotmart/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Hotmart-Hottok": "secret-hottok",
        },
        body: JSON.stringify(event),
      }),
    );
    expect(res.status).toBe(200);
    await new Promise((r) => setTimeout(r, 0));
    expect(upsertSubscriptionsMock).not.toHaveBeenCalled();
  });
});

describe("processHotmartWebhookPayload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateWebhookEventsMock.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    upsertSubscriptionsMock.mockResolvedValue({ error: null });
  });

  test("marca webhook como processed", async () => {
    await processHotmartWebhookPayload(baseApprovedEvent({ id: "inline-1" }));
    expect(updateWebhookEventsMock).toHaveBeenCalled();
  });
});
