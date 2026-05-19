"use client";

import type { FeaturedSupplierMetrics } from "@/types/proveedores";
import { Eye, MessageCircle, Package, User } from "lucide-react";
import { useEffect, useState } from "react";

const EMPTY: FeaturedSupplierMetrics = {
  view: 0,
  wa_click: 0,
  catalog_click: 0,
  profile_click: 0,
};

export function FeaturedVitrinaMetrics({ supplierId }: { supplierId: string }) {
  const [metrics, setMetrics] = useState<FeaturedSupplierMetrics>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/suppliers/${supplierId}/metrics`);
        const data: { metrics?: FeaturedSupplierMetrics; error?: string } =
          await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? `Error ${res.status}`);
        }
        if (!cancel) {
          setMetrics(data.metrics ?? EMPTY);
        }
      } catch (e) {
        if (!cancel) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar métricas");
        }
      } finally {
        if (!cancel) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [supplierId]);

  const rows = [
    { label: "Impresiones", value: metrics.view, icon: Eye },
    { label: "Clicks WA", value: metrics.wa_click, icon: MessageCircle },
    { label: "Clicks Catálogo", value: metrics.catalog_click, icon: Package },
    { label: "Visitas Perfil", value: metrics.profile_click, icon: User },
  ] as const;

  return (
    <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">
        Métricas Vitrina (últimos 30 días)
      </h2>
      {loading ? (
        <p className="mt-3 text-sm text-zinc-500">Cargando…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map(({ label, value, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-zinc-700">
                <Icon className="h-4 w-4 text-zinc-500" aria-hidden />
                {label}
              </span>
              <span className="font-semibold tabular-nums text-zinc-900">
                {value.toLocaleString("es-CL")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
