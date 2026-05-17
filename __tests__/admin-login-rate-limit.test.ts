import {
  ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES,
  adminLoginRateLimitResponse,
  countRecentFailedLoginAttempts,
  enforceAdminLoginRateLimit,
  isAdminLoginRateLimited,
} from "@/lib/admin/login-rate-limit";
import { beforeEach, describe, expect, test, vi } from "vitest";

const rateMocks = vi.hoisted(() => ({
  failureCount: 0,
  insert: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: (table: string) => {
      if (table !== "admin_access_log") {
        throw new Error(`unexpected table ${table}`);
      }
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              gte: async () => ({
                count: rateMocks.failureCount,
                error: null,
              }),
            }),
          }),
        }),
        insert: rateMocks.insert,
      };
    },
  })),
}));

describe("admin login rate limit (Supabase store)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rateMocks.failureCount = 0;
    rateMocks.insert.mockResolvedValue({ error: null });
  });

  test("menos de 10 intentos fallidos → no bloqueado", async () => {
    rateMocks.failureCount = ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES - 1;

    expect(await countRecentFailedLoginAttempts("1.2.3.4")).toBe(9);
    expect(await isAdminLoginRateLimited("1.2.3.4")).toBe(false);
    expect(await enforceAdminLoginRateLimit("1.2.3.4", "test-agent")).toBeNull();
    expect(rateMocks.insert).not.toHaveBeenCalled();
  });

  test("10+ intentos fallidos en ventana → 429 y RATE_LIMITED", async () => {
    rateMocks.failureCount = ADMIN_LOGIN_RATE_LIMIT_MAX_FAILURES;

    expect(await isAdminLoginRateLimited("1.2.3.4")).toBe(true);

    const blocked = await enforceAdminLoginRateLimit(
      "1.2.3.4",
      "test-agent",
      "a@b.com",
    );
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);
    const body = (await blocked?.json()) as { error?: string };
    expect(body.error).toBe("Demasiados intentos. Espera 15 minutos.");

    expect(rateMocks.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "RATE_LIMITED",
        ip_address: "1.2.3.4",
        email: "a@b.com",
        success: false,
      }),
    );
  });

  test("adminLoginRateLimitResponse devuelve 429", () => {
    const res = adminLoginRateLimitResponse();
    expect(res.status).toBe(429);
  });
});
