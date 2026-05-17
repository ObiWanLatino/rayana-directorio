export function formatUtcDateTime(iso: string | null): string {
  if (!iso) return "-";
  return iso.slice(0, 16).replace("T", " ") + " UTC";
}
