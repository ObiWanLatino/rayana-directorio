"use client";

import { BadgePill } from "@/components/proveedores/BadgePill";
import { supplierInitial } from "@/components/suppliers/supplier-utils";
import type { SupplierBadge, SupplierPlan } from "@/types/proveedores";
import Link from "next/link";

export interface ProviderCardProvider {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  location?: string;
  whatsappUrl: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  mapsUrl?: string;
  photoUrl?: string;
  verified: boolean;
  supplierBadge?: SupplierBadge | null;
  supplierPlan?: SupplierPlan | null;
  fullProfileHref?: string | null;
  onWhatsappNav?: () => void;
}

function WaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.2-.5 0-.2-.7-1.8-1-2.5-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4C8 8.3 7 9.3 7 11.3s1.5 3.9 1.7 4.2c.2.3 3 4.6 7.3 6.4.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.3zM12.1 21.8h-.1c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.8 2.1 14 2.1 12c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.8-10 9.8z" />
    </svg>
  );
}

export function ProviderCard({ provider }: { provider: ProviderCardProvider }) {
  const metaLine = [provider.subcategory, provider.location]
    .filter(Boolean)
    .join(" · ");

  const initials = supplierInitial(provider.name);

  const hasInstagram = Boolean(provider.instagramUrl);
  const hasTiktok = Boolean(provider.tiktokUrl);
  const hasMaps = Boolean(provider.mapsUrl);
  const hasSocialLinks = hasInstagram || hasTiktok || hasMaps;

  const proRing =
    provider.supplierPlan === "pro"
      ? "ring-2 ring-[#f5a623]/50 ring-offset-2 ring-offset-white"
      : "";

  return (
    <article
      data-testid="provider-card"
      className={`group relative rounded-[20px] border border-primary/12 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 ${proRing}`}
    >
      <div className="flex gap-3">
        <div className="relative shrink-0">
          {provider.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.photoUrl}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-[13px] font-bold text-white"
              style={{
                background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h2 className="pr-2 font-semibold leading-snug text-navy">
              {provider.name}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {provider.supplierBadge ? (
                <BadgePill badge={provider.supplierBadge} size="sm" />
              ) : null}
              <span className="font-display text-sm text-navy/45">
                {provider.code}
              </span>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-primary/8 px-2 py-0.5 text-[11px] font-semibold text-primary">
              {provider.category}
            </span>
            {provider.verified ? (
              <span className="rounded border border-gold/30 bg-gold/10 px-1.5 py-px text-[11px] font-bold text-[#a06900]">
                ✓ Verificado
              </span>
            ) : null}
          </div>
          {metaLine ? (
            <p className="mt-2 text-[13px] text-navy/55">{metaLine}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 h-px bg-primary/10" />

      {hasSocialLinks ? (
        <div
          style={{
            display: "flex",
            gap: "8px",
            paddingTop: "4px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          {hasInstagram ? (
            <a
              href={provider.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram del proveedor"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#f3eff8",
                border: "1px solid rgba(89,47,146,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#592f92"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          ) : null}

          {hasTiktok ? (
            <a
              href={provider.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok del proveedor"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#f3eff8",
                border: "1px solid rgba(89,47,146,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="#592f92"
                aria-hidden
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
              </svg>
            </a>
          ) : null}

          {hasMaps ? (
            <a
              href={provider.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicación en Maps"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                backgroundColor: "#f3eff8",
                border: "1px solid rgba(89,47,146,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#592f92"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </a>
          ) : null}
        </div>
      ) : null}

      {provider.whatsappUrl ? (
        <a
          href={provider.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => provider.onWhatsappNav?.()}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-wa py-3 text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          <WaIcon />
          <span className="md:hidden">WhatsApp</span>
          <span className="hidden md:inline">Contactar por WhatsApp</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 flex min-h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-navy/20 py-3 text-sm font-bold text-white/70"
        >
          <WaIcon />
          <span className="md:hidden">WhatsApp</span>
          <span className="hidden md:inline">Contactar por WhatsApp</span>
        </button>
      )}

      {provider.fullProfileHref &&
      (provider.supplierPlan === "vitrina" || provider.supplierPlan === "pro") ? (
        <Link
          href={provider.fullProfileHref}
          className="mt-3 block text-center text-xs font-bold text-primary underline-offset-2 hover:underline"
        >
          Ver perfil completo
        </Link>
      ) : null}
    </article>
  );
}
