"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function requestPasswordReset(
  email: string,
): Promise<{ error?: string }> {
  const admin = createAdminSupabaseClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/auth/reset-password`,
    },
  });

  // No revelar si el correo existe (seguridad)
  if (error || !data?.properties?.hashed_token) {
    return {};
  }

  // Construir link directo al callback de la app con token_hash
  const recoveryLink =
    `${appUrl}/auth/callback` +
    `?token_hash=${data.properties.hashed_token}` +
    `&type=recovery` +
    `&next=/auth/reset-password`;

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "Makeray <hola@makeray.cl>",
    to: email,
    subject: "Restablecer tu contraseña — Makeray",
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Makeray.</p>
      <p>
        <a href="${recoveryLink}" style="background:#18181b;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
          Restablecer contraseña
        </a>
      </p>
      <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      <p>© 2026 Makeray — <a href="https://makeray.cl">makeray.cl</a></p>
    `,
  });

  return {};
}
