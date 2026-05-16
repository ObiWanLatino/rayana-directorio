"use client";

import { PlanUpgradeCard } from "@/components/proveedores/PlanUpgradeCard";
import { insertSupplierProduct } from "@/lib/proveedores/mutations";
import { uploadSupplierAsset } from "@/lib/proveedores/storage";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function NuevoProductoForm({
  supplierId,
  categorias,
}: {
  supplierId: string;
  categorias: string[];
}) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const nombre = String(fd.get("nombre") ?? "").trim();
    if (!nombre) {
      setErr("Nombre requerido");
      setBusy(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setErr("Sesión requerida");
      setBusy(false);
      return;
    }

    let foto_url: string | null = null;
    const file = fd.get("foto") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "webp";
      const safeExt = ext.length > 5 ? "webp" : ext;
      const path = `${user.id}/products/${crypto.randomUUID()}.${safeExt}`;
      const { publicUrl, error: upErr } = await uploadSupplierAsset(
        supabase,
        path,
        file,
        file.type || "image/jpeg",
      );
      if (upErr) {
        setErr(upErr.message);
        setBusy(false);
        return;
      }
      foto_url = publicUrl;
    }

    const { error } = await insertSupplierProduct({
      supabase,
      supplierId,
      nombre,
      descripcion: String(fd.get("descripcion") ?? "").trim() || null,
      precio_clp: fd.get("precio_clp")
        ? Number(fd.get("precio_clp"))
        : null,
      precio_mayorista: fd.get("precio_mayorista")
        ? Number(fd.get("precio_mayorista"))
        : null,
      minimo_unidades: fd.get("minimo_unidades")
        ? Number(fd.get("minimo_unidades"))
        : 1,
      foto_url,
      categoria: String(fd.get("categoria") ?? "").trim() || null,
    });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.replace("/proveedor/dashboard/catalogo");
    router.refresh();
  }

  return (
    <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-4">
      {err ? <p className="text-sm text-red-700">{err}</p> : null}
      <label className="block text-sm font-semibold">Nombre</label>
      <input name="nombre" required className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Descripción</label>
      <textarea name="descripcion" rows={3} className="w-full rounded-xl border px-3 py-2 text-sm" />
      <label className="block text-sm font-semibold">Precio CLP unitario</label>
      <input name="precio_clp" type="number" min={0} className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Precio mayorista CLP</label>
      <input name="precio_mayorista" type="number" min={0} className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Mínimo unidades</label>
      <input name="minimo_unidades" type="number" min={1} defaultValue={1} className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <label className="block text-sm font-semibold">Categoría</label>
      <input name="categoria" list="catlist" className="w-full min-h-12 rounded-xl border px-3 text-sm" />
      <datalist id="catlist">
        {categorias.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <label className="block text-sm font-semibold">Foto</label>
      <input name="foto" type="file" accept="image/*" className="text-sm" />
      <button
        type="submit"
        disabled={busy}
        className="min-h-12 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50"
      >
        Guardar
      </button>
    </form>
  );
}

export function CatalogoUpgradeGate() {
  return <PlanUpgradeCard />;
}
