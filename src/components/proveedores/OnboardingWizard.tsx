"use client";

import {
  insertSupplierProfileBasico,
  insertSupplierProfilePendingPaidPlan,
} from "@/lib/proveedores/mutations";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { SupplierPlan } from "@/types/proveedores";
import type { Supplier } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type Step = 1 | 2 | 3 | 4;

export function OnboardingWizard() {
  const router = useRouter();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [step, setStep] = useState<Step>(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Supplier[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [whatsapp_negocio, setWhatsappNegocio] = useState("");
  const [website_url, setWebsiteUrl] = useState("");
  const [bio, setBio] = useState("");
  const [cover_url, setCoverUrl] = useState("");
  const [ships_internationally, setShipsIntl] = useState(false);
  const [shipping_agent_info, setShippingInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const search = useCallback(async () => {
    setLoadingSearch(true);
    setErr(null);
    try {
      const q = query.trim();
      const num = /^\d+$/.test(q) ? Number(q) : null;
      let req = supabase
        .from("suppliers")
        .select("id,codigo,tienda,categoria,logo_url,whatsapp,activo")
        .eq("activo", true)
        .limit(10);
      if (num != null) {
        req = req.eq("codigo", num);
      } else if (q) {
        req = req.ilike("tienda", `%${q}%`);
      }
      const { data, error } = await req;
      if (error) throw new Error(error.message);
      setResults((data ?? []) as Supplier[]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al buscar");
      setResults([]);
    } finally {
      setLoadingSearch(false);
    }
  }, [query, supabase]);

  const pickSupplier = useCallback(
    async (s: Supplier) => {
      setErr(null);
      const { data: taken } = await supabase
        .from("supplier_profiles")
        .select("user_id")
        .eq("supplier_id", s.id)
        .maybeSingle();
      if (taken?.user_id) {
        setErr("Esta tienda ya tiene una cuenta asignada.");
        return;
      }
      setSupplier(s);
      setWhatsappNegocio(s.whatsapp?.trim() ?? "");
      setStep(2);
    },
    [supabase],
  );

  async function finishBasico() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !supplier) return;
    setBusy(true);
    setErr(null);
    const res = await insertSupplierProfileBasico({
      supabase,
      userId: user.id,
      supplierId: supplier.id,
      whatsapp_negocio: whatsapp_negocio.trim() || null,
      website_url: website_url.trim() || null,
      bio: bio.trim() || null,
      cover_url: cover_url.trim() || null,
      ships_internationally,
      shipping_agent_info: shipping_agent_info.trim() || null,
    });
    setBusy(false);
    if (res.error) {
      setErr(res.error.message);
      return;
    }
    router.replace("/proveedor/dashboard");
    router.refresh();
  }

  async function finishPaid(plan: "vitrina" | "pro") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !supplier) return;
    setBusy(true);
    setErr(null);
    const ins = await insertSupplierProfilePendingPaidPlan({
      supabase,
      userId: user.id,
      supplierId: supplier.id,
      whatsapp_negocio: whatsapp_negocio.trim() || null,
      website_url: website_url.trim() || null,
      bio: bio.trim() || null,
      cover_url: cover_url.trim() || null,
      ships_internationally,
      shipping_agent_info: shipping_agent_info.trim() || null,
    });
    if (ins.error) {
      setBusy(false);
      setErr(ins.error.message);
      return;
    }
    const res = await fetch("/api/proveedores/lemon-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, supplier_id: supplier.id }),
    });
    const json: { url?: string; error?: string } = await res.json();
    setBusy(false);
    if (!res.ok || !json.url) {
      setErr(json.error ?? "No se pudo iniciar el pago");
      return;
    }
    window.open(json.url, "_self", "noopener");
  }

  async function onSelectPlan(plan: SupplierPlan) {
    if (plan === "basico") {
      await finishBasico();
      return;
    }
    await finishPaid(plan);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-navy">
        Alta proveedor Makeray
      </h1>
      <p className="text-sm text-navy/55">Paso {step} de 4</p>
      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {err}
        </p>
      ) : null}

      {step === 1 ? (
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-navy">
            Buscar tienda o código
          </label>
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-12 flex-1 rounded-xl border border-primary/20 px-3 text-sm"
              placeholder="Nombre o código"
            />
            <button
              type="button"
              className="rounded-xl bg-primary px-4 text-sm font-bold text-white"
              onClick={() => void search()}
              disabled={loadingSearch}
            >
              Buscar
            </button>
          </div>
          <ul className="space-y-2">
            {results.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl border border-primary/15 bg-white p-3 text-left hover:bg-primary/5"
                  onClick={() => void pickSupplier(s)}
                >
                  {s.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo_url}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {s.tienda[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-navy">{s.tienda}</div>
                    <div className="text-xs text-navy/45">
                      #{s.codigo} · {s.categoria ?? "Sin categoría"}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 2 && supplier ? (
        <div className="space-y-4">
          <p className="text-sm text-navy/60">
            Confirmá los datos de <strong>{supplier.tienda}</strong>
          </p>
          <label className="block text-sm font-semibold">WhatsApp negocio</label>
          <input
            value={whatsapp_negocio}
            onChange={(e) => setWhatsappNegocio(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-primary/20 px-3 text-sm"
          />
          <label className="block text-sm font-semibold">Sitio web (opcional)</label>
          <input
            value={website_url}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-primary/20 px-3 text-sm"
            placeholder="https://"
          />
          <button
            type="button"
            className="w-full min-h-12 rounded-xl bg-primary font-bold text-white"
            onClick={() => setStep(3)}
          >
            Continuar
          </button>
        </div>
      ) : null}

      {step === 3 && supplier ? (
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Bio (máx. 600)</label>
          <textarea
            value={bio}
            maxLength={600}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
          />
          <p className="text-xs text-navy/45">{bio.length}/600</p>
          <label className="block text-sm font-semibold">
            URL de portada (opcional)
          </label>
          <input
            value={cover_url}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-primary/20 px-3 text-sm"
            placeholder="https://…"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={ships_internationally}
              onChange={(e) => setShipsIntl(e.target.checked)}
            />
            Envío internacional
          </label>
          {ships_internationally ? (
            <textarea
              value={shipping_agent_info}
              onChange={(e) => setShippingInfo(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
              placeholder="Instrucciones para agente de carga"
            />
          ) : null}
          <button
            type="button"
            className="w-full min-h-12 rounded-xl bg-primary font-bold text-white"
            onClick={() => setStep(4)}
          >
            Continuar
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <p className="text-sm text-navy/60">Elegí tu plan</p>
          <div className="grid gap-3">
            {(
              [
                ["basico", "Básico", "Gratis · perfil en directorio"],
                ["vitrina", "Vitrina", "Catálogo + ofertas"],
                ["pro", "Pro", "Todo Vitrina con más alcance"],
              ] as const
            ).map(([plan, title, desc]) => (
              <button
                key={plan}
                type="button"
                disabled={busy}
                className="rounded-2xl border border-primary/15 bg-white p-4 text-left hover:border-primary/40 disabled:opacity-50"
                onClick={() => void onSelectPlan(plan)}
              >
                <div className="font-bold text-navy">{title}</div>
                <div className="text-sm text-navy/55">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step > 1 ? (
        <button
          type="button"
          className="text-sm font-semibold text-primary underline"
          onClick={() => setStep((s) => (s > 1 ? ((s - 1) as Step) : s))}
        >
          ← Atrás
        </button>
      ) : null}
    </div>
  );
}
