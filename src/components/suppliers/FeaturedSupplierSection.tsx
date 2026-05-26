"use client";

import { featuredCoverImgStyle } from "@/components/suppliers/featured-cover-position";
import { WA_MESSAGE } from "@/components/suppliers/SupplierActionButton";
import {
  supplierInitial,
  supplierInstagramHref,
} from "@/components/suppliers/supplier-utils";
import { useFeaturedTracking } from "@/hooks/useFeaturedTracking";
import type { FeaturedEventType } from "@/types/proveedores";
import type {
  SupplierFeaturedProfileSummary,
  SupplierWithFeaturedProfile,
} from "@/types/proveedores";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  MessageCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

type FeaturedSupplierSectionProps = {
  suppliers: SupplierWithFeaturedProfile[];
  loading: boolean;
  paisCodigo: string;
  verTodosHref?: string;
  hideWhatsapp?: boolean;
  showInstagram?: boolean;
};

function resolveProfile(
  s: SupplierWithFeaturedProfile,
): SupplierFeaturedProfileSummary | null {
  const raw = s.supplier_profiles;
  return Array.isArray(raw) ? raw[0] ?? null : raw;
}

/** suppliers.cover_url tiene prioridad sobre supplier_profiles (vitrina admin). */
function resolveCoverUrl(s: SupplierWithFeaturedProfile): string | null {
  const fromSupplier = s.cover_url?.trim() || null;
  if (fromSupplier) return fromSupplier;
  const profile = resolveProfile(s);
  return profile?.cover_url?.trim() || null;
}

function whatsappHref(whatsapp: string | null): string | null {
  const raw = whatsapp?.replace(/\D/g, "") ?? "";
  if (raw === "") return null;
  return `https://wa.me/${raw}?text=${WA_MESSAGE}`;
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FeaturedSupplierCard({
  supplier,
  track,
  hideWhatsapp,
  showInstagram,
}: {
  supplier: SupplierWithFeaturedProfile;
  track: (supplierId: string, eventType: FeaturedEventType) => void;
  hideWhatsapp?: boolean;
  showInstagram?: boolean;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const viewedRef = useRef(false);
  const profile = resolveProfile(supplier);
  const plan = profile?.plan;
  const fullProfileHref =
    plan === "vitrina" || plan === "pro"
      ? `/directorio/${supplier.codigo}`
      : null;
  const coverUrl = resolveCoverUrl(supplier);
  const bannerH = supplier.cover_height ?? 128;
  const whatsappUrl = whatsappHref(supplier.whatsapp);
  const instagramUrl = supplierInstagramHref(supplier);
  const showWhatsapp = Boolean(whatsappUrl && hideWhatsapp !== true);
  const showIg = Boolean(showInstagram && instagramUrl);
  const initials = supplierInitial(supplier.tienda);
  const metaParts = [supplier.categoria?.trim(), supplier.direccion?.trim()].filter(
    Boolean,
  );
  const metaLine = metaParts.join(" · ");
  const hasPhotos = Boolean(
    supplier.foto_1_url || supplier.foto_2_url || supplier.foto_3_url,
  );
  const photoUrls = [
    supplier.foto_1_url,
    supplier.foto_2_url,
    supplier.foto_3_url,
  ];

  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          track(supplier.id, "view");
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [supplier.id, track]);

  return (
    <article
      ref={articleRef}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm transition-transform hover:-translate-y-1"
    >
      <div
        className="relative w-full overflow-hidden bg-gradient-to-br from-[#23153c] to-indigo-600"
        style={{ height: `${bannerH}px` }}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            style={featuredCoverImgStyle(
              supplier.cover_position_y ?? 50,
              bannerH,
            )}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
          <Star className="h-3 w-3 fill-yellow-900" aria-hidden />
          Destacado
        </div>
      </div>

      <Link
        href={`/directorio/${supplier.codigo}`}
        onClick={() => track(supplier.id, "profile_click")}
        className="relative z-10 -mt-8 mb-2 ml-5 block h-16 w-16 rounded-xl bg-white p-1 shadow-md"
      >
        {supplier.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supplier.logo_url}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-indigo-100 text-xl font-bold text-indigo-700">
            {initials}
          </div>
        )}
      </Link>

      <Link
        href={`/directorio/${supplier.codigo}`}
        onClick={() => track(supplier.id, "profile_click")}
        className="flex items-center gap-1 px-5 text-lg font-bold text-gray-900 hover:underline"
      >
        {supplier.tienda}
        {supplier.verificado ? (
          <CheckCircle
            className="h-3.5 w-3.5 fill-blue-50 text-blue-500"
            aria-hidden
          />
        ) : null}
      </Link>
      {metaLine ? (
        <p className="mb-4 px-5 text-xs text-gray-500">{metaLine}</p>
      ) : (
        <div className="mb-4" />
      )}

      {hasPhotos ? (
        <div className="mb-4 flex gap-2 px-5">
          {photoUrls.map((url, i) =>
            url ? (
              <div
                key={i}
                className="aspect-square flex-1 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null,
          )}
        </div>
      ) : null}

      <div className="mt-auto px-5 pb-5">
        {fullProfileHref ? (
          <Link
            href={fullProfileHref}
            onClick={() => track(supplier.id, "catalog_click")}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Catálogo
          </Link>
        ) : null}
        {showWhatsapp || showIg ? (
          <div
            className={`flex flex-wrap gap-2 ${fullProfileHref ? "mt-4" : ""}`}
          >
            {showWhatsapp ? (
              <a
                href={whatsappUrl!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                onClick={() => track(supplier.id, "wa_click")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            ) : null}
            {showIg ? (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver Instagram"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-85"
              >
                <InstagramIcon className="h-4 w-4" />
                Instagram
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function FeaturedSupplierSection({
  suppliers,
  loading,
  paisCodigo,
  verTodosHref = "#directorio-todos",
  hideWhatsapp,
  showInstagram,
}: FeaturedSupplierSectionProps) {
  const { track } = useFeaturedTracking(paisCodigo);

  if (loading) {
    return null;
  }

  if (suppliers.length === 0) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="mb-8 rounded-xl border-2 border-dashed border-yellow-200 p-6 text-center text-sm text-yellow-600">
          ★ Proveedores Destacados — Sin datos. Marca un proveedor como destacado en
          el admin.
        </div>
      );
    }
    return null;
  }

  return (
    <section className="mb-8" aria-labelledby="featured-suppliers-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2
          id="featured-suppliers-heading"
          className="flex items-center gap-2 font-display text-lg font-bold text-navy md:text-xl"
        >
          <Star className="h-5 w-5 fill-gold text-gold" aria-hidden />
          Proveedores Destacados
        </h2>
        <a
          href={verTodosHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => (
          <FeaturedSupplierCard
            key={s.id}
            supplier={s}
            track={track}
            hideWhatsapp={hideWhatsapp}
            showInstagram={showInstagram}
          />
        ))}
      </div>
    </section>
  );
}
