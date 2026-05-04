"use client";

import { FeaturedSupplierCard } from "@/components/suppliers/FeaturedSupplierCard";
import type { Supplier } from "@/types";

export function VerifiedCarousel({ suppliers }: { suppliers: Supplier[] }) {
  return (
    <div style={{ margin: "4px -18px 6px" }}>
      <div
        style={{
          padding: "0 20px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#B98852" aria-hidden>
          <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
        </svg>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#B98852",
            textTransform: "uppercase",
          }}
        >
          Proveedores Verificados
        </span>
      </div>

      <div
        className="rayana-pills-scroll featured-scroll"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          scrollSnapType: "x mandatory",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "4px 18px 8px",
            width: "max-content",
          }}
        >
          {suppliers.map((s) => (
            <FeaturedSupplierCard key={s.id} supplier={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
