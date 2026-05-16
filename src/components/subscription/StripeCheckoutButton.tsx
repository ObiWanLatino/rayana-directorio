"use client";

import type { PricingInfo } from "@/lib/stripe/get-price-for-region";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  pricing: PricingInfo;
  className?: string;
  variant?: "default" | "large";
  /** Query `next` tras iniciar sesión (ej. `/checkout` o `/pricing`). */
  loginNextPath?: string;
};

export function StripeCheckoutButton({
  pricing,
  className = "",
  variant = "default",
  loginNextPath = "/pricing",
}: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCheckout() {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { error?: string };
        if (response.status === 401) {
          const next = encodeURIComponent(loginNextPath);
          router.push(`/login?next=${next}`);
          return;
        }
        throw new Error(errorBody.error ?? "Failed to create checkout session");
      }

      const data = (await response.json()) as { url?: string };
      if (!data.url) {
        throw new Error("Missing checkout URL");
      }
      window.location.href = data.url;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Error al procesar el pago. Por favor intenta nuevamente.");
      setLoading(false);
    }
  }

  const buttonStyles =
    variant === "large"
      ? "px-8 py-4 text-lg font-semibold"
      : "px-6 py-3 text-base font-medium";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={loading}
        className={`w-full rounded-xl bg-zinc-900 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 ${buttonStyles} ${className}`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Procesando…
          </span>
        ) : (
          `Suscribirse — ${pricing.displayPrice}`
        )}
      </button>

      <p className="text-center text-xs text-zinc-500">
        Pago seguro procesado por Stripe
      </p>
    </div>
  );
}
