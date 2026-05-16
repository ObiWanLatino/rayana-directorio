"use client";

import { PlanUpgradeCard } from "@/components/proveedores/PlanUpgradeCard";
import { insertSupplierOffer } from "@/lib/proveedores/mutations";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function NuevaOfertaForm({
  supplierId,
  maxDays,
}: {
  supplierId: string;
  maxDays: number;
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState(() =>
    addDays(new Date(), Math.min(7, maxDays)).toISOString().slice(0, 16),
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const titulo = String(fd.get("titulo") ?? "").trim();
    if (!titulo) {
      setErr("Título requerido");
      setBusy(false);
      return;
    }
    const expiresLocal = String(fd.get("expires_at") ?? "");
    const expires_at = new Date(expiresLocal).toISOString();
    const max = addDays(new Date(), maxDays).getTime();
    if (new Date(expires_at).getTime() > max) {
      setErr(`La oferta no puede durar más de ${maxDays} días en tu plan.`);
      setBusy(false);
      return;
    }
    if (new Date(expires_at).getTime() <= Date.now()) {
      setErr("La fecha de fin debe ser futura.");
      setBusy(false);
      return;
    }

    const { error } = await insertSupplierOffer({
      supabase,
      supplierId,
      titulo,
      descripcion: String(fd.get("descripcion") ?? "").trim() || null,
      descuento_pct: fd.get("descuento_pct")
        ? Number(fd.get("descuento_pct"))
        : null,
      foto_url: null,
      expires_at,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.replace("/proveedor/dashboard/ofertas");
    router.refresh();
  }

  return (
    <form
      onSubmit={(ev) => void onSubmit(ev)}
      onChange={(e) => {
        const el = e.target;
        if (!(el instanceof HTMLInputElement)) return;
        if (el.name !== "expires_at") return;
        const v = el.value;
        if (v) setPreview(new Date(v).toISOString());
      }}
      className="space-y-4"
    >
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <label className="block text-sm font-semibold">Título</label>
      <input name="titulo" required className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Descripción</label>
      <textarea name="descripcion" rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" />
      <label className="block text-sm font-semibold">Descuento %</label>
      <input name="descuento_pct" type="number" min={1} max={90} className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Termina</label>
      <input
        name="expires_at"
        type="datetime-local"
        required
        defaultValue={addDays(new Date(), Math.min(7, maxDays)).toISOString().slice(0, 16)}
        className="w-full min-h-12 rounded-xl border px-3 text-sm"
      />
      <p className="text-xs text-navy/45">
        Vista previa ISO: {new Date(preview).toLocaleString("es-CL")}
      </p>
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
      >
        Publicar oferta
      </button>
    </form>
  );
}

export function OfertasUpgradeGate() {
  return <PlanUpgradeCard />;
}
