/** First host in x-forwarded-host (may be comma-separated). */
export function normalizeHostname(host: string | null | undefined): string | null {
  if (!host) return null;
  const first = host.split(",")[0]?.trim();
  if (!first) return null;
  return first.split(":")[0]?.toLowerCase() ?? null;
}

/**
 * True when the request is for the dedicated admin hostname (e.g. admin.makeray.cl).
 * Configure `ADMIN_HOSTNAME` (optional) and `ADMIN_EXTRA_HOSTNAMES` (comma-separated, optional).
 */
export function isAdminRequestHost(host: string | null | undefined): boolean {
  const h = normalizeHostname(host);
  if (!h) return false;
  const primary = (process.env.ADMIN_HOSTNAME ?? "admin.makeray.cl")
    .split(":")[0]
    ?.trim()
    .toLowerCase();
  if (!primary) return false;
  if (h === primary) return true;
  const extras = (process.env.ADMIN_EXTRA_HOSTNAMES ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return extras.includes(h);
}
