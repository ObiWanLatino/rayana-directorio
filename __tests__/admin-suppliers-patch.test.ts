import { PATCH } from "@/app/api/admin/suppliers/[id]/route";
import { getAdminUser } from "@/lib/auth/require-admin";
import { beforeEach, describe, expect, test, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  getAdminUser: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: () => ({
      update: () => ({
        eq: () => ({
          select: () => ({
            maybeSingle: adminMocks.maybeSingle,
          }),
        }),
      }),
    }),
  })),
}));

const SUPPLIER_ID = "00000000-0000-4000-8000-000000000001";

describe("PATCH /api/admin/suppliers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminUser).mockResolvedValue({ id: "u" } as never);
    adminMocks.maybeSingle.mockResolvedValue({
      data: { id: SUPPLIER_ID, foto_1_url: null },
      error: null,
    });
  });

  test("sin auth → 403", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(null);
    const res = await PATCH(
      new Request("http://localhost/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto_1_url: null }),
      }),
      { params: Promise.resolve({ id: SUPPLIER_ID }) },
    );
    expect(res.status).toBe(403);
  });

  test("foto_1_url null → actualiza y responde 200", async () => {
    const res = await PATCH(
      new Request("http://localhost/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto_1_url: null }),
      }),
      { params: Promise.resolve({ id: SUPPLIER_ID }) },
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { supplier?: { id: string } };
    expect(json.supplier?.id).toBe(SUPPLIER_ID);
  });

  test("foto_1_url con URL → 400", async () => {
    const res = await PATCH(
      new Request("http://localhost/api", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto_1_url: "https://evil.example/x.jpg" }),
      }),
      { params: Promise.resolve({ id: SUPPLIER_ID }) },
    );
    expect(res.status).toBe(400);
  });
});
