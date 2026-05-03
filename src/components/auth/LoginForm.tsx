"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Mode = "signin" | "signup";

type LoginFormProps = {
  initialError?: string;
};

const errorMessages: Record<string, string> = {
  oauth: "No se pudo completar el inicio de sesión con Google.",
  confirm: "El enlace de confirmación no es válido o expiró.",
};

export function LoginForm({ initialError }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    initialError ? (errorMessages[initialError] ?? initialError) : null,
  );
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  async function handleGoogle() {
    setError(null);
    setInfo(null);
    setLoading(true);
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signError) {
          setError(signError.message);
          return;
        }
        router.refresh();
        router.push("/hub");
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setInfo(
        "Revisa tu correo para confirmar la cuenta antes de iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center gap-8 px-4 py-16">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">
          {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Accede a la plataforma Rayana con Google o correo y contraseña.
        </p>
      </div>

      <button
        type="button"
        onClick={() => void handleGoogle()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-50"
      >
        Continuar con Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-50 px-2 text-zinc-500">o</span>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Correo</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700">Contraseña</span>
          <input
            type="password"
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            required
            minLength={6}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </label>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="text-sm text-emerald-700" role="status">
            {info}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading
            ? "Procesando…"
            : mode === "signin"
              ? "Entrar"
              : "Registrarse"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-600">
        {mode === "signin" ? (
          <>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-zinc-900 underline"
              onClick={() => {
                setMode("signup");
                setError(null);
                setInfo(null);
              }}
            >
              Crear cuenta
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="font-medium text-zinc-900 underline"
              onClick={() => {
                setMode("signin");
                setError(null);
                setInfo(null);
              }}
            >
              Iniciar sesión
            </button>
          </>
        )}
      </p>

      <p className="text-center text-sm">
        <Link href="/" className="text-zinc-500 underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
