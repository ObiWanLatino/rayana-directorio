"use client";

import { compressImage } from "@/lib/admin/compress-image";
import Link from "next/link";
import { useEffect, useState } from "react";

const CATEGORIAS_LANDING = [
  { nombre: "Moda Femenina", emoji: "👗" },
  { nombre: "Moda Masculina", emoji: "👔" },
  { nombre: "Moda Infantil", emoji: "👶" },
  { nombre: "Moda Deportiva", emoji: "🏃" },
  { nombre: "Lenceria", emoji: "💗" },
  { nombre: "Sex Shop", emoji: "🔥" },
  { nombre: "Accesorios para mascotas", emoji: "🐾" },
  { nombre: "Calzados", emoji: "👟" },
  { nombre: "Carteras y accesorios", emoji: "👜" },
  { nombre: "Joyas y Bisutería", emoji: "💍" },
  { nombre: "Cosmética y Maquillaje", emoji: "💄" },
  { nombre: "Deco Hogar", emoji: "🏠" },
  { nombre: "Fardos de ropa", emoji: "📦" },
  { nombre: "Electronicos", emoji: "💻" },
  { nombre: "Importadoras", emoji: "🏭" },
] as const;

type CategoriaRow = {
  nombre: string;
  emoji: string;
  id: string | null;
  foto_url: string | null;
};

type DbCategoria = {
  id: string;
  nombre: string;
  foto_url: string | null;
};

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState<CategoriaRow[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: DbCategoria[] | { error?: string }) => {
        const merged = CATEGORIAS_LANDING.map((c) => {
          const fromDB = Array.isArray(data)
            ? data.find((d) => d.nombre === c.nombre)
            : null;
          return {
            ...c,
            id: fromDB?.id ?? null,
            foto_url: fromDB?.foto_url ?? null,
          };
        });
        setCategorias(merged);
      })
      .catch(() => setError("No se pudieron cargar las categorías"));
  }, []);

  async function handleFoto(cat: CategoriaRow, file: File) {
    setUploading(cat.nombre);
    setError(null);
    try {
      const compressed = await compressImage(file, 1200, 0.82);
      const fd = new FormData();
      fd.append("file", compressed, "categoria.jpg");
      fd.append("nombre", cat.nombre);
      if (cat.id) fd.append("id", cat.id);

      const res = await fetch("/api/admin/upload-category-photo", {
        method: "POST",
        body: fd,
      });
      const json: { foto_url?: string; id?: string; error?: string } =
        await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error al subir foto");
        return;
      }

      setCategorias((prev) =>
        prev.map((c) =>
          c.nombre === cat.nombre
            ? { ...c, foto_url: json.foto_url ?? c.foto_url, id: json.id ?? c.id }
            : c,
        ),
      );
      setSaved(cat.nombre);
      window.setTimeout(() => setSaved(null), 2500);
    } catch {
      setError("Error de red al subir foto");
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div style={{ padding: "0", maxWidth: 800, margin: "0 auto" }}>
        <Link
          href="/"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>
        <h1
          style={{
            fontFamily: "Fraunces, serif",
            fontSize: "1.5rem",
            color: "var(--color-text-primary, #18181b)",
            marginBottom: 8,
            marginTop: 16,
          }}
        >
          Categorías Landing Page
        </h1>
        <p
          style={{
            color: "var(--color-text-secondary, #71717a)",
            fontSize: "0.9rem",
            marginBottom: 28,
          }}
        >
          Sube una foto de fondo para cada categoría que aparece en la landing
          page.
        </p>

        {error ? (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {categorias.map((cat) => (
            <div
              key={cat.nombre}
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: "16px",
                border: "1px solid var(--color-border-primary, #e4e4e7)",
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative",
                  background:
                    "linear-gradient(135deg, rgba(89,47,146,0.1), rgba(255,16,138,0.08))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cat.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cat.foto_url}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "2rem" }} aria-hidden>
                    {cat.emoji}
                  </span>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    color: "var(--color-text-primary, #18181b)",
                  }}
                >
                  {cat.emoji} {cat.nombre}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--color-muted, #a1a1aa)",
                    marginTop: 2,
                  }}
                >
                  {cat.foto_url ? "✅ Con foto" : "Sin foto — muestra gradiente"}
                </p>
                {saved === cat.nombre ? (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.75rem",
                      color: "#22c55e",
                      marginTop: 2,
                    }}
                  >
                    ✓ Guardada
                  </p>
                ) : null}
              </div>

              <label
                style={{
                  flexShrink: 0,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background:
                    uploading === cat.nombre
                      ? "rgba(89,47,146,0.05)"
                      : "rgba(89,47,146,0.08)",
                  color: "var(--color-primary, #592f92)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: uploading === cat.nombre ? "not-allowed" : "pointer",
                  opacity: uploading === cat.nombre ? 0.6 : 1,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={uploading === cat.nombre}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFoto(cat, f);
                    e.target.value = "";
                  }}
                />
                {uploading === cat.nombre
                  ? "Subiendo…"
                  : cat.foto_url
                    ? "Cambiar foto"
                    : "Subir foto"}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
