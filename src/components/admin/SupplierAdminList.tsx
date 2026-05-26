"use client";

import { formatCodigo } from "@/lib/utils/format-codigo";
import type { Supplier } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type SupplierAdminListProps = {
  suppliers: Supplier[];
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

export function SupplierAdminList({ suppliers }: SupplierAdminListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () => suppliers.filter((s) => matchesSearch(s, search)),
    [suppliers, search],
  );

  return (
    <>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar proveedor por nombre, categoría o Instagram…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none ring-zinc-300 focus:ring-2"
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

      <p className="mb-2 text-[13px] text-zinc-500">
        {filtered.length} de {suppliers.length} proveedores
      </p>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
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
    </>
  );
}
