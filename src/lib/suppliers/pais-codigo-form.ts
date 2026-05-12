/** Lee `pais_codigo` del FormData del upload (solo servidor). */
export function readPaisCodigoFromFormData(
  form: FormData,
): { ok: true; value: string } | { ok: false; message: string } {
  const raw = form.get("pais_codigo");
  if (raw == null || raw === "") {
    return { ok: true, value: "56" };
  }
  if (typeof raw !== "string") {
    return { ok: false, message: "pais_codigo debe ser texto" };
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, message: "pais_codigo no puede estar vacío" };
  }
  return { ok: true, value: trimmed };
}
