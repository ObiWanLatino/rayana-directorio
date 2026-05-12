"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const PAIS_QUERY = "pais";

export type DirectorioPaisTab = "cl" | "br";

export function directorioPaisFromSearchParam(
  value: string | null | undefined,
): DirectorioPaisTab {
  return value?.toLowerCase() === "br" ? "br" : "cl";
}

export function directorioPaisCodigo(tab: DirectorioPaisTab): "55" | "56" {
  return tab === "br" ? "55" : "56";
}

export function DirectorioCountryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = directorioPaisFromSearchParam(searchParams.get(PAIS_QUERY));

  const setPais = useCallback(
    (next: DirectorioPaisTab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === "cl") {
        params.delete(PAIS_QUERY);
      } else {
        params.set(PAIS_QUERY, "br");
      }
      const q = params.toString();
      router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="País del directorio">
      <button
        type="button"
        role="tab"
        aria-selected={active === "cl"}
        onClick={() => setPais("cl")}
        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${
          active === "cl"
            ? "border-primary bg-primary/12 text-navy shadow-sm"
            : "border-primary/15 bg-white text-navy/65 hover:border-primary/35 hover:text-navy"
        }`}
      >
        🇨🇱 Chile
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={active === "br"}
        onClick={() => setPais("br")}
        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${
          active === "br"
            ? "border-primary bg-primary/12 text-navy shadow-sm"
            : "border-primary/15 bg-white text-navy/65 hover:border-primary/35 hover:text-navy"
        }`}
      >
        🇧🇷 Brasil
      </button>
    </div>
  );
}
