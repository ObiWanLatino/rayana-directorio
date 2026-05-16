"use client";

import type { SupplierOffer } from "@/types/proveedores";
import { useEffect, useState } from "react";

function msLeft(expiresAt: string): number {
  return new Date(expiresAt).getTime() - Date.now();
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Finalizada";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function OfferCard({ offer }: { offer: SupplierOffer }) {
  const [label, setLabel] = useState(() =>
    formatCountdown(msLeft(offer.expires_at)),
  );

  useEffect(() => {
    const t = setInterval(() => {
      setLabel(formatCountdown(msLeft(offer.expires_at)));
    }, 30_000);
    return () => clearInterval(t);
  }, [offer.expires_at]);

  return (
    <article className="rounded-2xl border border-primary/15 bg-white p-4 shadow-sm">
      {offer.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={offer.foto_url}
          alt=""
          className="mb-3 h-32 w-full rounded-xl object-cover"
        />
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-navy">{offer.titulo}</h3>
        {offer.descuento_pct != null ? (
          <span className="shrink-0 rounded-lg bg-gold/15 px-2 py-0.5 text-xs font-bold text-[#a06900]">
            −{offer.descuento_pct}%
          </span>
        ) : null}
      </div>
      {offer.descripcion ? (
        <p className="mt-2 line-clamp-3 text-sm text-navy/60">{offer.descripcion}</p>
      ) : null}
      <p className="mt-3 text-xs font-semibold text-primary">Termina en: {label}</p>
    </article>
  );
}
