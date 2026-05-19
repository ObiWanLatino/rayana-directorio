"use client";

import { useEffect, useRef, useState } from "react";

export function useDirectorioAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadGeneration = useRef(0);

  useEffect(() => {
    const generation = ++loadGeneration.current;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/suppliers/access");
        const data: { hasAccess?: boolean } = await res.json();
        if (loadGeneration.current === generation) {
          setHasAccess(Boolean(data.hasAccess));
        }
      } catch {
        if (loadGeneration.current === generation) {
          setHasAccess(false);
        }
      } finally {
        if (loadGeneration.current === generation) {
          setLoading(false);
        }
      }
    }

    void load();
  }, []);

  return { hasAccess, loading };
}
