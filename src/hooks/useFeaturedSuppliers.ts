"use client";

import type { SupplierWithFeaturedProfile } from "@/types/proveedores";
import { useEffect, useRef, useState } from "react";

export function useFeaturedSuppliers(paisCodigo: "55" | "56") {
  const [suppliers, setSuppliers] = useState<SupplierWithFeaturedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadGeneration = useRef(0);

  useEffect(() => {
    const generation = ++loadGeneration.current;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ pais_codigo: paisCodigo });
        const res = await fetch(`/api/suppliers/destacados?${qs.toString()}`, {
          cache: "no-store",
        });
        const data: {
          suppliers?: SupplierWithFeaturedProfile[];
          error?: string;
        } = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? `Error ${res.status}`);
        }
        if (loadGeneration.current === generation) {
          setSuppliers(data.suppliers ?? []);
        }
      } catch (e) {
        if (loadGeneration.current === generation) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
        }
      } finally {
        if (loadGeneration.current === generation) {
          setLoading(false);
        }
      }
    }

    void load();
  }, [paisCodigo]);

  return { suppliers, loading, error };
}
