"use client";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getHotmartCheckoutUrl } from "@/lib/hotmart/checkout";
import { useEffect, useMemo, useState } from "react";

export interface HotmartCheckoutButtonProps {
  className?: string;
  label?: string;
  openInNewTab?: boolean;
}

export function HotmartCheckoutButton({
  className,
  label = "Suscribirse con Hotmart",
  openInNewTab = true,
}: HotmartCheckoutButtonProps) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [href, setHref] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancel) return;
        const u = data.user;
        const url = getHotmartCheckoutUrl({
          email: u?.email ?? undefined,
          name:
            typeof u?.user_metadata?.full_name === "string"
              ? u.user_metadata.full_name
              : undefined,
        });
        if (!cancel) setHref(url);
      } catch {
        try {
          const url = getHotmartCheckoutUrl();
          if (!cancel) setHref(url);
        } catch (e) {
          if (!cancel) {
            setError(e instanceof Error ? e.message : "No se pudo armar el checkout");
          }
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [supabase]);

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    );
  }

  if (!href) {
    return (
      <button
        type="button"
        disabled
        className={
          className ??
          "rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white opacity-60"
        }
      >
        Cargando…
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <a
        href={href}
        {...(openInNewTab
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className={
          className ??
          "inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
        }
      >
        {label}
      </a>
      <p className="text-center text-xs text-zinc-500">
        Pagos seguros por Hotmart
      </p>
    </div>
  );
}
