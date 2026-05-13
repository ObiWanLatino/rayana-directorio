"use client";

import { useState } from "react";

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/lemonsqueezy/create-checkout", {
        method: "POST",
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar el pago");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError("Respuesta inválida del servidor");
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => void pay()}
        disabled={loading}
        className="rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Redirigiendo al checkout…" : "Suscribirme — $19.990 CLP / mes"}
      </button>
      {error ? (
        <p className="text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
