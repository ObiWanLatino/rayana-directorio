"use client";

import type { Supplier } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props =
  | { mode: "new"; supplier?: undefined }
  | { mode: "edit"; supplier: Supplier };

export function SupplierAdminForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const s = isEdit ? props.supplier : null;

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
  const [paisCodigo, setPaisCodigo] = useState(s?.pais_codigo ?? "56");
  const [destacado, setDestacado] = useState(s?.destacado ?? false);
  const [verificado, setVerificado] = useState(s?.verificado ?? false);

  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(s?.logo_url ?? null);
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

  async function uploadFoto(file: File, fotoIndex: "1" | "2" | "3") {
    if (!isEdit) return;
    setFotoBusy(fotoIndex);
    setError(null);
    try {
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
            pais_codigo: paisCodigo,
            destacado,
            verificado,
          }),
        });
        const data: { error?: string } = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Error al guardar");
          return;
        }
        router.push("/admin/suppliers");
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
          pais_codigo: paisCodigo,
        }),
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al crear");
        return;
      }
      router.push("/admin/suppliers");
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
      router.push("/admin/suppliers");
      router.refresh();
    } catch {
      setError("Error de red");
    } finally {
      setDeactivating(false);
    }
  }

  const inputClass =
    "mt-1 w-full max-w-lg rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/suppliers"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Lista de proveedores
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          {isEdit ? "Editar proveedor" : "Nuevo proveedor"}
        </h1>
      </div>

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

        <div>
          <label className="block text-sm font-medium text-zinc-700" htmlFor="pais">
            Código país (WhatsApp)
          </label>
          <input
            id="pais"
            value={paisCodigo}
            onChange={(e) => setPaisCodigo(e.target.value)}
            className={`${inputClass} max-w-[8rem]`}
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
                {logoBusy ? (
                  <p className="mt-1 text-xs text-zinc-500">Subiendo…</p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {isEdit ? (
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm font-medium text-zinc-800">Fotos destacadas</p>
            <p className="text-xs text-zinc-500">
              Hasta 3 imágenes para el carrusel del directorio. El Excel no modifica
              estas URLs.
            </p>
            {(
              [
                { n: "1" as const, url: foto1Url, label: "Foto 1" },
                { n: "2" as const, url: foto2Url, label: "Foto 2" },
                { n: "3" as const, url: foto3Url, label: "Foto 3" },
              ] as const
            ).map(({ n, url, label }) => (
              <div key={n}>
                <label className="block text-sm font-medium text-zinc-700">
                  {label}
                </label>
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt=""
                    className="mt-1 rounded border border-zinc-100"
                    style={{ height: 80, objectFit: "cover" }}
                  />
                ) : null}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={fotoBusy !== null}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadFoto(f, n);
                    e.target.value = "";
                  }}
                  className="mt-1 block text-sm"
                />
                {fotoBusy === n ? (
                  <p className="mt-1 text-xs text-zinc-500">Subiendo…</p>
                ) : null}
              </div>
            ))}
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
