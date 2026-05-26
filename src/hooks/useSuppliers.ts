"use client";

import type { SupplierWithProfile } from "@/types/proveedores";
import { useCallback, useEffect, useRef, useState } from "react";

type SuppliersPageResponse = {
  data?: SupplierWithProfile[];
  count?: number;
  hasMore?: boolean;
  error?: string;
};

export function useSuppliers(
  paisCodigo: "55" | "56",
  categoria: string,
  q: string,
) {
  const [suppliers, setSuppliers] = useState<SupplierWithProfile[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const loadGeneration = useRef(0);

  const retry = useCallback(() => {
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    setSuppliers([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(0);
  }, [paisCodigo, categoria, q, attempt]);

  useEffect(() => {
    const generation = ++loadGeneration.current;
    const isFirst = page === 0;

    if (isFirst) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    const params = new URLSearchParams({
      page: String(page),
      pais_codigo: paisCodigo,
    });
    if (categoria) params.set("categoria", categoria);
    if (q) params.set("q", q);

    void fetch(`/api/suppliers?${params.toString()}`, { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json()) as SuppliersPageResponse;
        if (!res.ok) {
          throw new Error(json.error ?? `Error ${res.status}`);
        }
        if (loadGeneration.current !== generation) return;

        const batch = json.data ?? [];
        setSuppliers((prev) => (page === 0 ? batch : [...prev, ...batch]));
        setHasMore(json.hasMore ?? false);
        setTotalCount(json.count ?? batch.length);
      })
      .catch((e) => {
        if (loadGeneration.current === generation) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar los datos");
        }
      })
      .finally(() => {
        if (loadGeneration.current === generation) {
          setLoading(false);
          setLoadingMore(false);
        }
      });
  }, [page, paisCodigo, categoria, q, attempt]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setPage((p) => p + 1);
    }
  }, [hasMore, loading, loadingMore]);

  return {
    suppliers,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    error,
    retry,
  };
}
