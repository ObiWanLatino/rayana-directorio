/**
 * Canonical public URL (no trailing slash). Used for Stripe redirect URLs.
 */
export function getAppUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL;
  if (!raw || !raw.startsWith("http")) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL must be set to an absolute URL (e.g. https://rayana.app)",
    );
  }
  return raw.replace(/\/$/, "");
}
