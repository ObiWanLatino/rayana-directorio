"use client";

import { BadgePill } from "@/components/proveedores/BadgePill";
import { OfferCard } from "@/components/proveedores/OfferCard";
import { ProductCard } from "@/components/proveedores/ProductCard";
import { WA_MESSAGE } from "@/components/suppliers/SupplierActionButton";
import { trackSupplierEvent } from "@/lib/proveedores/analytics";
import { upsertSupplierReview } from "@/lib/proveedores/mutations";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SupplierReview } from "@/types/proveedores";
import type { PublicSupplierPayload } from "@/lib/proveedores/public-supplier";
import { useEffect, useMemo, useState } from "react";

function waUrl(phone: string | null | undefined): string {
  const raw = phone?.replace(/\D/g, "") ?? "";
  if (!raw) return "";
  return `https://wa.me/${raw}?text=${WA_MESSAGE}`;
}

export function SupplierPublicProfile({
  supplier,
  profile,
  products,
  offers,
  reviews,
  viewerUserId,
  canReview,
}: PublicSupplierPayload & {
  reviews: SupplierReview[];
  viewerUserId: string | null;
  canReview: boolean;
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const ownerId = profile?.user_id ?? null;
  const phone = profile?.whatsapp_negocio?.trim() || supplier.whatsapp;
  const link = waUrl(phone);

  useEffect(() => {
    if (!viewerUserId || !ownerId || viewerUserId === ownerId) return;
    trackSupplierEvent(supabase, supplier.id, "profile_view", viewerUserId);
  }, [supabase, supplier.id, viewerUserId, ownerId]);

  const cover =
    profile?.cover_url?.trim() ||
    supplier.foto_1_url ||
    supplier.logo_url ||
    null;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);

  async function submitReview() {
    if (!viewerUserId) return;
    setReviewMsg(null);
    const { error } = await upsertSupplierReview({
      supabase,
      supplierId: supplier.id,
      userId: viewerUserId,
      rating,
      comentario: comment.trim() || null,
      verified: canReview,
    });
    if (error) setReviewMsg(error.message);
    else setReviewMsg("¡Gracias! Tu reseña fue guardada.");
  }

  return (
    <div className="min-h-screen bg-off pb-16">
      <div className="relative h-48 w-full overflow-hidden bg-navy/10 md:h-64">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-end gap-3 md:left-8">
          {supplier.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={supplier.logo_url}
              alt=""
              className="h-16 w-16 rounded-2xl border-2 border-white object-cover shadow-lg md:h-20 md:w-20"
            />
          ) : null}
          <div>
            <h1 className="font-display text-xl font-bold text-white md:text-2xl">
              {supplier.tienda}
            </h1>
            {profile?.badge ? (
              <div className="mt-1">
                <BadgePill badge={profile.badge} size="sm" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <section className="space-y-2 text-sm text-navy/70">
          {supplier.categoria ? (
            <p>
              <span className="font-semibold text-navy">Categoría:</span>{" "}
              {supplier.categoria}
            </p>
          ) : null}
          {profile?.bio ? <p className="leading-relaxed">{profile.bio}</p> : null}
          <p>
            <span className="font-semibold text-navy">Envíos:</span>{" "}
            {profile?.ships_nationally !== false ? "Nacional" : ""}
            {profile?.ships_internationally ? " · Internacional" : ""}
          </p>
          {profile?.shipping_agent_info ? (
            <p className="rounded-xl bg-primary/5 p-3 text-navy/80">
              {profile.shipping_agent_info}
            </p>
          ) : null}
          {profile?.website_url ? (
            <a
              href={profile.website_url}
              className="font-semibold text-primary underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Sitio web
            </a>
          ) : null}
        </section>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              viewerUserId
                ? trackSupplierEvent(supabase, supplier.id, "wa_click", viewerUserId)
                : trackSupplierEvent(supabase, supplier.id, "wa_click")
            }
            className="flex min-h-12 w-full items-center justify-center rounded-2xl bg-wa text-base font-bold text-white"
          >
            WhatsApp
          </a>
        ) : null}

        {offers.length > 0 ? (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-navy">Ofertas</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {offers.map((o) => (
                <OfferCard key={o.id} offer={o} />
              ))}
            </div>
          </section>
        ) : null}

        {products.length > 0 ? (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-navy">Catálogo</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : null}

        {reviews.length > 0 ? (
          <section>
            <h2 className="mb-3 font-display text-lg font-bold text-navy">Reseñas</h2>
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-primary/10 bg-white p-3 text-sm"
                >
                  <div className="font-semibold text-navy">
                    {"★".repeat(r.rating)}
                    <span className="text-navy/40">{"★".repeat(5 - r.rating)}</span>
                  </div>
                  {r.comentario ? (
                    <p className="mt-1 text-navy/70">{r.comentario}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {viewerUserId ? (
          <section className="rounded-2xl border border-primary/15 bg-white p-4">
            <h2 className="font-semibold text-navy">Dejar reseña</h2>
            {!canReview ? (
              <p className="mt-2 text-sm text-navy/55">
                Abrí WhatsApp desde Makeray al menos una vez para este proveedor y
                podrás dejar una reseña verificada.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <label className="block text-sm font-semibold">Estrellas</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={400}
                  rows={3}
                  className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
                  placeholder="Comentario (opcional)"
                />
                <button
                  type="button"
                  className="min-h-12 w-full rounded-xl bg-primary font-bold text-white"
                  onClick={() => void submitReview()}
                >
                  Publicar
                </button>
                {reviewMsg ? (
                  <p className="text-sm text-navy/60">{reviewMsg}</p>
                ) : null}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
