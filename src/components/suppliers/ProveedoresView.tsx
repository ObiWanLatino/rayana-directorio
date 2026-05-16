"use client";

import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  CATEGORY_SIDEBAR_ALL,
  CategorySidebar,
} from "@/components/CategorySidebar";
import {
  ProviderCard,
  type ProviderCardProvider,
} from "@/components/ProviderCard";
import { ProviderSkeleton } from "@/components/ProviderSkeleton";
import { SearchBar } from "@/components/SearchBar";
import {
  DirectorioCountryTabs,
  directorioPaisCodigo,
  directorioPaisFromSearchParam,
} from "@/components/suppliers/DirectorioCountryTabs";
import { ProveedoresEmptyState } from "@/components/suppliers/ProveedoresEmptyState";
import { WA_MESSAGE } from "@/components/suppliers/SupplierActionButton";
import {
  UNCATEGORIZED,
  buildCategoryOptions,
  categoryPillLabel,
  categorySidebarEmoji,
  matchesCategoryFilter,
  matchesSearch,
  supplierInstagramHref,
  supplierMapsHref,
  supplierTiktokHref,
} from "@/components/suppliers/supplier-utils";
import { useSuppliers } from "@/hooks/useSuppliers";
import { trackSupplierEvent } from "@/lib/proveedores/analytics";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SupplierBadge, SupplierPlan, SupplierWithProfile } from "@/types/proveedores";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function supplierToCardProvider(
  s: SupplierWithProfile,
  onWhatsappNav?: () => void,
): ProviderCardProvider {
  const raw = s.whatsapp?.replace(/\D/g, "") ?? "";
  const whatsappUrl =
    raw !== "" ? `https://wa.me/${raw}?text=${WA_MESSAGE}` : "";
  const cat = s.categoria?.trim();
  const rawSp = s.supplier_profiles;
  const sp = Array.isArray(rawSp) ? rawSp[0] ?? null : rawSp;
  const plan =
    sp?.plan === "vitrina" || sp?.plan === "pro"
      ? (sp.plan as SupplierPlan)
      : null;
  const badge = (sp?.badge as SupplierBadge | undefined) ?? null;
  const fullProfileHref =
    plan === "vitrina" || plan === "pro" ? `/directorio/${s.codigo}` : null;
  return {
    id: s.id,
    code: `#${s.codigo}`,
    name: s.tienda,
    category: cat ? cat : "Sin categoría",
    subcategory: s.tipo?.trim() || undefined,
    location: s.direccion?.trim() || undefined,
    whatsappUrl,
    instagramUrl: supplierInstagramHref(s),
    tiktokUrl: supplierTiktokHref(s),
    mapsUrl: supplierMapsHref(s),
    photoUrl: s.logo_url ?? undefined,
    verified: s.verificado,
    supplierBadge: badge,
    supplierPlan: plan,
    fullProfileHref,
    onWhatsappNav,
  };
}

export function ProveedoresView() {
  const searchParams = useSearchParams();
  const paisTab = directorioPaisFromSearchParam(searchParams.get("pais"));
  const paisCodigo = directorioPaisCodigo(paisTab);
  const { suppliers, loading, error, retry } = useSuppliers(paisCodigo);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userMark, setUserMark] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    queueMicrotask(() => {
      setQuery("");
      setSelectedCategory(null);
    });
  }, [paisTab]);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (cancel) return;
        const u = data.user;
        const e = u?.email;
        setUserEmail(e ?? "");
        setUserMark(e?.[0]?.toUpperCase() ?? "·");
        setViewerUserId(u?.id ?? null);
      } catch {
        if (!cancel) {
          setUserEmail("");
          setUserMark("·");
          setViewerUserId(null);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [supabase]);

  const categoryRows = useMemo(() => {
    const keys = buildCategoryOptions(suppliers);
    return keys.map((key) => ({
      key,
      label: categoryPillLabel(key),
      count: suppliers.filter((s) => {
        const c = s.categoria?.trim();
        if (key === UNCATEGORIZED) return !c;
        return c === key;
      }).length,
    }));
  }, [suppliers]);

  const sidebarCategories = useMemo(
    () =>
      categoryRows.map((row) => ({
        name: row.label,
        emoji: categorySidebarEmoji(row.key),
        count: row.count,
      })),
    [categoryRows],
  );

  const categoryKeys = useMemo(() => categoryRows.map((r) => r.key), [categoryRows]);

  const filtered = useMemo(() => {
    return suppliers
      .filter(
        (s) =>
          matchesSearch(s, query.trim()) &&
          matchesCategoryFilter(s, selectedCategory),
      )
      .sort((a, b) => a.codigo - b.codigo);
  }, [suppliers, query, selectedCategory]);

  const activeSidebarKey =
    selectedCategory === null ? CATEGORY_SIDEBAR_ALL : selectedCategory;

  function onSidebarSelect(cat: string) {
    setFilterOpen(false);
    setSelectedCategory(cat === CATEGORY_SIDEBAR_ALL ? null : cat);
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategory(null);
  }

  const showFilterEmpty =
    !loading && !error && suppliers.length > 0 && filtered.length === 0;

  const userFooter = (
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/25 text-sm font-bold text-white"
        aria-hidden
      >
        {userMark}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-white/50">Sesión</p>
        <p className="truncate text-xs font-medium text-white/90">{userEmail}</p>
      </div>
      <SignOutButton className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10 disabled:opacity-50" />
    </div>
  );

  const sidebarInner = (
    <CategorySidebar
      categories={sidebarCategories}
      keys={categoryKeys}
      active={activeSidebarKey}
      onSelect={onSidebarSelect}
      totalCount={suppliers.length}
      footer={userFooter}
    />
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-off">
      {/* Desktop sidebar */}
      <aside className="hidden min-h-0 w-[240px] shrink-0 flex-col overflow-hidden bg-navy lg:flex">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6">
          {sidebarInner}
        </div>
      </aside>

      {/* Mobile filter drawer */}
      <div
        className={`fixed inset-0 z-40 bg-navy/50 transition-opacity lg:hidden ${
          filterOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!filterOpen}
        onClick={() => setFilterOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] min-h-0 w-[min(88vw,280px)] flex-col overflow-hidden bg-navy shadow-2xl transition-transform duration-200 lg:hidden ${
          filterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6">
          {sidebarInner}
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-primary/10 bg-white px-4 py-4 md:px-8 md:py-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/hub"
              className="text-xs font-medium text-primary underline-offset-2 hover:underline"
            >
              ← Hub
            </Link>
            <button
              type="button"
              className="rounded-lg border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary lg:hidden"
              onClick={() => setFilterOpen(true)}
            >
              ☰ Filtrar
            </button>
          </div>
          <DirectorioCountryTabs />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-[26px]">
                Directorio Makeray
              </h1>
              {!loading && !error && suppliers.length > 0 ? (
                <p className="mt-1 text-sm text-navy/50">
                  {filtered.length}{" "}
                  {filtered.length === 1
                    ? "proveedor encontrado"
                    : "proveedores encontrados"}
                </p>
              ) : null}
            </div>
            <div className="w-full max-w-md lg:shrink-0">
              <label className="sr-only" htmlFor="dir-buscar">
                Buscar proveedores
              </label>
              <SearchBar id="dir-buscar" value={query} onChange={setQuery} />
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProviderSkeleton key={i} />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <div
              className="rounded-[20px] border border-primary/15 bg-white p-8 text-center"
              role="alert"
            >
              <p className="text-sm text-navy/70">{error}</p>
              <button
                type="button"
                onClick={() => retry()}
                className="mt-4 rounded-xl bg-accent px-5 py-2 text-sm font-bold text-white"
              >
                Reintentar
              </button>
            </div>
          ) : null}

          {!loading && !error && suppliers.length === 0 ? (
            <div className="rounded-[20px] border border-primary/10 bg-white p-10 text-center">
              <p className="font-semibold text-navy">Aún no hay proveedores</p>
              <p className="mt-2 text-sm text-navy/55">
                Cuando el equipo cargue el directorio, aparecerán aquí.
              </p>
            </div>
          ) : null}

          {showFilterEmpty ? (
            <ProveedoresEmptyState
              onClear={clearFilters}
              query={query.trim() || undefined}
            />
          ) : null}

          {!loading && !error && filtered.length > 0 ? (
            <div
              className="grid grid-cols-1 gap-4"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {filtered.map((s) => (
                <ProviderCard
                  key={s.id}
                  provider={supplierToCardProvider(s, () =>
                    trackSupplierEvent(supabase, s.id, "wa_click", viewerUserId),
                  )}
                />
              ))}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
