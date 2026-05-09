"use client";

import { MakerayLogo } from "@/components/MakerayLogo";
import { useReveal } from "@/hooks/useReveal";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const FAQ_ITEMS = [
  {
    id: "faq-1",
    q: "¿Cómo accedo al directorio?",
    a: "Luego de suscribirte con tarjeta de crédito o débito, recibes acceso inmediato al directorio completo.",
  },
  {
    id: "faq-2",
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. Puedes cancelar en cualquier momento. Mantendrás el acceso hasta el fin del período pagado. No hay reembolsos.",
  },
  {
    id: "faq-3",
    q: "¿Los proveedores están en todo Chile?",
    a: "La mayoría está en Santiago, especialmente en Patronato y zonas mayoristas. Algunos tienen despacho a regiones.",
  },
  {
    id: "faq-4",
    q: "¿Cómo contacto a los proveedores?",
    a: "Con un tap en el botón de WhatsApp. Se abre con un mensaje pre-escrito listo para enviar.",
  },
  {
    id: "faq-5",
    q: "¿Es seguro pagar?",
    a: "Sí. Los pagos se procesan con Stripe. Nunca almacenamos tus datos bancarios.",
  },
  {
    id: "faq-6",
    q: "¿Qué pasa si Rayana agrega nuevos proveedores?",
    a: "Los ves automáticamente sin costo adicional. La suscripción incluye todas las actualizaciones.",
  },
] as const;

const LANDING_CATS = [
  { icon: "👗", name: "Moda Femenina", count: "38 proveedores" },
  { icon: "💍", name: "Joyas", count: "6 proveedores" },
  { icon: "🏠", name: "Deco Hogar", count: "5 proveedores" },
  { icon: "👖", name: "Jeans", count: "5 proveedores" },
  { icon: "💄", name: "Cosméticos", count: "3 proveedores" },
  { icon: "👜", name: "Accesorios", count: "4 proveedores" },
  { icon: "👶", name: "Infantil", count: "2 proveedores" },
  { icon: "🏭", name: "Importadoras", count: "2 proveedores" },
] as const;

function revealStep(i: number): string {
  if (i === 0) return "reveal-delay-1";
  if (i === 1) return "reveal-delay-2";
  return "reveal-delay-3";
}

function revealStagger(i: number): string {
  if (i % 3 === 0) return "reveal-delay-1";
  if (i % 3 === 1) return "reveal-delay-2";
  return "reveal-delay-3";
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function RayanaSocialLinks() {
  return (
    <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
      {/* Instagram */}
      <a
        href="https://instagram.com/makeray"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#f3eff8",
          border: "1.5px solid rgba(89,47,146,0.15)",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#592f92"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </a>

      {/* TikTok */}
      <a
        href="https://tiktok.com/@makeray"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="TikTok"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#f3eff8",
          border: "1.5px solid rgba(89,47,146,0.15)",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="#592f92"
          aria-hidden
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
        </svg>
      </a>

      {/* YouTube */}
      <a
        href="https://youtube.com/@makeray.youtube"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#f3eff8",
          border: "1.5px solid rgba(89,47,146,0.15)",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="#592f92"
          aria-hidden
        >
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
        </svg>
      </a>

      {/* Google Maps */}
      <a
        href="https://maps.google.com/?q=Patronato,+Santiago,+Chile"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver en Google Maps"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          backgroundColor: "#f3eff8",
          border: "1.5px solid rgba(89,47,146,0.15)",
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#592f92"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </a>
    </div>
  );
}

function WaGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  );
}

export default function LandingClient() {
  useReveal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-off text-navy">
      <header
        className={`sticky top-0 z-50 border-b border-primary/10 transition-shadow duration-300 ${
          navScrolled ? "shadow-md shadow-primary/8" : ""
        }`}
        style={{
          background: "rgba(253,251,253,0.88)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-6 px-5">
          <MakerayLogo
            size="md"
            href="/"
            priority
            onClick={closeMobile}
          />
          <nav className="hidden items-center gap-8 md:flex">
            {[
              ["¿Qué incluye?", "#incluye"],
              ["Categorías", "#categorias"],
              ["Precio", "#precio"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-navy/55 transition-colors hover:text-accent"
              >
                {label}
              </a>
            ))}
            <Link
              href="/login"
              style={{
                padding: "9px 20px",
                borderRadius: "999px",
                border: "1.5px solid rgba(89,47,146,0.25)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "var(--color-primary)",
                textDecoration: "none",
                transition: "border-color 0.2s, background 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/35"
            >
              Suscribirme — $19.990/mes
            </Link>
          </nav>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-navy md:hidden"
            aria-expanded={mobileOpen}
            aria-label="Abrir menú"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
        <div
          className={`flex flex-col gap-1 border-t border-primary/10 px-5 py-3 md:hidden ${mobileOpen ? "" : "hidden"}`}
        >
          {[
            ["¿Qué incluye?", "#incluye"],
            ["Categorías", "#categorias"],
            ["Precio", "#precio"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="rounded-xl px-3 py-3 font-semibold text-navy hover:bg-soft"
              onClick={closeMobile}
            >
              {label}
            </a>
          ))}
          <Link
            href="/login"
            onClick={closeMobile}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              fontWeight: 600,
              color: "var(--color-primary)",
              textDecoration: "none",
              display: "block",
            }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/login"
            className="mt-2 rounded-xl bg-accent py-3 text-center font-bold text-white"
            onClick={closeMobile}
          >
            Suscribirme — $19.990/mes
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="px-5 pb-16 pt-10 md:pb-20 md:pt-14">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="mb-6 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-navy/50">
              <SparkleIcon className="shrink-0 text-accent" />
              <span>por Rayana · @makeray.youtube</span>
            </p>
            <h1 className="font-display text-[2.6rem] font-bold leading-[1.12] tracking-[-0.03em] text-navy md:text-[clamp(2.6rem,5vw,4rem)]">
              Los proveedores
              <br />
              que cambiarán
              <br />
              tu <em className="italic text-accent">negocio.</em>
            </h1>
            <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-navy/55">
              <strong className="font-semibold text-primary">+75 proveedores mayoristas</strong>{" "}
              verificados por Rayana. Contacto directo por WhatsApp desde tu celular. Sin
              intermediarios.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-[14px] bg-accent px-7 py-3.5 text-base font-bold text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:shadow-accent/35"
              >
                Acceder ahora →
              </Link>
              <a
                href="#incluye"
                className="inline-flex rounded-[14px] border-2 border-primary/20 px-6 py-3.5 text-[15px] font-semibold text-primary transition hover:border-primary hover:bg-primary/5"
              >
                Ver qué incluye
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-navy/50">
              <span aria-hidden>🔒</span>
              <span>
                <strong className="font-semibold text-primary">$19.990 CLP</strong> / mes · cancela
                cuando quieras
              </span>
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "linear-gradient(135deg,#592f92,#ff108a)",
                  "linear-gradient(135deg,#1a0633,#592f92)",
                  "linear-gradient(135deg,#7c52b8,#ff6eb4)",
                  "linear-gradient(135deg,#ff108a,#f5a623)",
                ].map((bg, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-off"
                    style={{ background: bg }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-navy/50">+500 emprendedoras ya dentro</span>
            </div>
          </div>

          <div className="relative order-1 flex justify-center lg:order-2">
            <div className="relative w-[280px]">
              <div
                className="pointer-events-none absolute inset-[-40px] rounded-full opacity-70"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(89,47,146,.25) 0%, transparent 70%)",
                }}
              />
              <div className="animate-makeray-float relative z-[2]">
                <div
                  className="absolute right-[-52px] top-10 z-[3] hidden max-w-[140px] rounded-2xl bg-white px-3 py-2.5 text-xs font-semibold shadow-lg sm:block"
                  style={{ animation: "makeray-float 3s ease-in-out infinite 0.5s" }}
                >
                  <span className="font-display text-lg font-bold text-primary">75+</span>
                  <div className="text-[10px] text-navy/50">Proveedores</div>
                  <div className="text-[11px]">verificados ✓</div>
                </div>
                <div
                  className="absolute bottom-24 left-[-56px] z-[3] hidden max-w-[130px] rounded-2xl bg-white px-3 py-2.5 text-xs font-semibold shadow-lg sm:block"
                  style={{ animation: "makeray-float 3s ease-in-out infinite 1.2s" }}
                >
                  <div className="flex items-center gap-2">
                    <WaGlyph className="text-wa" />
                    <div>
                      <div className="text-[11px]">1 tap a</div>
                      <div className="text-[10px] text-navy/50">WhatsApp</div>
                    </div>
                  </div>
                </div>
                <div
                  className="rounded-[40px] p-3 shadow-2xl"
                  style={{
                    background: "linear-gradient(145deg, #1a0633, #2d1157)",
                    boxShadow: "0 40px 80px rgba(26,6,51,.45), 0 0 0 1px rgba(255,255,255,.08)",
                  }}
                >
                  <div className="flex h-[500px] flex-col overflow-hidden rounded-[30px] bg-white">
                    <div className="bg-primary px-4 pb-3 pt-4 text-white">
                      <div className="mb-3 flex justify-between text-[10px] opacity-80">
                        <span>9:41</span>
                        <span>●●●</span>
                      </div>
                      <h3 className="text-base font-bold">Directorio Makeray</h3>
                      <p className="text-[11px] opacity-70">+75 proveedores verificados</p>
                    </div>
                    <div className="mx-3 mt-3 flex items-center gap-2 rounded-[10px] bg-soft px-3 py-2 text-[12px] text-navy/50">
                      <span className="text-xs">🔍</span>
                      Buscar por código #47…
                    </div>
                    <div className="mt-2 flex gap-1.5 overflow-hidden px-3">
                      {["👗 Moda", "💍 Joyas", "🏠 Deco"].map((t, i) => (
                        <span
                          key={t}
                          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            i === 0 ? "bg-accent text-white" : "bg-soft text-primary"
                          }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-1 flex-col gap-2 overflow-hidden px-3 pb-3">
                      {[
                        { code: "#47", name: "Atelier Rosé", cat: "Moda Femenina", grad: "linear-gradient(135deg,#592f92,#ff108a)" },
                        { code: "#48", name: "Joyería Maipú", cat: "Joyas", grad: "linear-gradient(135deg,#1a0633,#592f92)" },
                        { code: "#49", name: "Deco Lo Espejo", cat: "Deco Hogar", grad: "linear-gradient(135deg,#ff108a,#ff6eb4)" },
                      ].map((row) => (
                        <div
                          key={row.code}
                          className="flex items-center gap-2.5 rounded-xl border border-primary/12 bg-white p-2.5 shadow-sm"
                        >
                          <div
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] text-[10px] font-extrabold text-white"
                            style={{ background: row.grad }}
                          >
                            {row.code}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] font-semibold text-navy/50">
                              {row.code} · {row.cat}
                            </div>
                            <div className="truncate text-[12px] font-bold text-navy">{row.name}</div>
                            <span className="mt-0.5 inline-block rounded border border-gold/30 bg-gold/10 px-1.5 py-px text-[9px] font-bold text-[#a06900]">
                              ✓ Verificado
                            </span>
                          </div>
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-wa text-white">
                            <WaGlyph className="text-white" />
                          </div>
                        </div>
                      ))}
                      <div className="relative flex items-center gap-2 rounded-xl border border-primary/10 p-2.5 opacity-60">
                        <div className="h-9 flex-1 rounded-lg bg-navy/10 blur-[2px]" />
                        <span className="text-lg">🔒</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-navy py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 md:grid-cols-4 md:gap-8">
          {[
            ["75+", "Proveedores"],
            ["8", "Categorías"],
            ["1 tap", "a WhatsApp"],
            ["100%", "Verificados"],
          ].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="font-display text-[2rem] font-bold tracking-tight text-white">
                {n}
              </div>
              <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
                {l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEMA */}
      <section id="problema" className="scroll-mt-24 bg-white px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-14 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              La realidad del emprendimiento
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-[-0.03em] text-navy">
              Emprender en Chile no debería ser un dolor de cabeza.
            </h2>
            <p className="mt-4 max-w-lg text-[1.05rem] text-navy/55">
              Sabemos lo que frena tu crecimiento — y cómo el directorio correcto lo cambia.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: "🔍",
                t: "Pagas de más",
                d: "Comprar a intermediarios en redes sociales está comiendo tu margen. Necesitas llegar a la fuente.",
              },
              {
                icon: "⏰",
                t: "Pierdes tiempo",
                d: "Horas en Meiggs o Patronato buscando calidad, cuando podrías estar enfocada en vender.",
              },
              {
                icon: "🛡️",
                t: "Miedo a estafas",
                d: "Transferir a perfiles dudosos es un riesgo. Necesitas contactos verificados por alguien de confianza.",
              },
            ].map((c, i) => (
              <div
                key={c.t}
                className={`reveal ${revealStep(i)} rounded-3xl border border-primary/10 bg-soft p-8 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/8`}
              >
                <div className="mb-5 text-3xl">{c.icon}</div>
                <h3 className="font-display text-xl font-bold text-navy">{c.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/55">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section
        id="incluye"
        className="scroll-mt-24 bg-navy px-5 py-16 md:py-24"
      >
        <div className="relative z-[2] mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="reveal">
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent2">
                Directorio Makeray
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold leading-tight tracking-[-0.03em] text-white">
                Todo lo que necesitas en un solo lugar.
              </h2>
              <ul className="mt-8 flex flex-col gap-4">
                {[
                  ["📋", "75+ Proveedores Verificados", "Moda, joyas, deco, jeans y más. Curados personalmente por Rayana."],
                  ["💬", "Directo a WhatsApp", "Un tap y estás hablando con el proveedor. Mensaje pre-escrito incluido."],
                  ["🔄", "Siempre Actualizado", "Rayana agrega nuevos proveedores cada mes."],
                  ["📱", "Diseñado para tu celular", "Úsalo en ferias, shows de moda, donde estés."],
                ].map(([icon, title, desc]) => (
                  <li key={title} className="flex gap-3.5 text-[15px] leading-snug text-white/80">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/10 text-base">
                      {icon}
                    </span>
                    <span>
                      <strong className="block text-white">{title}</strong>
                      {desc}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[14px] bg-accent px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-accent/40"
                >
                  Suscribirme ahora →
                </Link>
                <div className="rounded-[10px] border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/70">
                  <strong className="text-white">$19.990</strong> / mes
                </div>
              </div>
            </div>
            <div className="reveal reveal-delay-1">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                <div className="flex items-start justify-between gap-4 bg-gradient-to-br from-primary/80 to-navy/95 px-7 py-7">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-white">Directorio Makeray</h3>
                    <p className="mt-1 text-sm text-white/60">Proveedores mayoristas de Chile</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    2026
                  </span>
                </div>
                <div className="relative space-y-2.5 p-5">
                  {[
                    { code: "#47", name: "Atelier Rosé", cat: "Moda Femenina", g: "linear-gradient(135deg,#592f92,#ff108a)" },
                    { code: "#48", name: "Joyería Maipú", cat: "Joyas", g: "linear-gradient(135deg,#1a0633,#592f92)" },
                    { code: "#49", name: "Deco Lo Espejo", cat: "Deco Hogar", g: "linear-gradient(135deg,#ff108a,#ff6eb4)" },
                  ].map((r) => (
                    <div
                      key={r.code}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                          style={{ background: r.g }}
                        >
                          {r.code}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{r.name}</div>
                          <div className="text-[11px] text-white/50">{r.cat}</div>
                        </div>
                      </div>
                      <span className="rounded border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold">
                        ✓ Verificado
                      </span>
                    </div>
                  ))}
                  <div className="relative overflow-hidden rounded-xl border border-white/10 py-6 text-center text-sm font-semibold text-white/70">
                    <div className="blur-sm">████ · 🔒</div>
                    <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-navy from-40% to-transparent pb-4 text-xs">
                      🔒 +70 proveedores más al suscribirte
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section id="categorias" className="scroll-mt-24 bg-soft px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-14 text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              Catálogo
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.03em] text-navy">
              8 categorías reales en el directorio
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {LANDING_CATS.map((c, i) => (
              <div
                key={c.name}
                className={`reveal ${revealStagger(i)} rounded-[20px] border border-primary/12 bg-white p-6 text-center transition hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8`}
              >
                <div className="text-3xl">{c.icon}</div>
                <div className="mt-2 text-sm font-bold text-navy">{c.name}</div>
                <div className="mt-2 inline-block rounded-full bg-primary/8 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {c.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOBILE UX */}
      <section className="bg-white px-5 py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="reveal">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              En tu bolsillo
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.03em] text-navy">
              Diseñado para usar desde tu celular.
            </h2>
            <p className="mt-4 max-w-md text-[1.05rem] text-navy/55">
              En ferias, en la tienda o en la calle — el directorio completo, siempre contigo.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                ["🔍", "Busca por código #47", "Códigos únicos para ir directo al proveedor."],
                ["💬", "WhatsApp con un tap", "Mensaje listo, sin copiar números."],
                ["⭐", "Proveedores verificados", "Curados por Rayana, con sello de confianza."],
                ["📂", "Filtros por categoría", "Moda, joyas, deco y más en segundos."],
              ].map(([icon, t, d]) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-soft text-lg">
                    {icon}
                  </span>
                  <div>
                    <h4 className="font-bold text-navy">{t}</h4>
                    <p className="mt-1 text-sm text-navy/55">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal reveal-delay-1 flex justify-center">
            <div className="relative w-[240px]">
              <div
                className="rounded-[36px] p-2.5 shadow-2xl"
                style={{
                  background: "linear-gradient(145deg, #1a0633, #2d1157)",
                  boxShadow: "0 32px 72px rgba(26,6,51,.4), 0 0 0 1px rgba(255,255,255,.08)",
                }}
              >
                <div className="flex h-[420px] flex-col overflow-hidden rounded-[28px] bg-white">
                  <div className="bg-primary px-3.5 pb-3 pt-4 text-white">
                    <div className="text-[10px] opacity-60">9:41 ● ● ●</div>
                    <h4 className="mt-2 text-sm font-bold">Directorio</h4>
                    <p className="text-[10px] opacity-65">Buscar #47…</p>
                  </div>
                  <div className="mx-2.5 mt-2 flex items-center gap-1.5 rounded-lg bg-soft px-2.5 py-2 text-[10px] text-navy/50">
                    🔍 Buscar por código…
                  </div>
                  <div className="mx-2.5 mt-2 flex gap-1">
                    {["👗 Moda", "💍 Joyas", "🏠 Deco"].map((x, j) => (
                      <span
                        key={x}
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          j === 0 ? "bg-accent text-white" : "bg-soft text-primary"
                        }`}
                      >
                        {x}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-1 flex-col gap-1.5 overflow-hidden px-2.5 pb-2">
                    {[
                      ["#47", "Atelier Rosé", "Moda femenina", "linear-gradient(135deg,#592f92,#ff108a)"],
                      ["#48", "Joyería Maipú", "Joyas", "linear-gradient(135deg,#1a0633,#7c52b8)"],
                      ["#49", "Deco Lo Espejo", "Deco Hogar", "linear-gradient(135deg,#ff108a,#ff6eb4)"],
                      ["#50", "Importadora Norte", "Importadoras", "linear-gradient(135deg,#592f92,#1a0633)"],
                    ].map((row) => (
                      <div
                        key={row[0]}
                        className="flex items-center gap-2 rounded-[10px] border border-primary/10 p-2"
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[9px] font-extrabold text-white"
                          style={{ background: row[3] }}
                        >
                          {row[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-bold text-navy">{row[1]}</div>
                          <div className="text-[9px] text-navy/50">{row[2]}</div>
                        </div>
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-wa text-white">
                          <WaGlyph className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RAYANA */}
      <section className="bg-soft px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="reveal grid items-center gap-10 rounded-[32px] border border-primary/10 bg-white p-8 md:grid-cols-[auto_1fr] md:gap-12 md:p-12">
            <div className="relative mx-auto w-[180px] shrink-0 md:mx-0">
              <div
                className="absolute inset-[-8px] rounded-full"
                style={{
                  background:
                    "linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, var(--color-primary), var(--color-accent)) border-box",
                  border: "3px solid transparent",
                }}
              />
              <div className="relative z-[2] overflow-hidden rounded-full border-4 border-white shadow-lg">
                <Image
                  src="/landing/foto-rayana.jpg"
                  alt="Rayana"
                  width={180}
                  height={180}
                  className="aspect-square object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-[-6px] z-[3] flex items-center gap-1 rounded-[10px] bg-[#ff0000] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-md">
                ▶ @makeray.youtube
              </div>
            </div>
            <div className="text-center md:text-left">
              <p className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.1em] text-accent">
                <SparkleIcon className="shrink-0" />
                <span>La curadora</span>
              </p>
              <h3 className="mt-2 font-display text-4xl font-bold tracking-tight text-navy">
                Soy Rayana.
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-navy/55">
                Llevo <strong className="text-navy">años construyendo relaciones</strong> con
                proveedores mayoristas en Chile. Cada contacto está verificado{" "}
                <strong className="text-navy">personalmente por mí</strong> — para que tú no pierdas
                tiempo buscando, ni te quemes con proveedores que no responden.
              </p>
              <RayanaSocialLinks />
            </div>
          </div>
        </div>
      </section>

      {/* PRECIO */}
      <section id="precio" className="scroll-mt-24 bg-white px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <div className="reveal mb-10">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              Acceso completo
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.03em] text-navy">
              Un solo precio. Todo incluido.
            </h2>
          </div>
          <div className="reveal reveal-delay-1 mx-auto max-w-[460px] overflow-hidden rounded-[28px] bg-gradient-to-br from-navy to-[#2d1157] p-10 text-left shadow-2xl shadow-navy/25">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl font-bold text-white">Directorio Makeray</h3>
              <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80">
                Edición 2026
              </span>
            </div>
            <div className="mt-8">
              <div className="font-display text-5xl font-bold text-white">$19.990</div>
              <p className="mt-2 text-sm text-white/50">CLP / mes · cancela cuando quieras</p>
            </div>
            <ul className="mt-8 space-y-3">
              {[
                "Acceso a +75 proveedores",
                "Contacto directo por WhatsApp",
                "Filtros por categoría y búsqueda por código",
                "Proveedores verificados por Rayana",
                "Actualizaciones mensuales incluidas",
                "Cancela cuando quieras",
              ].map((line) => (
                <li key={line} className="flex items-center gap-2.5 text-sm text-white/85">
                  <span className="text-accent">✓</span>
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 flex w-full items-center justify-center rounded-[14px] bg-accent py-4 text-center text-base font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/40"
            >
              Suscribirme ahora
            </Link>
            <p className="mt-4 text-center text-[11px] text-white/40">
              Sin reembolsos. Al suscribirte mantienes el acceso hasta el fin del período pagado.
              Pago seguro con Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-soft px-5 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="reveal mb-12 text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent">
              FAQ
            </span>
            <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold tracking-[-0.03em] text-navy">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ_ITEMS.map((item, i) => {
              const open = faqOpen === item.id;
              return (
                <div
                  key={item.id}
                  className={`reveal ${revealStagger(i)} overflow-hidden rounded-2xl border border-primary/10 bg-white`}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-bold text-navy transition hover:text-primary md:px-6"
                    onClick={() => setFaqOpen(open ? null : item.id)}
                    aria-expanded={open}
                  >
                    {item.q}
                    <span
                      className={`text-navy/40 transition-transform ${open ? "rotate-180" : ""}`}
                    >
                      ⌄
                    </span>
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="border-t border-primary/5 px-5 pb-5 text-sm leading-relaxed text-navy/55 md:px-6">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-navy/50">
            ¿Tienes otra pregunta?{" "}
            <a href="mailto:hola@makeray.cl" className="font-semibold text-primary hover:underline">
              hola@makeray.cl
            </a>
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-navy px-5 py-20 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background: "radial-gradient(ellipse, rgba(255,16,138,.12) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-[2] mx-auto max-w-3xl">
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-bold leading-tight tracking-[-0.03em] text-white">
            Tu negocio empieza aquí.
          </h2>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-[14px] bg-accent px-8 py-4 text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-accent/40"
          >
            Suscribirme — $19.990/mes →
          </Link>
          <p className="mt-4 text-sm text-white/40">cancela cuando quieras · pago seguro</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-navy px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-8 border-b border-white/10 pb-10 md:flex-row md:items-center md:justify-between">
            <MakerayLogo size="lg" invert href="/" />
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-white/45 transition hover:text-accent">
                Términos
              </a>
              <a href="#" className="text-white/45 transition hover:text-accent">
                Privacidad
              </a>
              <a href="mailto:hola@makeray.cl" className="text-white/45 transition hover:text-accent">
                Contacto
              </a>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 text-[12px] text-white/30 md:flex-row md:justify-between">
            <span>© 2026 Makeray</span>
            <span className="max-w-md md:text-right">
              El directorio de proveedores mayoristas de Rayana. Hecho en Chile, para
              emprendedoras chilenas.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
