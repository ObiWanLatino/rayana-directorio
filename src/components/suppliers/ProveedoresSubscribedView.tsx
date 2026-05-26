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
import { DirectorioCountryTabs } from "@/components/suppliers/DirectorioCountryTabs";
import { FeaturedSupplierSection } from "@/components/suppliers/FeaturedSupplierSection";
import { ProveedoresEmptyState } from "@/components/suppliers/ProveedoresEmptyState";
import { WA_MESSAGE } from "@/components/suppliers/SupplierActionButton";
import {
  UNCATEGORIZED,
  categorySidebarEmoji,
  supplierInstagramHref,
  supplierMapsHref,
  supplierTiktokHref,
} from "@/components/suppliers/supplier-utils";
import { useSuppliers } from "@/hooks/useSuppliers";
import type { SupplierCategoriaRow } from "@/lib/suppliers/fetch-supplier-categorias";
import { trackSupplierEvent } from "@/lib/proveedores/analytics";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type {
  SupplierBadge,
  SupplierPlan,
  SupplierWithFeaturedProfile,
  SupplierWithProfile,
} from "@/types/proveedores";
import Link from "next/link";
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

type ProveedoresSubscribedViewProps = {
  paisCodigo: "55" | "56";
  featuredSuppliers: SupplierWithFeaturedProfile[];
  featuredLoading: boolean;
};

export function ProveedoresSubscribedView({
  paisCodigo,
  featuredSuppliers,
  featuredLoading,
}: ProveedoresSubscribedViewProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoriaRows, setCategoriaRows] = useState<SupplierCategoriaRow[]>([]);
  const [categoriasTotal, setCategoriasTotal] = useState(0);
  const categoriaFilter = selectedCategory ?? "";

  const {
    suppliers,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMore,
    error,
    retry,
  } = useSuppliers(paisCodigo, categoriaFilter, debouncedQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [userMark, setUserMark] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [viewerUserId, setViewerUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancel = false;
    void fetch(`/api/suppliers/categorias?pais_codigo=${paisCodigo}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json: { categorias?: SupplierCategoriaRow[]; total?: number }) => {
        if (cancel) return;
        setCategoriaRows(json.categorias ?? []);
        setCategoriasTotal(json.total ?? 0);
      })
      .catch(() => {
        if (!cancel) {
          setCategoriaRows([]);
          setCategoriasTotal(0);
        }
      });
    return () => {
      cancel = true;
    };
  }, [paisCodigo]);

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

  const categoryRows = categoriaRows;

  const sidebarCategories = useMemo(
    () =>
      categoryRows.map((row) => ({
        name: row.label,
        emoji: categorySidebarEmoji(row.key),
        count: row.count,
      })),
    [categoryRows],
  );

  const categoryKeys = useMemo(
    () => categoryRows.map((r) => r.key),
    [categoryRows],
  );

  const filtered = useMemo(
    () => [...suppliers].sort((a, b) => a.codigo - b.codigo),
    [suppliers],
  );

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
    !loading &&
    !error &&
    suppliers.length === 0 &&
    (debouncedQuery.trim() !== "" || selectedCategory !== null);

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
      totalCount={categoriasTotal || totalCount}
      footer={userFooter}
    />
  );

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-off">
      <aside className="hidden min-h-0 w-[240px] shrink-0 flex-col overflow-hidden bg-navy lg:flex">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-6">
          {sidebarInner}
        </div>
      </aside>

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
              {!loading && !error && (totalCount > 0 || suppliers.length > 0) ? (
                <p className="mt-1 text-sm text-navy/50">
                  {suppliers.length} de {totalCount || suppliers.length}{" "}
                  {totalCount === 1
                    ? "proveedor"
                    : "proveedores"}
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

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 text-sm transition ${
                selectedCategory === null
                  ? "border-primary bg-primary font-bold text-white"
                  : "border-primary/20 bg-transparent font-normal text-navy/60 hover:border-primary/40"
              }`}
            >
              Todas
            </button>
            {categoryRows.map((row) => (
              <button
                key={row.key}
                type="button"
                onClick={() => setSelectedCategory(row.key)}
                className={`shrink-0 whitespace-nowrap rounded-full border-[1.5px] px-4 py-1.5 text-sm transition ${
                  selectedCategory === row.key
                    ? "border-primary bg-primary font-bold text-white"
                    : "border-primary/20 bg-transparent font-normal text-navy/60 hover:border-primary/40"
                }`}
              >
                {row.label}
              </button>
            ))}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <FeaturedSupplierSection
            suppliers={featuredSuppliers}
            loading={featuredLoading}
            paisCodigo={paisCodigo}
            verTodosHref="#directorio-todos"
          />

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

          {!loading && !error && suppliers.length === 0 && !debouncedQuery && selectedCategory === null ? (
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
              id="directorio-todos"
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

          {hasMore ? (
            <div className="py-8 text-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-xl border-[1.5px] border-primary bg-transparent px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? "Cargando…" : "Ver más proveedores"}
              </button>
            </div>
          ) : null}

          {!hasMore && !loading && !error && suppliers.length > 0 ? (
            <p className="py-6 text-center text-sm text-navy/50">
              Mostraste los {suppliers.length} proveedores disponibles
            </p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
