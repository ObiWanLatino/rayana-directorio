"use client";

import { MakerayLogo } from "@/components/MakerayLogo";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "signin" | "signup";

type LoginFormProps = {
  initialError?: string;
  initialMessage?: string;
  /** Ruta interna post login (desde `?next=`). */
  redirectAfterLogin?: string;
};

const errorMessages: Record<string, string> = {
  oauth: "No se pudo completar el inicio de sesión con Google.",
  confirm: "El enlace de confirmación no es válido o expiró.",
  invalid_link: "El enlace de confirmación no es válido o expiró.",
  verification_failed:
    "No pudimos completar la verificación. El enlace puede haber expirado: solicita uno nuevo o inicia sesión.",
  session:
    "Tu sesión fue iniciada en otro dispositivo. Por favor inicia sesión nuevamente.",
  suspended:
    "Tu cuenta ha sido suspendida. Contacta a soporte en hola@makeray.cl",
};

/** OAuth must return to this app’s `/auth/callback` (not Supabase’s host) so the PKCE `code` is exchanged in Next.js. */
const GOOGLE_OAUTH_CALLBACK_PROD = "https://makeray.cl/auth/callback";

function googleOAuthRedirectTo(): string {
  if (typeof window === "undefined") {
    return GOOGLE_OAUTH_CALLBACK_PROD;
  }
  const { hostname, origin } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${origin}/auth/callback`;
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return `${envUrl}/auth/callback`;
  }
  return GOOGLE_OAUTH_CALLBACK_PROD;
}

function clientAuthOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (envUrl && /^https?:\/\//i.test(envUrl)) {
    return envUrl.replace(/\/$/, "");
  }
  return window.location.origin;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isInvalidCredentialsMessage(message: string): boolean {
  return /invalid login credentials/i.test(message);
}

function GoogleLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function LoginForm({
  initialError,
  initialMessage,
  redirectAfterLogin,
}: LoginFormProps) {
  const router = useRouter();
  const passwordUpdated = initialMessage === "password_updated";
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [signInAuthError, setSignInAuthError] = useState<string | null>(null);
  const [signInInvalidCredentials, setSignInInvalidCredentials] =
    useState(false);
  const [formError, setFormError] = useState<string | null>(
    initialError ? (errorMessages[initialError] ?? initialError) : null,
  );
  const [checkEmailFor, setCheckEmailFor] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendInfo, setResendInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  function clearFieldErrors() {
    setEmailError(null);
    setPasswordError(null);
    setSignInAuthError(null);
    setSignInInvalidCredentials(false);
    setFormError(null);
    setResendInfo(null);
  }

  function validateFields(): boolean {
    let ok = true;
    if (!isValidEmail(email)) {
      setEmailError("Introduce un correo válido.");
      ok = false;
    }
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      ok = false;
    }
    return ok;
  }

  async function handleGoogle() {
    clearFieldErrors();
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: googleOAuthRedirectTo(),
      },
    });
    setLoading(false);
    if (oauthError) {
      setFormError(oauthError.message);
    }
  }

  async function handleResendConfirmation() {
    if (!checkEmailFor) return;
    setResendLoading(true);
    setResendInfo(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: checkEmailFor,
      options: {
        emailRedirectTo: `${clientAuthOrigin()}/auth/confirm`,
      },
    });
    setResendLoading(false);
    if (error) {
      setResendInfo(error.message);
    } else {
      setResendInfo("Te enviamos otro correo. Revisa tu bandeja de entrada.");
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    clearFieldErrors();
    if (!validateFields()) return;

    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signError) {
          if (isInvalidCredentialsMessage(signError.message)) {
            setSignInInvalidCredentials(true);
          } else {
            setSignInAuthError(signError.message);
          }
          return;
        }
        router.refresh();
        router.push(redirectAfterLogin ?? "/hub");
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${clientAuthOrigin()}/auth/confirm`,
        },
      });

      if (signUpError) {
        setFormError(signUpError.message);
        return;
      }

      if (
        data.user &&
        (!data.user.identities || data.user.identities.length === 0)
      ) {
        setEmailError("Este correo ya está registrado. Inicia sesión.");
        return;
      }

      if (data.session) {
        router.refresh();
        router.push(redirectAfterLogin ?? "/hub");
        return;
      }

      if (data.user) {
        setCheckEmailFor(email.trim());
        setPassword("");
        return;
      }

      setFormError("No se pudo completar el registro. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const pageBgClass =
    mode === "signin"
      ? "bg-zinc-50"
      : "bg-gradient-to-br from-emerald-100/90 via-teal-50 to-[color:var(--color-soft)]";

  const primaryButtonClass =
    mode === "signin"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : "bg-emerald-700 text-white hover:bg-emerald-800";

  const switchOutlineClass =
    mode === "signin"
      ? "border-emerald-600/40 text-emerald-800 hover:bg-emerald-50"
      : "border-zinc-300 text-zinc-800 hover:bg-zinc-50";

  if (checkEmailFor) {
    return (
      <div
        className={`flex min-h-screen flex-col ${pageBgClass} text-zinc-900`}
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
          <div className="mb-8 flex justify-center">
            <MakerayLogo size="xl" className="justify-center" />
          </div>
          <div className="rounded-2xl border border-emerald-100/80 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <Mail className="h-7 w-7" aria-hidden />
              </div>
              <h1 className="text-xl font-semibold text-zinc-900">
                ¡Ya casi estás lista!
              </h1>
              <p className="mt-2 text-sm text-zinc-600">
                Te enviamos un correo a{" "}
                <span className="font-medium text-zinc-900">
                  {checkEmailFor}
                </span>
              </p>
              <p className="mt-4 text-sm leading-relaxed text-zinc-600">
                Abre el email y haz clic en el enlace de confirmación para
                activar tu cuenta.
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                ¿No llegó? Revisa tu carpeta de spam o{" "}
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={() => void handleResendConfirmation()}
                  className="font-medium text-emerald-700 underline decoration-emerald-700/40 underline-offset-2 hover:text-emerald-800 disabled:opacity-50"
                >
                  reenviar correo
                </button>
              </p>
              {resendLoading ? (
                <p className="mt-2 flex items-center justify-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Enviando…
                </p>
              ) : null}
              {resendInfo ? (
                <p className="mt-3 text-sm text-emerald-800" role="status">
                  {resendInfo}
                </p>
              ) : null}
              <button
                type="button"
                className={`mt-8 w-full rounded-xl border px-4 py-3 text-sm font-medium ${switchOutlineClass}`}
                onClick={() => {
                  setCheckEmailFor(null);
                  setResendInfo(null);
                  setMode("signin");
                }}
              >
                Volver a iniciar sesión
              </button>
            </div>
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

  return (
    <div className={`flex min-h-screen flex-col ${pageBgClass} text-zinc-900`}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 flex justify-center">
          <MakerayLogo size="xl" className="justify-center" />
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-8 shadow-sm">
          <div className="mb-6">
            {passwordUpdated ? (
              <p
                className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
                role="status"
              >
                Contraseña actualizada. Ya puedes iniciar sesión con tu nueva
                clave.
              </p>
            ) : null}
            {mode === "signup" ? (
              <span className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                ✨ Directorio actualizado semanalmente
              </span>
            ) : null}
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              {mode === "signin"
                ? "Bienvenida de vuelta 👋"
                : "Empieza a comprar barato 🛍️"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {mode === "signin"
                ? "Tu directorio de proveedores te espera"
                : "+1.000 proveedores de Chile y Brasil a un click"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <GoogleLogo />
            )}
            Continuar con Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs font-medium text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" aria-hidden />
            <span className="shrink-0">o</span>
            <span className="h-px flex-1 bg-zinc-200" aria-hidden />
          </div>

          <form onSubmit={(e) => void handleEmailAuth(e)} className="space-y-4">
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
                  if (formError) setFormError(null);
                  setSignInInvalidCredentials(false);
                  setSignInAuthError(null);
                }}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2 disabled:bg-zinc-50"
              />
              {emailError ? (
                <span className="text-xs text-red-600" role="alert">
                  {emailError}
                </span>
              ) : null}
            </label>

            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-zinc-700">Contraseña</span>
                {mode === "signin" ? (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                ) : null}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  required
                  minLength={6}
                  value={password}
                  disabled={loading}
                  onChange={(ev) => {
                    setPassword(ev.target.value);
                    if (passwordError) setPasswordError(null);
                    setSignInInvalidCredentials(false);
                    setSignInAuthError(null);
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
              {mode === "signin" && signInInvalidCredentials ? (
                <div
                  className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-xs text-amber-950"
                  role="alert"
                >
                  <p>
                    No encontramos una cuenta con ese correo o la contraseña
                    no coincide.
                  </p>
                  <p className="mt-2">
                    <button
                      type="button"
                      className="font-semibold text-emerald-800 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-900"
                      onClick={() => {
                        setMode("signup");
                        clearFieldErrors();
                      }}
                    >
                      ¿Quieres crear una cuenta?
                    </button>
                    <span className="text-amber-900/70"> · </span>
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-emerald-800 underline decoration-emerald-600/30 underline-offset-2 hover:text-emerald-900"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </p>
                </div>
              ) : null}
              {mode === "signin" && signInAuthError ? (
                <span className="text-xs text-red-600" role="alert">
                  {signInAuthError}
                </span>
              ) : null}
            </div>

            {formError ? (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:pointer-events-none disabled:opacity-50 ${primaryButtonClass}`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Cargando…
                </>
              ) : mode === "signin" ? (
                "Entrar"
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>

          {mode === "signin" ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode("signup");
                clearFieldErrors();
              }}
              className={`mt-4 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${switchOutlineClass}`}
            >
              ¿No tienes cuenta? Crear cuenta
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setMode("signin");
                clearFieldErrors();
              }}
              className={`mt-4 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${switchOutlineClass}`}
            >
              ¿Ya tienes cuenta? Iniciar sesión
            </button>
          )}
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
