"use client";

import { ProveedoresFreeView } from "@/components/suppliers/ProveedoresFreeView";
import { ProveedoresSubscribedView } from "@/components/suppliers/ProveedoresSubscribedView";
import {
  directorioPaisCodigo,
  directorioPaisFromSearchParam,
} from "@/components/suppliers/DirectorioCountryTabs";
import { useDirectorioAccess } from "@/hooks/useDirectorioAccess";
import { useFeaturedSuppliers } from "@/hooks/useFeaturedSuppliers";
import { useSearchParams } from "next/navigation";

export function ProveedoresView() {
  const searchParams = useSearchParams();
  const paisTab = directorioPaisFromSearchParam(searchParams.get("pais"));
  const paisCodigo = directorioPaisCodigo(paisTab);
  const { hasAccess, loading: accessLoading } = useDirectorioAccess();
  const {
    suppliers: featuredSuppliers,
    loading: featuredLoading,
  } = useFeaturedSuppliers(paisCodigo);

  if (accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off">
        <p className="text-sm text-navy/50">Cargando directorio…</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <ProveedoresFreeView
        paisCodigo={paisCodigo}
        featuredSuppliers={featuredSuppliers}
        featuredLoading={featuredLoading}
      />
    );
  }

  return (
    <ProveedoresSubscribedView
      paisCodigo={paisCodigo}
      featuredSuppliers={featuredSuppliers}
      featuredLoading={featuredLoading}
    />
  );
}
