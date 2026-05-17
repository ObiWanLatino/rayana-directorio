import { getAppUrl } from "@/lib/app-url";

type GiftedAccessEmailParams = {
  to: string;
  expiresAt: string | null;
  reason?: string | null;
};

function buildBody(params: GiftedAccessEmailParams): string {
  const appUrl = getAppUrl();
  const expiryLine = params.expiresAt
    ? `Tu acceso estará disponible hasta el ${new Date(params.expiresAt).toLocaleString("es-CL", { dateStyle: "long", timeStyle: "short" })}.`
    : "Tu acceso es permanente (sin fecha de expiración).";

  const reasonLine = params.reason?.trim()
    ? `\nMotivo: ${params.reason.trim()}\n`
    : "";

  return `Hola,

Un administrador de Makeray te otorgó acceso a la lista de proveedores.
${reasonLine}
${expiryLine}

Entra aquí para usar tu acceso: ${appUrl}

— Equipo Makeray`;
}

/**
 * Sends gifted-access notification via Resend HTTP API (non-blocking caller should void this).
 */
export async function sendGiftedAccessEmail(
  params: GiftedAccessEmailParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set; skipping gifted access email");
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "Makeray <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "¡Tienes acceso a la lista de proveedores de Makeray!",
      text: buildBody(params),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend error ${res.status}: ${detail}`);
  }
}

export function notifyGiftedAccessByEmail(params: GiftedAccessEmailParams): void {
  void sendGiftedAccessEmail(params).catch((err) => {
    console.error("gifted access email failed:", err);
  });
}
