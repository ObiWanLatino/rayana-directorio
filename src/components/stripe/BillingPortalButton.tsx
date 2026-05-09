"use client";

import { useState } from "react";

type BillingPortalButtonProps = {
  disabled?: boolean;
  className?: string;
};

export function BillingPortalButton({ disabled, className }: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-portal", { method: "POST" });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo abrir el portal");
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
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void openPortal()}
        disabled={disabled || loading}
        className={
          className ??
          "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
        }
      >
        {loading ? "Abriendo…" : "Gestionar suscripción"}
      </button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
