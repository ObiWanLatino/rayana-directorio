"use client";

import type { SupplierWithProfile } from "@/types/proveedores";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSuppliers(paisCodigo: "55" | "56") {
  const [suppliers, setSuppliers] = useState<SupplierWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** Evita dejar loading en true cuando Strict Mode desmonta el efecto antes del finally. */
  const loadGeneration = useRef(0);

  const retry = useCallback(() => {
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    const generation = ++loadGeneration.current;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ pais_codigo: paisCodigo });
        const res = await fetch(`/api/suppliers?${qs.toString()}`);
        const data: { suppliers?: SupplierWithProfile[]; error?: string } =
          await res.json();
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
  }, [attempt, paisCodigo]);

  return { suppliers, loading, error, retry };
}
