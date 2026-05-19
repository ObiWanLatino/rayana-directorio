"use client";

import type { FeaturedEventType } from "@/types/proveedores";
import { useCallback, useMemo } from "react";

const SESSION_KEY = "featured_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fs-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return `fs-${Date.now()}`;
  }
}

export function useFeaturedTracking(paisCodigo: string) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  const track = useCallback(
    (supplierId: string, eventType: FeaturedEventType) => {
      void fetch("/api/suppliers/destacados/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: supplierId,
          event_type: eventType,
          session_id: sessionId,
          pais_codigo: paisCodigo,
        }),
        keepalive: true,
      }).catch(() => {
        /* fire-and-forget */
      });
    },
    [paisCodigo, sessionId],
  );

  return { track };
}
