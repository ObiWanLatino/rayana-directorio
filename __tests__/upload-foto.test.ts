import { POST } from "@/app/api/admin/upload-foto/route";
import { getAdminUser } from "@/lib/auth/require-admin";
import { beforeEach, describe, expect, test, vi } from "vitest";

const adminMocks = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
  updEq: vi.fn(),
  upload: vi.fn(),
}));

vi.mock("@/lib/auth/require-admin", () => ({
  getAdminUser: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: adminMocks.maybeSingle,
        }),
      }),
      update: () => ({
        eq: adminMocks.updEq,
      }),
    }),
    storage: {
      from: () => ({
        upload: adminMocks.upload,
        getPublicUrl: () => ({
          data: { publicUrl: "https://cdn.example/i.jpg" },
        }),
      }),
    },
  })),
}));

describe("POST /api/admin/upload-foto", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminUser).mockReset();
    adminMocks.maybeSingle.mockResolvedValue({
      data: { id: "00000000-0000-4000-8000-000000000001" },
      error: null,
    });
    adminMocks.updEq.mockResolvedValue({ error: null });
    adminMocks.upload.mockResolvedValue({ error: null });
  });

  test("sin auth de admin → 403", async () => {
    vi.mocked(getAdminUser).mockResolvedValue(null);
    const res = await POST(
      new Request("http://localhost/api", { method: "POST", body: new FormData() }),
    );
    expect(res.status).toBe(403);
  });

  test("foto_index inválido → 400", async () => {
    vi.mocked(getAdminUser).mockResolvedValue({ id: "u" } as never);
    const fd = new FormData();
    fd.set("supplier_id", "00000000-0000-4000-8000-000000000001");
    fd.set("foto_index", "9");
    fd.set("file", new File(["x"], "a.jpg", { type: "image/jpeg" }));
    const res = await POST(
      new Request("http://localhost/api", { method: "POST", body: fd }),
    );
    expect(res.status).toBe(400);
  });

  test("con admin + archivo válido → 200 y url", async () => {
    vi.mocked(getAdminUser).mockResolvedValue({ id: "u" } as never);
    const fd = new FormData();
    fd.set("supplier_id", "00000000-0000-4000-8000-000000000001");
    fd.set("foto_index", "2");
    fd.set("file", new File(["ab"], "b.png", { type: "image/png" }));
    const res = await POST(
      new Request("http://localhost/api", { method: "POST", body: fd }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { url?: string };
    expect(json.url).toMatch(/^https:\/\/cdn\.example\/i\.jpg\?v=/);
    expect(adminMocks.upload).toHaveBeenCalled();
  });
});
