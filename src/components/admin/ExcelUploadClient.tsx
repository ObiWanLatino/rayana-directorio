"use client";

import type { ImportPreview } from "@/lib/suppliers/excel-import";
import Link from "next/link";
import { useState } from "react";

type PreviewResponse = {
  filename: string;
  sheetName: string;
  rowCount: number;
  incompleteCount: number;
  preview: ImportPreview;
  lowVolumeWarning: boolean;
  databaseActiveCount: number;
};

type Step = 1 | 2 | 3;

export function ExcelUploadClient() {
  const [step, setStep] = useState<Step>(1);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [backupAck, setBackupAck] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [paisCodigo, setPaisCodigo] = useState("56");
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [excludeIncomplete, setExcludeIncomplete] = useState(false);
  const [confirmBulkDeactivate, setConfirmBulkDeactivate] = useState(false);
  const [confirmLowVolume, setConfirmLowVolume] = useState(false);
  const [importResult, setImportResult] = useState<{
    created: number;
    updated: number;
    deactivated: number;
    skipped_warnings: number;
  } | null>(null);

  async function runDownloadBackup() {
    setDownloadError(null);
    try {
      const res = await fetch("/api/admin/download-excel");
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setDownloadError(j.error ?? "Error al descargar");
        return;
      }
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition");
      const m = cd?.match(/filename="([^"]+)"/);
      const filename = m?.[1] ?? "proveedores_backup.xlsx";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setBackupDownloaded(true);
    } catch {
      setDownloadError("Error de red");
    }
  }

  async function runPreview(selected: File, countryCode: string = paisCodigo) {
    setError(null);
    setPreviewData(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", selected);
      fd.set("pais_codigo", countryCode);
      const res = await fetch("/api/admin/upload-excel", {
        method: "POST",
        body: fd,
      });
      const data: { error?: string } & Partial<PreviewResponse> =
        await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al analizar el archivo");
        return;
      }
      setPreviewData(data as PreviewResponse);
      setExcludeIncomplete(false);
      setConfirmBulkDeactivate(false);
      setConfirmLowVolume(false);
    } catch {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function runApply() {
    if (!file) return;
    setError(null);
    setApplyLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("pais_codigo", paisCodigo);
      if (excludeIncomplete) fd.set("exclude_incomplete", "1");
      if (confirmBulkDeactivate) fd.set("confirm_bulk_deactivate", "1");
      if (confirmLowVolume) fd.set("confirm_low_volume", "1");
      const res = await fetch("/api/admin/confirm-upload", {
        method: "POST",
        body: fd,
      });
      const data: {
        error?: string;
        created?: number;
        updated?: number;
        deactivated?: number;
        skipped_warnings?: number;
      } = await res.json();
      if (res.status === 409 && data.error === "bulk_deactivate_confirm") {
        setError(
          "Debes marcar la casilla de confirmación para desactivar muchos proveedores.",
        );
        return;
      }
      if (res.status === 409 && data.error === "low_volume_confirm") {
        setError(
          "Debes confirmar la importación con pocas filas respecto al directorio actual.",
        );
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "No se pudieron aplicar los cambios");
        return;
      }
      setImportResult({
        created: data.created ?? 0,
        updated: data.updated ?? 0,
        deactivated: data.deactivated ?? 0,
        skipped_warnings: data.skipped_warnings ?? 0,
      });
      setStep(3);
      setFile(null);
      setPreviewData(null);
    } catch {
      setError("Error de red");
    } finally {
      setApplyLoading(false);
    }
  }

  const p = previewData?.preview;

  return (
    <div className="mx-auto max-w-xl space-y-10">
      <div>
        <Link
          href="/admin"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Admin
        </Link>
        <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
          Carga masiva
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Tres pasos: respaldo, archivo Excel y resultado.
        </p>
      </div>

      {step === 1 ? (
        <section className="space-y-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Paso 1 — Advertencia y backup
          </h2>
          <p className="text-sm font-medium text-amber-950">
            ⚠️ La carga masiva reemplazará TODA la información existente de los
            proveedores. Esta acción no se puede deshacer.
          </p>
          <button
            type="button"
            onClick={() => void runDownloadBackup()}
            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800 sm:w-auto"
          >
            Descargar backup antes de continuar
          </button>
          {downloadError ? (
            <p className="text-sm text-red-700" role="alert">
              {downloadError}
            </p>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3 text-sm text-zinc-800">
            <input
              type="checkbox"
              checked={backupAck}
              disabled={!backupDownloaded}
              onChange={(e) => setBackupAck(e.target.checked)}
              className="mt-0.5"
            />
            <span className={!backupDownloaded ? "opacity-50" : ""}>
              ✓ Descargué el backup y entiendo que se sobreescribirá la lista
              completa
            </span>
          </label>
          <button
            type="button"
            disabled={!backupDownloaded || !backupAck}
            onClick={() => {
              setStep(2);
              setError(null);
            }}
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continuar
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-900">
              Paso 2 — Subir Excel
            </h2>
            <button
              type="button"
              className="text-sm text-zinc-500 underline hover:text-zinc-800"
              onClick={() => {
                setStep(1);
                setError(null);
              }}
            >
              Volver al paso 1
            </button>
          </div>
          <p className="text-sm text-zinc-600">
            Chile: primera hoja con Código, Tienda, Instagram, Categoría,
            Dirección, Tipo, Observación, WhatsApp. Brasil: hoja{" "}
            <strong>Contactos</strong> con Código, Contacto, Instagram, WhatsApp,
            Categoría (sin columna Tipo se usa &quot;Proveedor&quot;).
          </p>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 shadow-sm">
            <p className="text-sm font-medium text-zinc-800">
              País del directorio
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaisCodigo("56");
                  if (file) void runPreview(file, "56");
                }}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  paisCodigo === "56"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                }`}
              >
                🇨🇱 Chile (56)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaisCodigo("55");
                  if (file) void runPreview(file, "55");
                }}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  paisCodigo === "55"
                    ? "border-emerald-700 bg-emerald-700 text-white"
                    : "border-zinc-300 bg-white text-zinc-800 hover:border-zinc-400"
                }`}
              >
                🇧🇷 Brasil (55)
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-zinc-700">
              Archivo .xlsx
            </label>
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="mt-2 block w-full text-sm text-zinc-600"
              onChange={(e) => {
                const f = e.target.files?.[0];
                setFile(f ?? null);
                setPreviewData(null);
                setError(null);
                if (f) void runPreview(f, paisCodigo);
              }}
            />
            {loading ? (
              <p className="mt-3 text-sm text-zinc-500">Analizando…</p>
            ) : null}
            {previewData && file ? (
              <p className="mt-3 text-sm font-medium text-zinc-800">
                Filas detectadas: {previewData.rowCount}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {p && file ? (
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h3 className="font-medium text-zinc-900">Vista previa</h3>
              <p className="text-sm text-zinc-600">
                Hoja: {previewData!.sheetName} · {previewData!.rowCount} filas ·{" "}
                {previewData!.filename}
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm text-zinc-700">
                <li>Insertados (nuevos): {p.newCount}</li>
                <li>Actualizados: {p.updatedCount}</li>
                <li>Desactivados: {p.deactivatedCount}</li>
                <li>Sin cambios: {p.unchangedCount}</li>
              </ul>

              {p.incompleteCodes.length > 0 ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p className="font-medium">
                    {p.incompleteCodes.length} proveedor(es) con datos muy
                    incompletos (códigos:{" "}
                    {p.incompleteCodes.slice(0, 15).join(", ")}
                    {p.incompleteCodes.length > 15 ? "…" : ""}).
                  </p>
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={excludeIncomplete}
                      onChange={(e) => setExcludeIncomplete(e.target.checked)}
                    />
                    Excluir estos del import (no se crearán ni actualizarán)
                  </label>
                </div>
              ) : null}

              {previewData!.lowVolumeWarning ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-medium">
                    El archivo tiene {previewData!.rowCount} proveedor(es) pero la
                    base tiene {previewData!.databaseActiveCount} activos. ¿Estás
                    seguro? Esto puede desactivar hasta {p.deactivatedCount}{" "}
                    proveedor(es) que no aparezcan en el archivo.
                  </p>
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={confirmLowVolume}
                      onChange={(e) => setConfirmLowVolume(e.target.checked)}
                    />
                    Sí, el archivo es correcto y quiero continuar
                  </label>
                </div>
              ) : null}

              {p.needsBulkDeactivateConfirm ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                  <p className="font-medium">
                    Se desactivarán {p.deactivatedCount} proveedores. ¿Confirmas?
                  </p>
                  <label className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={confirmBulkDeactivate}
                      onChange={(e) =>
                        setConfirmBulkDeactivate(e.target.checked)
                      }
                    />
                    Sí, desactivar los que no vengan en el Excel
                  </label>
                </div>
              ) : null}

              <button
                type="button"
                disabled={
                  applyLoading ||
                  (p.needsBulkDeactivateConfirm && !confirmBulkDeactivate) ||
                  (previewData!.lowVolumeWarning && !confirmLowVolume)
                }
                onClick={() => void runApply()}
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {applyLoading ? "Importando…" : "Importar"}
              </button>
              {p.needsBulkDeactivateConfirm && !confirmBulkDeactivate ? (
                <p className="text-xs text-zinc-500">
                  Marca la confirmación de desactivación masiva para continuar.
                </p>
              ) : null}
              {previewData!.lowVolumeWarning && !confirmLowVolume ? (
                <p className="text-xs text-zinc-500">
                  Confirma que el archivo con pocas filas es intencional.
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {step === 3 && importResult ? (
        <section className="space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">
            Paso 3 — Resultado
          </h2>
          <ul className="space-y-2 text-sm text-zinc-800">
            <li>
              <strong>Insertados:</strong> {importResult.created}
            </li>
            <li>
              <strong>Actualizados:</strong> {importResult.updated}
            </li>
            <li>
              <strong>Desactivados:</strong> {importResult.deactivated}
            </li>
            <li>
              <strong>Omitidos:</strong> {importResult.skipped_warnings}
            </li>
          </ul>
          <Link
            href="/admin"
            className="inline-flex rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Volver al admin
          </Link>
        </section>
      ) : null}
    </div>
  );
}
