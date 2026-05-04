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

/**
 * Base URL for post-auth redirects (OAuth / email links). Prefer
 * `NEXT_PUBLIC_APP_URL` so redirects match the canonical host (e.g. makeray.cl)
 * instead of an internal or proxy `Origin` from `request.url`.
 */
export function getAuthRedirectOrigin(request: Request): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}
