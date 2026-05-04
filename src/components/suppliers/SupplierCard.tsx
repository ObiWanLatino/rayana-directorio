"use client";

import { CodeBadge } from "@/components/suppliers/CodeBadge";
import {
  IconChevron,
  IconNoteLine,
  IconPinLine,
  IconTagLine,
} from "@/components/suppliers/directory-icons";
import { RayanaAvatar } from "@/components/suppliers/RayanaAvatar";
import { SupplierActionButton } from "@/components/suppliers/SupplierActionButton";
import type { Supplier } from "@/types";
import type { ReactNode } from "react";
import { useState } from "react";

type SupplierCardProps = {
  supplier: Supplier;
};

function DetailRow({
  icon,
  label,
  value,
  italic,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  italic?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <div
          className="text-[10.5px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "#A89878" }}
        >
          {label}
        </div>
        <div
          className="mt-px text-[13.5px] leading-snug"
          style={{
            color: "#3D3530",
            fontStyle: italic ? "italic" : "normal",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function SupplierCard({ supplier }: SupplierCardProps) {
  const [open, setOpen] = useState(false);
  const wa = supplier.whatsapp;
  const ig = supplier.instagram;
  const dir = supplier.direccion?.trim();
  const cat = supplier.categoria?.trim();

  const igHref =
    ig != null && ig !== "" ? `https://instagram.com/${ig}` : undefined;
  const mapHref =
    dir != null && dir !== ""
      ? `https://maps.google.com/?q=${encodeURIComponent(dir)}`
      : undefined;

  return (
    <article
      className="clay-card cursor-pointer px-3.5 py-3.5 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
      data-expanded={open}
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={() => setOpen((o) => !o)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen((o) => !o);
        }
      }}
    >
      <div className="flex items-center gap-2.5">
        <CodeBadge code={supplier.codigo} />
        {supplier.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supplier.logo_url}
            alt=""
            className="h-[38px] w-[38px] shrink-0 rounded-full object-cover"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.45), 0 2px 5px rgba(0,0,0,.06)",
            }}
          />
        ) : (
          <RayanaAvatar name={supplier.tienda} size={38} />
        )}
        <div className="min-w-0 flex-1">
          <div
            className="truncate text-base font-semibold tracking-tight"
            style={{ color: "#2B2B2B" }}
          >
            {supplier.tienda}
          </div>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {cat ? (
              <span
                className="shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-[11.5px] font-semibold tracking-wide"
                style={{
                  color: "#3F7B7D",
                  background: "rgba(168, 218, 220, .35)",
                }}
              >
                {cat}
              </span>
            ) : null}
            <span
              className="min-w-0 truncate text-[11.5px]"
              style={{ color: "#A89878" }}
            >
              {ig ? `@${ig}` : "Sin Instagram"}
            </span>
          </div>
        </div>
        <IconChevron open={open} />
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <SupplierActionButton
          kind="whatsapp"
          disabled={!wa}
          whatsappPhone={wa ?? undefined}
        />
        <SupplierActionButton
          kind="instagram"
          disabled={!ig}
          href={igHref}
        />
        <SupplierActionButton kind="map" disabled={!dir} href={mapHref} />
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className="mt-3.5 flex flex-col gap-2.5 border-t border-dashed pt-3.5"
            style={{ borderColor: "rgba(120,90,60,.15)" }}
          >
            {dir ? (
              <DetailRow
                icon={<IconPinLine />}
                label="Dirección"
                value={dir}
              />
            ) : null}
            {supplier.tipo ? (
              <DetailRow
                icon={<IconTagLine />}
                label="Tipo"
                value={supplier.tipo}
              />
            ) : null}
            {supplier.observacion ? (
              <DetailRow
                icon={<IconNoteLine />}
                label="Observación"
                value={supplier.observacion}
                italic
              />
            ) : null}
            {!dir && !supplier.tipo && !supplier.observacion ? (
              <p className="text-sm" style={{ color: "#7A7A7A" }}>
                Sin detalles adicionales.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
