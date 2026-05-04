"use client";

import { RayanaAvatar } from "@/components/suppliers/RayanaAvatar";
import { VerifiedBadge } from "@/components/suppliers/VerifiedBadge";
import { WA_MESSAGE } from "@/components/suppliers/SupplierActionButton";
import type { Supplier } from "@/types";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

export interface FeaturedSupplierCardProps {
  supplier: Supplier;
}

function hueFromName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 360;
  }
  return h;
}

const cardStyle: CSSProperties = {
  flex: "0 0 142px",
  scrollSnapAlign: "start",
  width: "142px",
  minWidth: "142px",
  background: "#FFFFFF",
  borderRadius: 16,
  border: "0.5px solid rgba(180,140,100,.2)",
  boxShadow:
    "5px 5px 14px rgba(120,90,60,.08), -3px -3px 10px rgba(255,255,255,.9)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const waBtnStyle: CSSProperties = {
  marginTop: 8,
  width: "100%",
  background: "#25D366",
  border: "none",
  cursor: "pointer",
  color: "white",
  fontWeight: 500,
  fontSize: 12,
  padding: "8px 0",
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  boxShadow:
    "0 2px 5px rgba(37,211,102,.35), inset 0 1px 0 rgba(255,255,255,.25)",
  fontFamily: "inherit",
};

export function FeaturedSupplierCard({ supplier }: FeaturedSupplierCardProps) {
  const photos = useMemo(
    () =>
      [supplier.foto_1_url, supplier.foto_2_url, supplier.foto_3_url].filter(
        Boolean,
      ) as string[],
    [supplier.foto_1_url, supplier.foto_2_url, supplier.foto_3_url],
  );

  const photoCount = Math.max(photos.length, 1);
  const [photoIdx, setPhotoIdx] = useState(0);
  const slideIndex = photos.length > 0 ? photoIdx % photos.length : 0;
  const showCarouselControls = photos.length >= 2;

  const wa =
    supplier.whatsapp != null &&
    supplier.whatsapp !== "" &&
    `https://wa.me/${supplier.whatsapp}?text=${WA_MESSAGE}`;

  const hue = hueFromName(supplier.tienda);
  const placeholderGradient = `linear-gradient(135deg, hsl(${hue} 55% 75%), hsl(${(hue + 25) % 360} 50% 55%))`;

  function prev() {
    setPhotoIdx((i) => (i - 1 + photoCount) % photoCount);
  }

  function next() {
    setPhotoIdx((i) => (i + 1) % photoCount);
  }

  return (
    <article style={cardStyle}>
      <div
        style={{
          position: "relative",
          height: 200,
          background:
            photos.length === 0 ? placeholderGradient : "#E8DDD0",
          transition: photos.length === 0 ? "background .3s" : undefined,
        }}
      >
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photos[slideIndex]}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ position: "relative", zIndex: 0 }}
          >
            <RayanaAvatar name={supplier.tienda} size={88} />
          </div>
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,.18), transparent 60%)",
          }}
          aria-hidden
        />

        {supplier.verificado ? <VerifiedBadge /> : null}

        {showCarouselControls ? (
          <>
            <button
              type="button"
              aria-label="Foto anterior"
              style={{
                position: "absolute",
                left: 6,
                bottom: 8,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                zIndex: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Foto siguiente"
              style={{
                position: "absolute",
                right: 6,
                bottom: 8,
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(0,0,0,.45)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                zIndex: 2,
              }}
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 6l6 6-6 6"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 4,
                zIndex: 2,
              }}
            >
              {Array.from({ length: photoCount }).map((_, i) => (
                <div
                  key={i}
                  data-testid={`featured-dot-${i}`}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background:
                      i === photoIdx % photoCount
                        ? "white"
                        : "rgba(255,255,255,.45)",
                    transition: "background .25s",
                  }}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div style={{ padding: "10px 10px 10px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "#2B2B2B",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {supplier.tienda}
        </div>
        <div
          style={{
            fontSize: 10.5,
            color: "#A89878",
            marginTop: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {supplier.categoria?.trim() || "—"}
        </div>
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...waBtnStyle, textDecoration: "none" }}
            onClick={(e) => e.stopPropagation()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
            </svg>
            WhatsApp
          </a>
        ) : null}
      </div>
    </article>
  );
}
