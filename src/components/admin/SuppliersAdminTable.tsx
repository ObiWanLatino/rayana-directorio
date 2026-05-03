"use client";

import type { Supplier } from "@/types";
import { formatCodigo } from "@/lib/utils/format-codigo";
import Link from "next/link";
import { useMemo, useState } from "react";

type RowState = Supplier;

export function SuppliersAdminTable({ initial }: { initial: Supplier[] }) {
  const [rows, setRows] = useState<RowState[]>(initial);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState<number | null>(null);
  const [logoBusy, setLogoBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    const qNum = t.replace("#", "");
    return rows.filter(
      (s) =>
        s.tienda.toLowerCase().includes(t) ||
        (s.categoria?.toLowerCase().includes(t) ?? false) ||
        (s.tipo?.toLowerCase().includes(t) ?? false) ||
        (s.direccion?.toLowerCase().includes(t) ?? false) ||
        String(s.codigo) === qNum ||
        (qNum.length > 0 && String(s.codigo).includes(qNum)),
    );
  }, [rows, q]);

  function updateLocal(codigo: number, patch: Partial<RowState>) {
    setRows((prev) =>
      prev.map((r) => (r.codigo === codigo ? { ...r, ...patch } : r)),
    );
  }

  async function saveRow(codigo: number) {
    const row = rows.find((r) => r.codigo === codigo);
    if (!row) return;
    setSaving(codigo);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/suppliers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo,
          tienda: row.tienda,
          instagram: row.instagram,
          categoria: row.categoria,
          direccion: row.direccion,
          tipo: row.tipo,
          observacion: row.observacion,
          whatsapp: row.whatsapp,
          activo: row.activo,
          pais_codigo: row.pais_codigo,
        }),
      });
      const data: { error?: string; supplier?: Supplier } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        return;
      }
      if (data.supplier) {
        setRows((prev) =>
          prev.map((r) => (r.codigo === codigo ? data.supplier! : r)),
        );
      }
      setMessage(`Guardado ${formatCodigo(codigo)}`);
    } catch {
      setError("Error de red");
    } finally {
      setSaving(null);
    }
  }

  async function uploadLogo(codigo: number, file: File) {
    setLogoBusy(codigo);
    setError(null);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("codigo", String(codigo));
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: fd,
      });
      const data: { error?: string; logo_url?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir logo");
        return;
      }
      if (data.logo_url) {
        updateLocal(codigo, { logo_url: data.logo_url });
        setMessage(`Logo actualizado ${formatCodigo(codigo)}`);
      }
    } catch {
      setError("Error de red");
    } finally {
      setLogoBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Proveedores
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Edición rápida y logos. Los cambios del Excel no sobrescriben{" "}
          <code className="text-xs">logo_url</code>.
        </p>
      </div>

      <input
        type="search"
        placeholder="Buscar por tienda, categoría, dirección, código…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-md rounded-lg border border-zinc-200 px-3 py-2 text-sm"
      />

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-medium uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-2">Logo</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2">Tienda</th>
              <th className="px-3 py-2">IG</th>
              <th className="px-3 py-2">Cat.</th>
              <th className="px-3 py-2">Dir.</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Obs.</th>
              <th className="px-3 py-2">WA</th>
              <th className="px-3 py-2">País</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-3 py-2">
                  <div className="flex w-20 flex-col gap-1">
                    {r.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.logo_url}
                        alt=""
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
                        —
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="max-w-[7rem] text-xs"
                      disabled={logoBusy === r.codigo}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadLogo(r.codigo, f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-block rounded-md bg-rose-100 px-1.5 py-0.5 text-xs font-bold tabular-nums text-rose-900">
                    {formatCodigo(r.codigo)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={r.activo}
                    onChange={(e) =>
                      updateLocal(r.codigo, { activo: e.target.checked })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-36 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.tienda}
                    onChange={(e) =>
                      updateLocal(r.codigo, { tienda: e.target.value })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.instagram ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, {
                        instagram: e.target.value || null,
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.categoria ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, {
                        categoria: e.target.value || null,
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-32 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.direccion ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, {
                        direccion: e.target.value || null,
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.tipo ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, { tipo: e.target.value || null })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-28 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.observacion ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, {
                        observacion: e.target.value || null,
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.whatsapp ?? ""}
                    onChange={(e) =>
                      updateLocal(r.codigo, {
                        whatsapp: e.target.value || null,
                      })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    className="w-12 rounded border border-zinc-200 px-1 py-0.5 text-xs"
                    value={r.pais_codigo}
                    onChange={(e) =>
                      updateLocal(r.codigo, { pais_codigo: e.target.value })
                    }
                  />
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={saving === r.codigo}
                    onClick={() => void saveRow(r.codigo)}
                    className="whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {saving === r.codigo ? "…" : "Guardar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-500">
        Mostrando {filtered.length} de {rows.length} proveedores.
      </p>
    </div>
  );
}
