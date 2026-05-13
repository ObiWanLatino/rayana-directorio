import crypto from "node:crypto";

/**
 * Verifies `X-Signature` per Lemon Squeezy docs (HMAC-SHA256 hex digest as UTF-8 bytes).
 * @see https://docs.lemonsqueezy.com/help/webhooks/signing-requests
 */
export function verifyLemonSqueezyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(digest, signature);
}
