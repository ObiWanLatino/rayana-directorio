"use client";

import { DirectorioCountryTabs } from "@/components/suppliers/DirectorioCountryTabs";
import { FeaturedSupplierSection } from "@/components/suppliers/FeaturedSupplierSection";
import { PaywallBlock } from "@/components/suppliers/PaywallBlock";
import type { SupplierWithFeaturedProfile } from "@/types/proveedores";
import Link from "next/link";

type ProveedoresFreeViewProps = {
  paisCodigo: string;
  featuredSuppliers: SupplierWithFeaturedProfile[];
  featuredLoading: boolean;
};

export function ProveedoresFreeView({
  paisCodigo,
  featuredSuppliers,
  featuredLoading,
}: ProveedoresFreeViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-off">
      <header className="shrink-0 border-b border-primary/10 bg-white px-4 py-4 md:px-8 md:py-6">
        <div className="mb-4">
          <Link
            href="/"
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            ← Inicio
          </Link>
        </div>
        <DirectorioCountryTabs />
        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy md:text-[26px]">
          Directorio Makeray
        </h1>
      </header>

      <main className="flex-1 px-4 py-6 md:px-8">
        <FeaturedSupplierSection
          suppliers={featuredSuppliers}
          loading={featuredLoading}
          paisCodigo={paisCodigo}
          verTodosHref="#directorio-todos"
        />
        <PaywallBlock />
      </main>
    </div>
  );
}
