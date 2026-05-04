"use client";

import { ProveedoresEmptyState } from "@/components/suppliers/ProveedoresEmptyState";
import {
  IconClose,
  IconSearch,
} from "@/components/suppliers/directory-icons";
import { SectionDivider } from "@/components/suppliers/SectionDivider";
import { SupplierCard } from "@/components/suppliers/SupplierCard";
import { VerifiedCarousel } from "@/components/suppliers/VerifiedCarousel";
import { SupplierListSkeleton } from "@/components/suppliers/SupplierListSkeleton";
import {
  UNCATEGORIZED,
  buildCategoryOptions,
  categoryPillLabel,
  matchesCategoryFilter,
  matchesSearch,
} from "@/components/suppliers/supplier-utils";
import { useSuppliers } from "@/hooks/useSuppliers";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function DirectorySearch({
  query,
  setQuery,
  searchFocused,
  setSearchFocused,
  id,
}: {
  query: string;
  setQuery: (q: string) => void;
  searchFocused: boolean;
  setSearchFocused: (v: boolean) => void;
  id: string;
}) {
  return (
    <div
      className={`clay-input flex items-center gap-2.5 px-3.5 py-3 transition-[box-shadow] duration-[250ms] ${
        searchFocused ? "clay-input-focus" : ""
      }`}
    >
      <IconSearch />
      <input
        id={id}
        type="search"
        autoComplete="off"
        placeholder="Buscar por código, nombre o categoría..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        className="min-w-0 flex-1 border-0 bg-transparent text-[15px] outline-none"
        style={{ color: "#2B2B2B", fontFamily: "inherit" }}
      />
      {query ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-0 p-0"
          style={{ background: "rgba(0,0,0,.08)" }}
          onClick={() => setQuery("")}
        >
          <IconClose />
        </button>
      ) : null}
    </div>
  );
}

export function ProveedoresView() {
  const { suppliers, loading, error, retry } = useSuppliers();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchFocusedMobile, setSearchFocusedMobile] = useState(false);
  const [searchFocusedDesktop, setSearchFocusedDesktop] = useState(false);
  const [userMark, setUserMark] = useState("");

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const sb = createBrowserSupabaseClient();
        const { data } = await sb.auth.getUser();
        if (cancel) return;
        const e = data.user?.email;
        setUserMark(e?.[0]?.toUpperCase() ?? "·");
      } catch {
        if (!cancel) setUserMark("·");
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

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

  const categories = useMemo(
    () => buildCategoryOptions(suppliers),
    [suppliers],
  );

  const filtered = useMemo(() => {
    return suppliers
      .filter(
        (s) =>
          matchesSearch(s, query.trim()) &&
          matchesCategoryFilter(s, selectedCategory),
      )
      .sort((a, b) => a.codigo - b.codigo);
  }, [suppliers, query, selectedCategory]);

  const featured = useMemo(
    () => suppliers.filter((s) => s.destacado && s.activo),
    [suppliers],
  );

  const regular = useMemo(
    () => filtered.filter((s) => !s.destacado),
    [filtered],
  );

  function toggleCategory(cat: string) {
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  }

  function clearFilters() {
    setQuery("");
    setSelectedCategory(null);
  }

  const showFilterEmpty =
    !loading &&
    !error &&
    suppliers.length > 0 &&
    filtered.length === 0;

  const userBubble = (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
      style={{
        background: "linear-gradient(135deg, #E8A88E, #C4763E)",
        boxShadow:
          "0 3px 8px rgba(196,118,62,.3), inset 0 1px 0 rgba(255,255,255,.35)",
      }}
      aria-hidden
    >
      {userMark}
    </div>
  );

  return (
    <div className="min-h-screen lg:bg-[radial-gradient(ellipse_at_top,#F2E9D8_0%,#E8DBC8_100%)] lg:p-8">
      <div
        className="rayana-dir-bg flex min-h-screen flex-col lg:mx-auto lg:max-w-[1200px] lg:min-h-[calc(100vh-4rem)] lg:overflow-hidden lg:rounded-[28px] lg:shadow-[0_30px_60px_rgba(120,90,60,0.18),0_12px_24px_rgba(120,90,60,0.08)]"
        style={{ color: "#2B2B2B" }}
      >
        {!loading && !error && featured.length > 0 ? (
          <VerifiedCarousel suppliers={featured} />
        ) : null}

        {/* Mobile header */}
        <header className="clay-header px-5 pb-2.5 pt-safe lg:hidden">
          <Link
            href="/hub"
            className="text-[13px] font-medium underline decoration-[#A89878]/60 underline-offset-2"
            style={{ color: "#7A7A7A" }}
          >
            ← Hub
          </Link>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[17px] font-extrabold tracking-tight text-[#2B2B2B]">
                Directorio de Proveedores
              </h1>
              <p className="mt-0.5 text-[11.5px] font-medium text-[#A89878]">
                por{" "}
                <span className="font-bold text-[#B98852]">Rayana</span>
              </p>
            </div>
            {userBubble}
          </div>
          <label className="sr-only" htmlFor="proveedores-buscar-mobile">
            Buscar proveedores
          </label>
          <div className="mt-3">
            <DirectorySearch
              id="proveedores-buscar-mobile"
              query={query}
              setQuery={setQuery}
              searchFocused={searchFocusedMobile}
              setSearchFocused={setSearchFocusedMobile}
            />
          </div>
        </header>

        {/* Desktop top bar */}
        <div
          className="hidden items-center justify-between gap-4 border-b px-8 py-5 lg:flex"
          style={{
            borderColor: "rgba(120,90,60,.08)",
            background: "rgba(255,255,255,.5)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <Link
              href="/hub"
              className="shrink-0 text-[13px] font-medium underline decoration-[#A89878]/60 underline-offset-2"
              style={{ color: "#7A7A7A" }}
            >
              ← Hub
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold tracking-tight text-[#2B2B2B]">
                Directorio de Proveedores
              </h1>
              <p className="mt-0.5 text-xs font-medium text-[#A89878]">
                por{" "}
                <span className="font-bold text-[#B98852]">Rayana</span>
              </p>
            </div>
          </div>
          {userBubble}
        </div>

        <div className="grid flex-1 grid-cols-1 lg:grid-cols-[240px_1fr] lg:overflow-hidden">
          {/* Desktop sidebar categories */}
          <aside
            className="hidden border-r px-5 py-6 lg:block"
            style={{ borderColor: "rgba(120,90,60,.08)" }}
          >
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#A89878]">
              Categorías
            </div>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="flex cursor-pointer items-center justify-between rounded-xl border-0 px-3.5 py-2.5 text-left text-[13px] font-inherit transition-all"
                style={
                  selectedCategory === null
                    ? {
                        background:
                          "linear-gradient(180deg, #FFFFFF 0%, #FBF5EC 100%)",
                        boxShadow:
                          "3px 3px 7px rgba(120,90,60,.07), -2px -2px 6px rgba(255,255,255,.9)",
                        color: "#5A4A3A",
                        fontWeight: 700,
                      }
                    : {
                        background: "transparent",
                        color: "#7A7A7A",
                        fontWeight: 500,
                      }
                }
              >
                <span>Todos</span>
                <span className="opacity-50">{suppliers.length}</span>
              </button>
              {categoryRows.map((row) => {
                const active = selectedCategory === row.key;
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => toggleCategory(row.key)}
                    className="flex cursor-pointer items-center justify-between rounded-xl border-0 px-3.5 py-2.5 text-left text-[13px] font-inherit transition-all"
                    style={
                      active
                        ? {
                            background:
                              "linear-gradient(180deg, #FFFFFF 0%, #FBF5EC 100%)",
                            boxShadow:
                              "3px 3px 7px rgba(120,90,60,.07), -2px -2px 6px rgba(255,255,255,.9)",
                            color: "#5A4A3A",
                            fontWeight: 700,
                          }
                        : {
                            background: "transparent",
                            color: "#7A7A7A",
                            fontWeight: 500,
                          }
                    }
                  >
                    <span className="min-w-0 truncate">{row.label}</span>
                    <span className="shrink-0 opacity-50">{row.count}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="flex min-h-0 min-w-0 flex-col lg:overflow-hidden">
            {/* Mobile horizontal pills */}
            <div
              className="rayana-pills-scroll flex-shrink-0 overflow-x-auto py-3 lg:hidden"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex w-max gap-2 px-5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={`h-9 shrink-0 cursor-pointer rounded-full border-0 px-4 text-[13px] font-semibold font-inherit whitespace-nowrap transition-all duration-[250ms] ${
                    selectedCategory == null ? "clay-pill-active" : "clay-pill"
                  }`}
                  style={
                    selectedCategory == null
                      ? { color: "#FFFFFF" }
                      : { color: "#5A4A3A" }
                  }
                >
                  Todos
                </button>
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`h-9 shrink-0 cursor-pointer rounded-full border-0 px-4 text-[13px] font-semibold font-inherit whitespace-nowrap transition-all duration-[250ms] ${
                        active ? "clay-pill-active" : "clay-pill"
                      }`}
                      style={
                        active ? { color: "#FFFFFF" } : { color: "#5A4A3A" }
                      }
                    >
                      {categoryPillLabel(cat)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop search */}
            <div className="hidden max-w-[600px] px-8 pt-6 lg:block">
              <label className="sr-only" htmlFor="proveedores-buscar-desktop">
                Buscar proveedores
              </label>
              <DirectorySearch
                id="proveedores-buscar-desktop"
                query={query}
                setQuery={setQuery}
                searchFocused={searchFocusedDesktop}
                setSearchFocused={setSearchFocusedDesktop}
              />
            </div>

            {!loading && !error && suppliers.length > 0 && regular.length > 0 ? (
              <div
                className="flex-shrink-0 px-5 py-2 text-xs font-medium text-[#A89878] lg:px-8"
              >
                {regular.length}{" "}
                {regular.length === 1 ? "proveedor" : "proveedores"}
                {selectedCategory !== null ? (
                  <span>
                    {" "}
                    en{" "}
                    <strong style={{ color: "#5A4A3A" }}>
                      {categoryPillLabel(selectedCategory)}
                    </strong>
                  </span>
                ) : null}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto px-[18px] pb-8 lg:px-8">
              {loading ? <SupplierListSkeleton /> : null}

              {!loading && error ? (
                <div
                  className="clay-card p-6 text-center"
                  role="alert"
                >
                  <p className="text-sm" style={{ color: "#5A4A3A" }}>
                    {error}
                  </p>
                  <button
                    type="button"
                    onClick={() => retry()}
                    className="clay-pill-active mt-4 cursor-pointer rounded-full border-0 px-5 py-2 text-sm font-semibold"
                  >
                    Reintentar
                  </button>
                </div>
              ) : null}

              {!loading && !error && suppliers.length === 0 ? (
                <div className="clay-card p-10 text-center">
                  <p className="font-semibold text-[#2B2B2B]">
                    Aún no hay proveedores
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "#7A7A7A" }}>
                    Cuando el equipo cargue el directorio, aparecerán aquí.
                  </p>
                </div>
              ) : null}

              {showFilterEmpty ? (
                <ProveedoresEmptyState onClear={clearFilters} />
              ) : null}

              {!loading &&
              !error &&
              featured.length > 0 &&
              regular.length > 0 ? (
                <div className="mb-3">
                  <SectionDivider />
                </div>
              ) : null}

              {!loading && !error && regular.length > 0 ? (
                <ul className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-3.5 lg:content-start">
                  {regular.map((s) => (
                    <li key={s.id} className="lg:min-w-0">
                      <SupplierCard supplier={s} />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
