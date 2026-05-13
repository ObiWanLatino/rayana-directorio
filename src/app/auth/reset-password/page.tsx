"use client";

import { MakerayLogo } from "@/components/MakerayLogo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) {
        setHasSession(!!session);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setConfirmError(null);
    setFormError(null);

    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setConfirmError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    router.push("/login?message=password_updated");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <MakerayLogo size="xl" className="justify-center" />
        </div>
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-900">
            Nueva contraseña
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Elige una contraseña segura para tu cuenta.
          </p>

          {!ready ? (
            <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Cargando…
            </p>
          ) : !hasSession ? (
            <p className="mt-6 text-sm text-red-600" role="alert">
              El enlace no es válido o expiró. Solicita uno nuevo desde iniciar
              sesión.
            </p>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-6 space-y-4"
            >
              <div className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">
                  Nueva contraseña
                </span>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    disabled={loading}
                    onChange={(ev) => {
                      setPassword(ev.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    className="w-full rounded-lg border border-zinc-200 py-2 pl-3 pr-11 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:bg-zinc-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden />
                    ) : (
                      <Eye size={18} aria-hidden />
                    )}
                  </button>
                </div>
                {passwordError ? (
                  <span className="text-xs text-red-600" role="alert">
                    {passwordError}
                  </span>
                ) : null}
              </div>

              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-zinc-700">
                  Confirmar contraseña
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  disabled={loading}
                  onChange={(ev) => {
                    setConfirm(ev.target.value);
                    if (confirmError) setConfirmError(null);
                  }}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:bg-zinc-50"
                />
                {confirmError ? (
                  <span className="text-xs text-red-600" role="alert">
                    {confirmError}
                  </span>
                ) : null}
              </label>

              {formError ? (
                <p className="text-sm text-red-600" role="alert">
                  {formError}
                </p>
              ) : null}

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
                  "Guardar contraseña"
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
      </div>
    </div>
  );
}
