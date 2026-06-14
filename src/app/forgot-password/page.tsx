"use client";

import { MakerayLogo } from "@/components/MakerayLogo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

function recoveryRedirectTo(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const base =
    envUrl && /^https?:\/\//i.test(envUrl)
      ? envUrl
      : typeof window !== "undefined"
        ? window.location.origin
        : "https://makeray.cl";
  return `${base}/auth/callback?next=/auth/reset-password`;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmailError(null);
    if (!isValidEmail(email)) {
      setEmailError("Introduce un correo válido.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: recoveryRedirectTo(),
      },
    );
    setLoading(false);
    if (error) {
      setEmailError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <MakerayLogo size="xl" className="justify-center" />
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            Recuperar contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Te enviaremos un enlace para restablecer tu contraseña.
          </p>

          {sent ? (
            <p className="mt-6 text-sm leading-relaxed text-emerald-800">
              Revisa tu correo — te enviamos instrucciones para restablecer tu
              contraseña.
            </p>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-6 space-y-4"
            >
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">Correo</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  disabled={loading}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:bg-zinc-50"
                />
                {emailError ? (
                  <span className="text-xs text-red-600" role="alert">
                    {emailError}
                  </span>
                ) : null}
              </label>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Cargando…
                  </>
                ) : (
                  "Enviar instrucciones"
                )}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-emerald-800 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-900"
            >
              Volver a iniciar sesión
            </Link>
          </p>
        </div>
        <p className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-zinc-400 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-500"
          >
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
