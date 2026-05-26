"use client";

import { compressImage } from "@/lib/admin/compress-image";
import type { Categoria } from "@/types/categories";
import { useState } from "react";

type Props = {
  initialCategorias: Categoria[];
};

export function CategoryPhotoAdmin({ initialCategorias }: Props) {
  const [rows, setRows] = useState(initialCategorias);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(categoryId: string, file: File) {
    setBusyId(categoryId);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("category_id", categoryId);
      fd.set("file", await compressImage(file));
      const res = await fetch("/api/admin/upload-category-photo", {
        method: "POST",
        body: fd,
      });
      const data: { error?: string; foto_url?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir foto");
        return;
      }
      if (data.foto_url) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === categoryId ? { ...r, foto_url: data.foto_url! } : r,
          ),
        );
      }
    } catch {
      setError("Error de red al subir foto");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {rows.map((cat) => (
        <div
          key={cat.id}
          className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <span className="text-2xl" aria-hidden>
            {cat.emoji}
          </span>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-zinc-900">{cat.nombre}</p>
            <p className="text-xs text-zinc-500">Orden {cat.orden}</p>
          </div>

          <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50">
            {cat.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cat.foto_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                Sin foto
              </div>
            )}
          </div>

          <label className="cursor-pointer rounded-lg bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100">
            {busyId === cat.id ? "Subiendo…" : "Cambiar foto"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              disabled={busyId !== null}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(cat.id, f);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
