import { SignOutButton } from "@/components/auth/SignOutButton";
import { HubCard } from "@/components/HubCard";
import { MakerayLogo } from "@/components/MakerayLogo";
import { BillingPortalButton } from "@/components/stripe/BillingPortalButton";
import {
  fetchSubscriptionAccessRow,
  hasSubscriptionAccess,
  parseAdminEmails,
} from "@/lib/auth/entitlements";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const muted = "rgba(26, 6, 51, 0.55)";

function getUserInitials(user: User): string {
  const raw = user.user_metadata?.full_name;
  const name = typeof raw === "string" ? raw : undefined;
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return user.email?.[0]?.toUpperCase() ?? "?";
}

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const showPaymentThanks = Boolean(params.session_id);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sub = await fetchSubscriptionAccessRow(supabase, user.id);
  if (!hasSubscriptionAccess(sub)) {
    redirect("/checkout");
  }

  const { data: billingRow } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, customer_portal_url")
    .eq("user_id", user.id)
    .maybeSingle();

  const canUseBillingPortal = Boolean(
    billingRow?.stripe_customer_id || billingRow?.customer_portal_url,
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const adminEmails = parseAdminEmails();
  const userEmail = session?.user?.email?.trim().toLowerCase() ?? "";
  const isAdmin = adminEmails.includes(userEmail);

  const rawName = user.user_metadata?.full_name;
  const fullName = typeof rawName === "string" ? rawName : undefined;
  const firstName =
    fullName?.split(" ")[0] ?? user.email?.split("@")[0] ?? "bienvenida";

  const hasActiveDirectory = hasSubscriptionAccess(sub);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-off)" }}>
      <header
        style={{
          background: "var(--color-navy)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <MakerayLogo size="sm" invert href="/" />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <BillingPortalButton
            disabled={!canUseBillingPortal}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
          />
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
            aria-hidden
          >
            {getUserInitials(user)}
          </div>
          <SignOutButton className="shrink-0 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-white/10 disabled:opacity-50" />
        </div>
      </header>

      {showPaymentThanks ? (
        <p
          style={{
            margin: "16px 24px 0",
            maxWidth: 900,
            marginLeft: "auto",
            marginRight: "auto",
            borderRadius: 12,
            border: "1px solid rgb(167 243 208)",
            background: "rgb(236 253 245)",
            padding: "12px 16px",
            fontSize: "0.875rem",
            color: "rgb(6 78 59)",
          }}
          role="status"
        >
          Pago recibido. Tu suscripción debería estar activa; si algo no carga,
          espera unos segundos o actualiza la página.
        </p>
      ) : null}

      <section
        style={{ padding: "48px 24px 24px", maxWidth: 900, margin: "0 auto" }}
      >
        <p
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-accent)",
            marginBottom: 8,
          }}
        >
          Tu espacio
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            fontWeight: 700,
            color: "var(--color-navy)",
            letterSpacing: "-0.03em",
            marginBottom: 8,
          }}
        >
          Hola, {firstName}. 👋
        </h1>
        <p style={{ color: muted, fontSize: "1rem", margin: 0 }}>
          ¿Qué quieres hacer hoy?
        </p>
      </section>

      <section style={{ padding: "0 24px 64px", maxWidth: 900, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {hasActiveDirectory ? (
            <HubCard
              href="/directorio"
              emoji="📋"
              title="Directorio de Proveedores"
              description="+75 proveedores mayoristas verificados. Contacto directo por WhatsApp."
              badge="Activo"
              badgeColor="green"
              accent="primary"
            />
          ) : null}

          <HubCard
            href="/cursos"
            emoji="🎓"
            title="Cursos"
            description="Aprende a vender, hacer marketing y hacer crecer tu tienda."
            accent="accent"
          />

          {isAdmin ? (
            <HubCard
              href="/admin"
              emoji="⚙️"
              title="Panel Admin"
              description="Gestiona proveedores, suscriptores y contenido del directorio."
              accent="navy"
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
