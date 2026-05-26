"use client";

import type { PaisSlug } from "@/lib/admin/supplier-pais";
import { formatCodigo } from "@/lib/utils/format-codigo";
import type { Supplier } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SupplierAdminListProps = {
  suppliers: Supplier[];
  paisSlug: PaisSlug;
};

function matchesSearch(s: Supplier, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    s.tienda.toLowerCase().includes(q) ||
    (s.categoria?.toLowerCase().includes(q) ?? false) ||
    (s.instagram?.toLowerCase().includes(q) ?? false)
  );
}

function SupplierAdminCard({ supplier }: { supplier: Supplier }) {
  return (
    <div className="admin-card">
      <div className="admin-card-logo">
        {supplier.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={supplier.logo_url}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "1.25rem" }} aria-hidden>
            🏪
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--color-muted)",
              fontWeight: 600,
            }}
          >
            {formatCodigo(supplier.codigo)}
          </span>
          {supplier.destacado ? (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                background:
                  "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
                color: "#fff",
                padding: "1px 7px",
                borderRadius: 9999,
              }}
            >
              ★ Destacado
            </span>
          ) : null}
          {!supplier.activo ? (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 600,
                background: "#e4e4e7",
                color: "#52525b",
                padding: "1px 7px",
                borderRadius: 9999,
              }}
            >
              Inactivo
            </span>
          ) : null}
        </div>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "var(--color-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {supplier.tienda}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {supplier.categoria ?? "Sin categoría"}
        </p>
      </div>

      <Link
        href={`/suppliers/${supplier.id}/edit`}
        style={{
          flexShrink: 0,
          padding: "10px 16px",
          borderRadius: 10,
          background: "rgba(89, 47, 146, 0.08)",
          color: "var(--color-primary)",
          fontWeight: 700,
          fontSize: "0.85rem",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      >
        Editar
      </Link>
    </div>
  );
}

export function SupplierAdminList({ suppliers, paisSlug }: SupplierAdminListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => suppliers.filter((s) => matchesSearch(s, search)),
    [suppliers, search],
  );

  return (
    <>
      <div className="admin-search-wrapper">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar proveedor por nombre, categoría o Instagram…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            className="admin-search-input w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none ring-zinc-300 focus:ring-2"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 hover:text-zinc-700"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <p className="mb-2 text-[13px] text-zinc-500">
        {filtered.length} de {suppliers.length} proveedores
      </p>

      <div className="admin-cards">
        {filtered.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-8 text-center text-sm text-zinc-500">
            No hay resultados para esta búsqueda.
          </p>
        ) : (
          filtered.map((r) => <SupplierAdminCard key={r.id} supplier={r} />)
        )}
      </div>

      <div className="admin-table overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Tienda</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Instagram</th>
              <th className="px-4 py-3">Activo</th>
              <th className="px-4 py-3">Destacado</th>
              <th className="px-4 py-3">Verificado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-zinc-500" colSpan={9}>
                  No hay resultados para esta búsqueda.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50/80">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-rose-900">
                    {formatCodigo(r.codigo)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-zinc-900">
                    {r.tienda}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-zinc-600">
                    {r.categoria ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {r.whatsapp ?? "—"}
                  </td>
                  <td className="max-w-[120px] truncate px-4 py-3 text-zinc-600">
                    {r.instagram ? `@${r.instagram}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.activo
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                          : "rounded-full bg-zinc-200 px-2 py-0.5 text-xs font-medium text-zinc-700"
                      }
                    >
                      {r.activo ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-700">
                      {r.destacado ? "⭐ Sí" : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-700">
                      {r.verificado ? "✓" : "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/suppliers/${r.id}/edit`}
                      className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-600"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/suppliers/new?pais=${paisSlug}`)}
        aria-label="Agregar proveedor"
        className="admin-fab fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full border-0 bg-gradient-to-br from-[#592f92] to-[#ff108a] text-[1.75rem] font-light leading-none text-white shadow-[0_4px_20px_rgba(89,47,146,0.35)] transition hover:scale-105 hover:shadow-[0_8px_28px_rgba(89,47,146,0.45)]"
      >
        +
      </button>
    </>
  );
}
