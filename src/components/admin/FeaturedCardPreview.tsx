"use client";

import {
  featuredCoverImgStyle,
  getCoverOffsetPx,
} from "@/components/suppliers/featured-cover-position";
import { supplierInitial } from "@/components/suppliers/supplier-utils";
import {
  BookOpen,
  CheckCircle,
  GripHorizontal,
  MessageCircle,
  Star,
} from "lucide-react";
import { useRef } from "react";

export type FeaturedCardPreviewProps = {
  tienda: string;
  categoria?: string;
  direccion?: string;
  verificado: boolean;
  logoUrl: string | null;
  coverUrl: string | null;
  coverHeight?: number;
  coverPositionY?: number;
  /** Permite arrastrar la portada para reposicionar (solo admin). */
  editableCover?: boolean;
  onCoverPositionChange?: (y: number) => void;
  foto1Url: string | null;
  foto2Url: string | null;
  foto3Url: string | null;
  /** Si se omite, solo se muestra el botón WA en preview. */
  showCatalog?: boolean;
  whatsappUrl?: string | null;
};

export function FeaturedCardPreview({
  tienda,
  categoria = "",
  direccion = "",
  verificado,
  logoUrl,
  coverUrl,
  coverHeight = 128,
  coverPositionY = 50,
  editableCover = false,
  onCoverPositionChange,
  foto1Url,
  foto2Url,
  foto3Url,
  showCatalog = true,
  whatsappUrl = null,
}: FeaturedCardPreviewProps) {
  const initials = supplierInitial(tienda || "?");
  const metaParts = [categoria?.trim(), direccion?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : "—";
  const hasPhotos = Boolean(foto1Url || foto2Url || foto3Url);
  const photoUrls = [foto1Url, foto2Url, foto3Url];

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const coverPositionRef = useRef(coverPositionY);
  coverPositionRef.current = coverPositionY;

  const bannerH = coverHeight ?? 128;

  function onMouseDown(e: React.MouseEvent) {
    if (!editableCover || !onCoverPositionChange) return;
    const setPosition: (y: number) => void = onCoverPositionChange;
    e.preventDefault();
    isDragging.current = true;
    lastY.current = e.clientY;

    function onMove(ev: MouseEvent) {
      if (!isDragging.current || !containerRef.current) return;
      const containerH = containerRef.current.offsetHeight;
      const imgH = containerH * 1.5;
      const maxOffset = imgH - containerH;
      if (maxOffset <= 0) return;

      const delta = ev.clientY - lastY.current;
      lastY.current = ev.clientY;
      const currentOffsetPx = getCoverOffsetPx(
        coverPositionRef.current,
        containerH,
      );
      const newOffsetPx = Math.max(
        -maxOffset,
        Math.min(0, currentOffsetPx + delta),
      );
      const newPosY = Math.round((-newOffsetPx / maxOffset) * 100);
      coverPositionRef.current = newPosY;
      setPosition(newPosY);
    }

    function onUp() {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-gradient-to-br from-[#23153c] to-indigo-600"
        style={{
          height: `${bannerH}px`,
          cursor: editableCover ? "ns-resize" : "default",
          userSelect: editableCover ? "none" : undefined,
        }}
        onMouseDown={editableCover ? onMouseDown : undefined}
      >
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={coverUrl}
            alt=""
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{
              ...featuredCoverImgStyle(coverPositionY, bannerH),
              pointerEvents: editableCover ? "none" : undefined,
            }}
          />
        ) : null}
        {editableCover && coverUrl ? (
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
            <GripHorizontal className="h-3 w-3" aria-hidden />
            Arrastra para reposicionar
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
          <Star className="h-3 w-3 fill-yellow-900" aria-hidden />
          Destacado
        </div>
      </div>

      <div className="relative z-10 -mt-8 mb-2 ml-5 h-16 w-16 rounded-xl bg-white p-1 shadow-md">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-indigo-100 text-xl font-bold text-indigo-700">
            {initials}
          </div>
        )}
      </div>

      <h3 className="flex items-center gap-1 px-5 text-lg font-bold text-gray-900">
        {tienda || "Nombre del proveedor"}
        {verificado ? (
          <CheckCircle
            className="h-3.5 w-3.5 fill-blue-50 text-blue-500"
            aria-hidden
          />
        ) : null}
      </h3>
      <p className="mb-4 px-5 text-xs text-gray-500">{metaLine}</p>

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

      <div className="mt-auto grid grid-cols-2 gap-2 px-5 pb-5">
        {showCatalog ? (
          <div className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700">
            <BookOpen className="h-4 w-4" aria-hidden />
            Catálogo
          </div>
        ) : null}
        {whatsappUrl ? (
          <div
            className={`flex items-center justify-center gap-1 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white ${
              !showCatalog ? "col-span-2" : ""
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Contactar
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-medium text-gray-500 ${
              !showCatalog ? "col-span-2" : ""
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Contactar
          </div>
        )}
      </div>
    </article>
  );
}
