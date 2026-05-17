import { POST } from "@/app/api/admin/gifted-access/route";
import {
  fetchActiveGiftedAccess,
  hasActiveGiftedAccess,
  userHasListAccess,
} from "@/lib/auth/gifted-access";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { beforeEach, describe, expect, test, vi } from "vitest";

const giftedMocks = vi.hoisted(() => ({
  giftedRow: null as {
    id: string;
    user_id: string;
    reason: string | null;
    expires_at: string | null;
    created_at: string;
  } | null,
  profileEmail: "user@example.com",
}));

vi.mock("@/lib/auth/require-admin", () => ({
  getAdminUser: vi.fn(),
}));

vi.mock("@/lib/email/send-gifted-access-email", () => ({
  notifyGiftedAccessByEmail: vi.fn(),
}));

vi.mock("@/lib/auth/entitlements", () => ({
  fetchSubscriptionAccessRow: vi.fn(),
  hasSubscriptionAccess: vi.fn(),
}));

vi.mock("@/lib/supabase/gifted-access-client", () => ({
  rpcGrantGiftedAccess: vi.fn(),
  rpcRevokeGiftedAccess: vi.fn(),
  rpcGetActiveGiftedAccess: vi.fn(async (userId?: string | null) => {
    if (userId && giftedMocks.giftedRow?.user_id !== userId) {
      return { data: [], error: null };
    }
    if (!giftedMocks.giftedRow) {
      return { data: [], error: null };
    }
    return {
      data: [
        {
          ...giftedMocks.giftedRow,
          revoked_at: null,
        },
      ],
      error: null,
    };
  }),
  rpcCheckActiveGiftedAccess: vi.fn(async (userId: string) => ({
    data: Boolean(giftedMocks.giftedRow && giftedMocks.giftedRow.user_id === userId),
    error: null,
  })),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { email: giftedMocks.profileEmail },
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  })),
}));

import { getAdminUser } from "@/lib/auth/require-admin";
import {
  rpcCheckActiveGiftedAccess,
  rpcGrantGiftedAccess,
} from "@/lib/supabase/gifted-access-client";

describe("gifted access entitlements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    giftedMocks.giftedRow = null;
    vi.mocked(fetchSubscriptionAccessRow).mockResolvedValue(null);
    vi.mocked(hasSubscriptionAccess).mockReturnValue(false);
  });

  test("gifted-access activo → acceso concedido aunque no tenga Stripe", async () => {
    giftedMocks.giftedRow = {
      id: "g1",
      user_id: "u1",
      reason: null,
      expires_at: null,
      created_at: new Date().toISOString(),
    };

    const supabase = {} as never;
    expect(await hasActiveGiftedAccess("u1")).toBe(true);
    expect(await userHasListAccess(supabase, "u1")).toBe(true);
  });

  test("gifted-access expirado → sin acceso", async () => {
    giftedMocks.giftedRow = null;
    const supabase = {} as never;
    expect(await fetchActiveGiftedAccess("u1")).toBeNull();
    expect(await userHasListAccess(supabase, "u1")).toBe(false);
  });

  test("gifted-access revocado → sin acceso", async () => {
    giftedMocks.giftedRow = null;
    expect(await hasActiveGiftedAccess("u-revoked")).toBe(false);
  });
});

describe("POST /api/admin/gifted-access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    giftedMocks.giftedRow = null;
    vi.mocked(rpcCheckActiveGiftedAccess).mockResolvedValue({ data: false, error: null });
    vi.mocked(rpcGrantGiftedAccess).mockResolvedValue({
      data: {
        id: "new-gift",
        user_id: "target-u",
        granted_by: "admin-1",
        reason: null,
        expires_at: null,
        created_at: "2026-01-01T00:00:00.000Z",
      },
      error: null,
    });
  });

  test("sin getAdminUser → 401", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(null);

    const res = await POST(
      new Request("http://admin.makeray.cl/api/admin/gifted-access", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          host: "admin.makeray.cl",
        },
        body: JSON.stringify({ user_id: "target-u" }),
      }),
    );

    expect(res.status).toBe(401);
  });
});
