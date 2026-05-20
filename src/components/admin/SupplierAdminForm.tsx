"use client";

import {
  type PaisSlug,
  paisCodigoToSlug,
  paisDirectoryLabel,
} from "@/lib/admin/supplier-pais";
import { FeaturedCardPreview } from "@/components/admin/FeaturedCardPreview";
import type { Supplier } from "@/types";
import {
  AlertTriangle,
  Eye,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Props =
  | { mode: "new"; listPaisSlug: PaisSlug; paisCodigo: string }
  | { mode: "edit"; supplier: Supplier };

export function SupplierAdminForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const s = isEdit ? props.supplier : null;

  const listPaisSlug: PaisSlug = isEdit
    ? paisCodigoToSlug(s!.pais_codigo)
    : props.listPaisSlug;
  const listHref = `/suppliers?pais=${listPaisSlug}`;

  const [codigo, setCodigo] = useState(
    isEdit ? String(s!.codigo) : "",
  );
  const [tienda, setTienda] = useState(s?.tienda ?? "");
  const [instagram, setInstagram] = useState(s?.instagram ?? "");
  const [instagramUrl, setInstagramUrl] = useState(s?.instagram_url ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(s?.tiktok_url ?? "");
  const [mapsUrl, setMapsUrl] = useState(s?.maps_url ?? "");
  const [categoria, setCategoria] = useState(s?.categoria ?? "");
  const [direccion, setDireccion] = useState(s?.direccion ?? "");
  const [tipo, setTipo] = useState(s?.tipo ?? "");
  const [observacion, setObservacion] = useState(s?.observacion ?? "");
  const [whatsapp, setWhatsapp] = useState(s?.whatsapp ?? "");
  const [activo, setActivo] = useState(s?.activo ?? true);
  const [destacado, setDestacado] = useState(s?.destacado ?? false);
  const [verificado, setVerificado] = useState(s?.verificado ?? false);

  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(s?.logo_url ?? null);
  const [coverBusy, setCoverBusy] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(s?.cover_url ?? null);
  const [coverHeight, setCoverHeight] = useState<number>(s?.cover_height ?? 128);
  const [fotoBusy, setFotoBusy] = useState<"1" | "2" | "3" | null>(null);
  const [foto1Url, setFoto1Url] = useState<string | null>(s?.foto_1_url ?? null);
  const [foto2Url, setFoto2Url] = useState<string | null>(s?.foto_2_url ?? null);
  const [foto3Url, setFoto3Url] = useState<string | null>(s?.foto_3_url ?? null);
  const [error, setError] = useState<string | null>(null);

  async function uploadLogo(file: File) {
    if (!isEdit) return;
    const codigoNum = Number(codigo);
    if (!Number.isInteger(codigoNum)) return;
    setLogoBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("codigo", String(codigoNum));
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-logo", { method: "POST", body: fd });
      const data: { error?: string; logo_url?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir logo");
        return;
      }
      if (data.logo_url) setLogoUrl(data.logo_url);
    } catch {
      setError("Error de red al subir logo");
    } finally {
      setLogoBusy(false);
    }
  }

  async function removeLogo() {
    if (!isEdit || !logoUrl) return;
    setLogoBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suppliers/${props.supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logo_url: null }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al quitar logo");
        return;
      }
      setLogoUrl(null);
    } catch {
      setError("Error de red al quitar logo");
    } finally {
      setLogoBusy(false);
    }
  }

  async function uploadCover(file: File) {
    if (!isEdit) return;
    setCoverBusy(true);
    setError(null);
    try {
      console.log("supplier_id enviado:", props.supplier.id);
      const fd = new FormData();
      fd.set("supplier_id", props.supplier.id);
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-cover", {
        method: "POST",
        body: fd,
      });
      const data: { error?: string; cover_url?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir portada");
        return;
      }
      if (data.cover_url) setCoverUrl(data.cover_url);
    } catch {
      setError("Error de red al subir portada");
    } finally {
      setCoverBusy(false);
    }
  }

  async function removeCover() {
    if (!isEdit || !coverUrl) return;
    setCoverBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suppliers/${props.supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover_url: null }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al quitar portada");
        return;
      }
      setCoverUrl(null);
    } catch {
      setError("Error de red al quitar portada");
    } finally {
      setCoverBusy(false);
    }
  }

  async function removeFoto(fotoIndex: "1" | "2" | "3") {
    if (!isEdit) return;
    const url =
      fotoIndex === "1" ? foto1Url : fotoIndex === "2" ? foto2Url : foto3Url;
    if (!url) return;

    const field =
      fotoIndex === "1"
        ? "foto_1_url"
        : fotoIndex === "2"
          ? "foto_2_url"
          : "foto_3_url";

    setFotoBusy(fotoIndex);
    setError(null);
    try {
      const res = await fetch(`/api/admin/suppliers/${props.supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: null }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al quitar foto");
        return;
      }
      if (fotoIndex === "1") setFoto1Url(null);
      if (fotoIndex === "2") setFoto2Url(null);
      if (fotoIndex === "3") setFoto3Url(null);
    } catch {
      setError("Error de red al quitar foto");
    } finally {
      setFotoBusy(null);
    }
  }

  async function uploadFoto(file: File, fotoIndex: "1" | "2" | "3") {
    if (!isEdit) return;
    setFotoBusy(fotoIndex);
    setError(null);
    try {
      console.log(
        "DEBUG supplier_id:",
        props.supplier.id,
        "tipo:",
        typeof props.supplier.id,
      );
      const fd = new FormData();
      fd.set("supplier_id", props.supplier.id);
      fd.set("foto_index", fotoIndex);
      fd.set("file", file);
      const res = await fetch("/api/admin/upload-foto", { method: "POST", body: fd });
      const data: { error?: string; url?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al subir foto");
        return;
      }
      if (data.url) {
        if (fotoIndex === "1") setFoto1Url(data.url);
        if (fotoIndex === "2") setFoto2Url(data.url);
        if (fotoIndex === "3") setFoto3Url(data.url);
      }
    } catch {
      setError("Error de red al subir foto");
    } finally {
      setFotoBusy(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (isEdit) {
        const res = await fetch(`/api/admin/suppliers/${props.supplier.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tienda,
            instagram: instagram.trim() === "" ? null : instagram,
            instagram_url: instagramUrl.trim() === "" ? null : instagramUrl,
            tiktok_url: tiktokUrl.trim() === "" ? null : tiktokUrl,
            maps_url: mapsUrl.trim() === "" ? null : mapsUrl,
            categoria: categoria.trim() === "" ? null : categoria,
            direccion: direccion.trim() === "" ? null : direccion,
            tipo,
            observacion: observacion.trim() === "" ? null : observacion,
            whatsapp: whatsapp.trim() === "" ? null : whatsapp,
            activo,
            destacado,
            verificado,
            cover_url: coverUrl,
            cover_height: coverHeight,
          }),
        });
        const data: { error?: string } = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al guardar");
          return;
        }
        router.push(listHref);
        router.refresh();
        return;
      }

      const codigoNum = Number.parseInt(codigo, 10);
      if (!Number.isInteger(codigoNum)) {
        setError("Código debe ser un número entero");
        return;
      }

      const res = await fetch("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: codigoNum,
          tienda,
          instagram: instagram.trim() === "" ? null : instagram,
          instagram_url: instagramUrl.trim() === "" ? null : instagramUrl,
          tiktok_url: tiktokUrl.trim() === "" ? null : tiktokUrl,
          maps_url: mapsUrl.trim() === "" ? null : mapsUrl,
          categoria: categoria.trim() === "" ? null : categoria,
          direccion: direccion.trim() === "" ? null : direccion,
          tipo,
          observacion: observacion.trim() === "" ? null : observacion,
          whatsapp: whatsapp.trim() === "" ? null : whatsapp,
          activo,
          pais_codigo: props.paisCodigo,
        }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear");
        return;
      }
      router.push(listHref);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate() {
    if (!isEdit) return;
    if (!window.confirm("¿Desactivar este proveedor?")) return;
    setError(null);
    setDeactivating(true);
    try {
      const res = await fetch(`/api/admin/suppliers/${props.supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: false }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al desactivar");
        return;
      }
      router.push(listHref);
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setDeactivating(false);
    }
  }

  const inputClass =
    "mt-1 w-full max-w-lg rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900";

  const previewWhatsappUrl = useMemo(() => {
    const raw = whatsapp.replace(/\D/g, "");
    return raw !== "" ? `https://wa.me/${raw}` : null;
  }, [whatsapp]);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={listHref}
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Lista de proveedores
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          {isEdit ? "Editar proveedor" : "Nuevo proveedor"}
        </h1>
      </div>

      <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-950">
        {isEdit
          ? `Editando proveedor de: ${paisDirectoryLabel(listPaisSlug)}`
          : `Creando proveedor en: ${paisDirectoryLabel(listPaisSlug)}`}
      </p>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="codigo">
            Código <span className="text-red-600">*</span>
          </label>
          {isEdit ? (
            <p id="codigo" className="mt-1 text-sm font-mono text-zinc-900">
              {codigo}
            </p>
          ) : (
            <input
              id="codigo"
              type="number"
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={inputClass}
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="tienda">
            Tienda <span className="text-red-600">*</span>
          </label>
          <input
            id="tienda"
            required
            value={tienda}
            onChange={(e) => setTienda(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="instagram">
            Instagram
          </label>
          <input
            id="instagram"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@usuario o usuario"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Se guarda sin @; se quita la arroba automáticamente.
          </p>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="instagram_url"
          >
            URL Instagram (opcional)
          </label>
          <input
            id="instagram_url"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Si está vacío, el directorio arma el enlace con el usuario de
            Instagram de arriba.
          </p>
        </div>

        <div>
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="tiktok_url"
          >
            URL TikTok (opcional)
          </label>
          <input
            id="tiktok_url"
            type="url"
            value={tiktokUrl}
            onChange={(e) => setTiktokUrl(e.target.value)}
            placeholder="https://www.tiktok.com/@…"
            className={inputClass}
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium text-zinc-700"
            htmlFor="maps_url"
          >
            URL Google Maps (opcional)
          </label>
          <input
            id="maps_url"
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-500">
            Si está vacío, el directorio puede usar la dirección para abrir Maps.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="categoria">
            Categoría
          </label>
          <input
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="direccion">
            Dirección
          </label>
          <input
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="tipo">
            Tipo <span className="text-red-600">*</span>
          </label>
          <input
            id="tipo"
            required
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="observacion">
            Observación
          </label>
          <textarea
            id="observacion"
            rows={3}
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="whatsapp">
            WhatsApp
          </label>
          <input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Solo dígitos (ej. 56912345678)"
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
          />
          Activo
        </label>

        {isEdit ? (
          <>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={destacado}
                onChange={(e) => setDestacado(e.target.checked)}
              />
              Proveedor Destacado (aparece en la zona superior con carrusel)
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={verificado}
                onChange={(e) => setVerificado(e.target.checked)}
              />
              Proveedor Verificado Makeray (muestra el badge dorado)
            </label>
          </>
        ) : null}

        {isEdit ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-800">Logo</p>
            <p className="mt-1 text-xs text-zinc-500">
              Solo se actualiza si subes una imagen nueva. El Excel no modifica{" "}
              <code className="text-[11px]">logo_url</code>.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt=""
                  className="h-20 w-20 rounded-lg border border-zinc-100 object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
                  Sin logo
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={logoBusy}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadLogo(f);
                    e.target.value = "";
                  }}
                  className="text-sm"
                />
                {logoUrl ? (
                  <button
                    type="button"
                    disabled={logoBusy}
                    onClick={() => void removeLogo()}
                    className="mt-2 block text-sm text-red-700 underline hover:text-red-900 disabled:opacity-50"
                  >
                    Quitar logo
                  </button>
                ) : null}
                {logoBusy ? (
                  <p className="mt-1 text-xs text-zinc-500">Procesando…</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {isEdit ? (
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-800">Fotos destacadas</p>
            <p className="text-xs text-zinc-500">
              Portada y hasta 3 imágenes para la card destacada. El Excel no modifica
              estas URLs.
            </p>

            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-800">Imagen de portada</p>
              <p className="text-xs text-zinc-500">
                Aparece como banner en la card destacada. Recomendado: 1200×400px.
              </p>
              <div className="relative flex aspect-[3/1] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 transition-colors hover:border-indigo-300">
                {coverUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      disabled={coverBusy || fotoBusy !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        void removeCover();
                      }}
                      className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:text-red-700 disabled:opacity-50"
                      aria-label="Quitar portada"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </>
                ) : (
                  <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-zinc-400">
                    <ImagePlus className="h-8 w-8" aria-hidden />
                    <span className="px-2 text-center text-xs">
                      Subir imagen de portada
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={coverBusy || fotoBusy !== null}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void uploadCover(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
                {coverBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2
                      className="h-6 w-6 animate-spin text-indigo-600"
                      aria-hidden
                    />
                  </div>
                ) : null}
              </div>
              {coverUrl ? (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-700">
                    Altura de portada:{" "}
                    <span className="font-bold text-indigo-600">{coverHeight}px</span>
                  </label>
                  <input
                    type="range"
                    min={80}
                    max={280}
                    step={8}
                    value={coverHeight}
                    onChange={(e) => setCoverHeight(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Compacta (80px)</span>
                    <span>Grande (280px)</span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                {
                  n: "1" as const,
                  url: foto1Url,
                  label: "Foto principal (Foto 1)",
                },
                { n: "2" as const, url: foto2Url, label: "Foto 2" },
                { n: "3" as const, url: foto3Url, label: "Foto 3" },
              ] as const
            ).map(({ n, url, label }) => (
              <div key={n}>
                <p className="mb-2 text-sm font-medium text-zinc-700">{label}</p>
                <div className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 transition-colors hover:border-indigo-300">
                  {url ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        disabled={fotoBusy !== null || coverBusy}
                        onClick={(e) => {
                          e.stopPropagation();
                          void removeFoto(n);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white p-1 text-red-500 shadow hover:text-red-700 disabled:opacity-50"
                        aria-label={`Quitar ${label}`}
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </>
                  ) : (
                    <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 text-zinc-400">
                      <ImagePlus className="h-8 w-8" aria-hidden />
                      <span className="px-2 text-center text-xs">{label}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={fotoBusy !== null || coverBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void uploadFoto(f, n);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                  {fotoBusy === n ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <Loader2
                        className="h-6 w-6 animate-spin text-indigo-600"
                        aria-hidden
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
            </div>
          </div>
        ) : null}

        {isEdit && destacado ? (
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-800">
              <Eye className="h-4 w-4" aria-hidden />
              Preview de la card destacada
            </p>
            <p className="text-xs text-zinc-500">
              Así se verá en el directorio público.
            </p>
            <div className="max-w-sm">
              <FeaturedCardPreview
                tienda={tienda}
                categoria={categoria}
                direccion={direccion}
                verificado={verificado}
                logoUrl={logoUrl}
                foto1Url={foto1Url}
                foto2Url={foto2Url}
                foto3Url={foto3Url}
                coverUrl={coverUrl}
                coverHeight={coverHeight}
                whatsappUrl={previewWhatsappUrl}
              />
            </div>
            {!foto1Url && !foto2Url && !foto3Url ? (
              <p className="flex items-center gap-1 text-xs text-amber-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
                Sube al menos una foto para que la card se vea completa.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar"}
          </button>
          {isEdit ? (
            <button
              type="button"
              disabled={deactivating}
              onClick={() => void handleDeactivate()}
              className="rounded-xl border border-red-300 bg-red-50 px-5 py-2.5 text-sm font-medium text-red-900 hover:bg-red-100 disabled:opacity-50"
            >
              {deactivating ? "…" : "Desactivar proveedor"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
