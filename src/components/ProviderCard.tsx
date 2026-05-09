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
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
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
