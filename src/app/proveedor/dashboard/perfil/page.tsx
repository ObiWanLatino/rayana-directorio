import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
} from "@/lib/auth/entitlements";
import { updateSupplierProfile } from "@/lib/proveedores/mutations";
import { getMySupplierProfile } from "@/lib/proveedores/queries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function saveProfile(formData: FormData) {
  "use server";
  const sb = await createServerSupabaseClient();
  const {
    data: { user: u },
  } = await sb.auth.getUser();
  if (!u) redirect("/login");
  const row = await getMySupplierProfile(sb);
  if (!row) redirect("/proveedor/onboarding");
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const website_url = String(formData.get("website_url") ?? "").trim() || null;
  const whatsapp_negocio =
    String(formData.get("whatsapp_negocio") ?? "").trim() || null;
  const ships_internationally = formData.get("ships_internationally") === "on";
  const shipping_agent_info =
    String(formData.get("shipping_agent_info") ?? "").trim() || null;
  await updateSupplierProfile(sb, row.id, {
    bio,
    website_url,
    whatsapp_negocio,
    ships_internationally,
    shipping_agent_info,
  });
  redirect("/proveedor/dashboard/perfil?saved=1");
}

export default async function ProveedorPerfilPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/proveedor/dashboard/perfil");

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) redirect("/checkout");

  const profileRow = await getMySupplierProfile(supabase);
  if (!profileRow?.onboarding_completed) redirect("/proveedor/onboarding");

  const sp = await searchParams;
  const saved = sp.saved === "1";

  return (
    <div className="min-h-screen bg-off px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <Link href="/proveedor/dashboard" className="text-sm text-primary underline">
          ← Dashboard
        </Link>
        <h1 className="font-display text-2xl font-bold text-navy">Editar perfil Pro</h1>
        {saved ? (
          <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Cambios guardados.
          </p>
        ) : null}
        <form
          action={saveProfile}
          className="space-y-4 rounded-2xl border border-primary/12 bg-white p-6"
        >
          <label className="block text-sm font-semibold">Bio</label>
          <textarea
            name="bio"
            defaultValue={profileRow.bio ?? ""}
            maxLength={600}
            rows={5}
            className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
          />
          <label className="block text-sm font-semibold">WhatsApp negocio</label>
          <input
            name="whatsapp_negocio"
            defaultValue={profileRow.whatsapp_negocio ?? ""}
            className="w-full min-h-12 rounded-xl border border-primary/20 px-3 text-sm"
          />
          <label className="block text-sm font-semibold">Sitio web</label>
          <input
            name="website_url"
            defaultValue={profileRow.website_url ?? ""}
            className="w-full min-h-12 rounded-xl border border-primary/20 px-3 text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="ships_internationally"
              defaultChecked={profileRow.ships_internationally}
            />
            Envío internacional
          </label>
          <label className="block text-sm font-semibold">Agente de carga</label>
          <textarea
            name="shipping_agent_info"
            defaultValue={profileRow.shipping_agent_info ?? ""}
            rows={3}
            className="w-full rounded-xl border border-primary/20 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="min-h-12 w-full rounded-xl bg-primary font-bold text-white"
          >
            Guardar
          </button>
        </form>
      </div>
    </div>
  );
}
