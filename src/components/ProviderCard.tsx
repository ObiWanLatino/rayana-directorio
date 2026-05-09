"use client";

import { supplierInitial } from "@/components/suppliers/supplier-utils";

export interface ProviderCardProvider {
  id: string;
  code: string;
  name: string;
  category: string;
  subcategory?: string;
  location?: string;
  whatsappUrl: string;
  photoUrl?: string;
  verified: boolean;
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

  return (
    <article
      data-testid="provider-card"
      className="group relative rounded-[20px] border border-primary/12 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
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
            <span className="font-display shrink-0 text-sm text-navy/45">
              {provider.code}
            </span>
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

      {provider.whatsappUrl ? (
        <a
          href={provider.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-wa py-3 text-sm font-bold text-white transition-transform active:scale-[0.99]"
        >
          <WaIcon />
          <span className="md:hidden">WhatsApp</span>
          <span className="hidden md:inline">Contactar por WhatsApp</span>
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-navy/20 py-3 text-sm font-bold text-white/70"
        >
          <WaIcon />
          <span className="md:hidden">WhatsApp</span>
          <span className="hidden md:inline">Contactar por WhatsApp</span>
        </button>
      )}
    </article>
  );
}
