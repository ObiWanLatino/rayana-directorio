"use client";

import type { Supplier } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
        const res = await fetch("/api/suppliers");
        const data: { suppliers?: Supplier[]; error?: string } =
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
  }, [attempt]);

  return { suppliers, loading, error, retry };
}
