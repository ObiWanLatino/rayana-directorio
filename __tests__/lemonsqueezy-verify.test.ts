import crypto from "node:crypto";
import { describe, expect, test } from "vitest";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy/verify-webhook-signature";

describe("verifyLemonSqueezyWebhookSignature", () => {
  test("acepta firma válida", () => {
    const secret = "test-secret";
    const body = '{"hello":"world"}';
    const hmac = crypto.createHmac("sha256", secret);
    const hexDigest = hmac.update(body).digest("hex");
    expect(verifyLemonSqueezyWebhookSignature(body, hexDigest, secret)).toBe(
      true,
    );
  });

  test("rechaza firma incorrecta", () => {
    const secret = "test-secret";
    const body = '{"hello":"world"}';
    expect(verifyLemonSqueezyWebhookSignature(body, "deadbeef", secret)).toBe(
      false,
    );
  });
});
