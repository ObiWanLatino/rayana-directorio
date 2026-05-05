"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";

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

export default function LandingClient() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="bg-cream text-ink min-h-screen">
      <header
        className="fixed top-0 inset-x-0 z-50 border-b border-black/5"
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          background: "rgba(251,245,236,0.85)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link
            href="/"
            className="text-xl font-black tracking-tight"
            onClick={closeMobile}
          >
            Makeray
          </Link>
          <nav className="hidden items-center gap-1 text-[14px] font-medium text-ink/55 md:flex">
            <a
              href="#incluye"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-black/5 hover:text-ink"
            >
              ¿Qué incluye?
            </a>
            <a
              href="#categorias"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-black/5 hover:text-ink"
            >
              Categorías
            </a>
            <a
              href="#precio"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-black/5 hover:text-ink"
            >
              Precio
            </a>
            <a
              href="#faq"
              className="rounded-lg px-3 py-2 transition-colors hover:bg-black/5 hover:text-ink"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn-primary hidden rounded-full px-5 py-2.5 text-sm font-bold text-white sm:flex"
            >
              Suscribirme
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
              aria-expanded={mobileOpen}
              aria-label="Abrir menú"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="h-0.5 w-5 rounded-full bg-ink" />
              <span className="h-0.5 w-5 rounded-full bg-ink" />
              <span className="h-0.5 w-5 rounded-full bg-ink" />
            </button>
          </div>
        </div>
        <div
          className={`flex flex-col gap-1 border-t border-black/5 bg-cream/95 px-5 py-4 text-[15px] font-medium md:hidden ${mobileOpen ? "" : "hidden"}`}
        >
          <a href="#incluye" className="border-b border-black/5 py-3" onClick={closeMobile}>
            ¿Qué incluye?
          </a>
          <a href="#categorias" className="border-b border-black/5 py-3" onClick={closeMobile}>
            Categorías
          </a>
          <a href="#precio" className="border-b border-black/5 py-3" onClick={closeMobile}>
            Precio
          </a>
          <a href="#faq" className="py-3" onClick={closeMobile}>
            FAQ
          </a>
          <Link
            href="/login"
            className="btn-primary mt-2 rounded-2xl py-3 text-center font-bold text-white"
            onClick={closeMobile}
          >
            Suscribirme — $19.990/mes
          </Link>
        </div>
      </header>

      <section
        className="overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-32"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 70% -10%,#FBE9D6 0%,#FBF5EC 55%)",
        }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-8">
          <div className="order-2 lg:order-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-brand2 shadow-sm">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand/15 text-[8px]">
                ✦
              </span>
              por Rayana · @makeray.youtube
            </div>
            <h1 className="text-[46px] font-black leading-[1.0] tracking-tight sm:text-[58px] lg:text-[66px]">
              Los proveedores
              <br />
              que <span className="grad-text">cambiarán</span>
              <br />
              tu negocio.
            </h1>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink/55">
              <strong className="font-semibold text-ink">
                +75 proveedores mayoristas
              </strong>{" "}
              verificados por Rayana. Contacto directo por WhatsApp desde tu
              celular. Sin intermediarios.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-2 text-[15px] font-bold text-brand2">
              $19.990 CLP / mes
              <span className="text-[12px] font-medium text-brand2/55">
                · cancela cuando quieras
              </span>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="btn-primary flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-[16px] font-bold text-white"
              >
                Acceder ahora
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8H13M9 4L13 8L9 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <a
                href="#incluye"
                className="btn-secondary flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-[15px] font-semibold text-ink"
              >
                Ver qué incluye
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="#1A1208"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                <span
                  className="h-8 w-8 rounded-full ring-2 ring-cream"
                  style={{
                    background: "linear-gradient(135deg,#E8A88E,#C4763E)",
                  }}
                />
                <span
                  className="h-8 w-8 rounded-full ring-2 ring-cream"
                  style={{
                    background: "linear-gradient(135deg,#D4A373,#B98852)",
                  }}
                />
                <span
                  className="h-8 w-8 rounded-full ring-2 ring-cream"
                  style={{
                    background: "linear-gradient(135deg,#F2C7B0,#D88A6A)",
                  }}
                />
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[9px] font-black text-brand2 ring-2 ring-cream">
                  +500
                </span>
              </div>
              <span className="text-[13px] font-medium text-ink/45">
                Emprendedoras ya dentro
              </span>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="relative mx-auto max-w-[480px]">
              <div
                className="photo-box relative aspect-[4/5] overflow-hidden rounded-[28px]"
                style={{
                  boxShadow: "0 32px 64px -16px rgba(120,72,30,.25)",
                }}
              >
                <Image
                  src="/landing/foto-hero.jpg"
                  alt="Rayana — directorio Makeray"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
              </div>
              <div className="f1 absolute -left-4 top-12 hidden items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-[13px] font-semibold sm:flex card">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] text-white"
                  style={{
                    background: "linear-gradient(135deg,#C4763E,#A35E2A)",
                  }}
                >
                  ✓
                </span>
                Verificada por Rayana
              </div>
              <div className="f2 absolute -right-4 bottom-24 hidden items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-[13px] font-semibold sm:flex card">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: "#25D366" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="white" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                  </svg>
                </span>
                1 tap a WhatsApp
              </div>
              <div className="absolute -bottom-10 -right-6 w-[160px] sm:-right-10 sm:w-[190px]">
                <div className="phone-outer">
                  <div
                    className="phone-inner"
                    style={{ aspectRatio: "9 / 19.5" }}
                  >
                    <div className="notch" />
                    <div className="flex justify-between px-3 pt-2 text-[9px] font-bold">
                      <span>9:41</span>
                      <span>●●●</span>
                    </div>
                    <div className="px-2.5 pt-4">
                      <div className="mb-1.5 font-black text-[12px]">Directorio</div>
                      <div className="mb-2 flex h-6 items-center gap-1 rounded-full bg-black/5 px-2 text-[9px] text-ink/40">
                        <svg width="8" height="8" viewBox="0 0 16 16" fill="none" aria-hidden>
                          <circle cx="7" cy="7" r="5" stroke="#1A1208" strokeWidth="2" opacity=".4" />
                          <path d="M11 11L14 14" stroke="#1A1208" strokeWidth="2" strokeLinecap="round" opacity=".4" />
                        </svg>
                        Buscar #47…
                      </div>
                      <div className="card rounded-xl p-2">
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[8px] font-black text-white"
                            style={{
                              background: "linear-gradient(135deg,#D88A6A,#C4763E)",
                            }}
                          >
                            #47
                          </span>
                          <span className="text-[7px] text-ink/40">moda</span>
                        </div>
                        <div className="photo-box mb-1 rounded-lg text-[6px]" style={{ height: 44 }}>
                          foto
                        </div>
                        <div className="mb-0.5 font-bold text-[9px]">Atelier Rosé</div>
                        <button
                          type="button"
                          className="flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-[8px] font-bold text-white"
                          style={{ background: "#25D366" }}
                        >
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white" aria-hidden>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                          </svg>
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-ink py-6 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-5 md:gap-16">
          <div className="text-center">
            <div className="text-3xl font-black text-brand3">75+</div>
            <div className="mt-0.5 text-sm font-medium text-white/45">Proveedores</div>
          </div>
          <div className="hidden h-8 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-brand3">8</div>
            <div className="mt-0.5 text-sm font-medium text-white/45">Categorías</div>
          </div>
          <div className="hidden h-8 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-brand3">1 tap</div>
            <div className="mt-0.5 text-sm font-medium text-white/45">a WhatsApp</div>
          </div>
          <div className="hidden h-8 w-px bg-white/10 md:block" />
          <div className="text-center">
            <div className="text-3xl font-black text-brand3">100%</div>
            <div className="mt-0.5 text-sm font-medium text-white/45">Verificados</div>
          </div>
        </div>
      </div>

      <div className="border-b border-black/5 bg-white py-4">
        <div className="mx-auto max-w-6xl px-5">
          <div className="no-scroll flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 text-[11px] font-black tracking-widest text-ink/25 uppercase">
              CATEGORÍAS
            </span>
            <div className="h-4 w-px shrink-0 bg-black/10" />
            <div className="flex shrink-0 gap-2">
              {[
                "👗 Moda Femenina",
                "💍 Joyas",
                "🏠 Deco Hogar",
                "👖 Jeans",
                "💄 Cosméticos",
                "👜 Accesorios",
                "👶 Infantil",
              ].map((label) => (
                <span
                  key={label}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-brand/12 bg-cream px-3 py-1.5 text-[13px] font-medium whitespace-nowrap"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section id="incluye" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              QUÉ INCLUYE
            </div>
            <h2 className="text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              Todo lo que necesitas
              <br />
              en un solo lugar.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="card p-7 transition-shadow hover:shadow-lg">
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "linear-gradient(135deg,#F2C7B0,#C4763E)" }}
              >
                📋
              </div>
              <h3 className="mb-2 text-[20px] font-black leading-tight">
                75+ Proveedores Verificados
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/50">
                Moda, joyas, deco hogar, jeans y más. Curados personalmente por
                Rayana.
              </p>
            </div>
            <div
              className="card p-7 transition-shadow hover:shadow-lg"
              style={{ transform: "translateY(8px)" }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "linear-gradient(135deg,#A8E6CF,#25D366)" }}
              >
                💬
              </div>
              <h3 className="mb-2 text-[20px] font-black leading-tight">
                Directo a WhatsApp
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/50">
                Un tap y estás hablando con el proveedor con mensaje listo para
                enviar. Sin intermediarios.
              </p>
            </div>
            <div className="card p-7 transition-shadow hover:shadow-lg">
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "linear-gradient(135deg,#FBE9D6,#E8A88E)" }}
              >
                🔄
              </div>
              <h3 className="mb-2 text-[20px] font-black leading-tight">
                Siempre Actualizado
              </h3>
              <p className="text-[15px] leading-relaxed text-ink/50">
                Rayana agrega nuevos proveedores cada mes. Siempre tendrás
                contactos frescos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28" style={{ background: "#F5EDE0" }}>
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              CÓMO FUNCIONA
            </div>
            <h2 className="text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              Así de simple.
            </h2>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            <div
              className="absolute top-8 right-[calc(16%+24px)] left-[calc(16%+24px)] hidden h-0.5 md:block"
              style={{
                background:
                  "repeating-linear-gradient(90deg,#C4763E 0 6px,transparent 6px 14px)",
              }}
            />
            {[
              {
                n: "1",
                t: "Suscríbete",
                d: "Elige tu plan mensual. Pago seguro con Stripe y acceso al instante.",
              },
              {
                n: "2",
                t: "Explora el directorio",
                d: "Busca por categoría, nombre o código. +75 proveedores a tu disposición.",
              },
              {
                n: "3",
                t: "Contacta directo",
                d: "Toca WhatsApp y habla con el proveedor. Mensaje pre-escrito incluido.",
              },
            ].map((step) => (
              <div key={step.n}>
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full text-[28px] font-black text-white"
                  style={{
                    background: "linear-gradient(180deg,#D88A6A,#A35E2A)",
                    boxShadow: "0 8px 20px -4px rgba(163,94,42,.4)",
                  }}
                >
                  {step.n}
                </div>
                <h3 className="mb-2 text-[22px] font-black">{step.t}</h3>
                <p className="text-[15px] leading-relaxed text-ink/50">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
          <div>
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              EN TU BOLSILLO
            </div>
            <h2 className="mb-6 text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              Diseñado para usar
              <br />
              desde tu celular.
            </h2>
            <p className="mb-8 max-w-md text-[16px] leading-relaxed text-ink/50">
              Estés donde estés — en una feria, revisando stock, con clientas —
              el directorio entero cabe en tu bolsillo.
            </p>
            <div className="grid max-w-md grid-cols-2 gap-3">
              {[
                {
                  id: "code",
                  icon: "🔍",
                  text: (
                    <>
                      Busca por código{" "}
                      <span className="font-bold text-brand">#47</span>
                    </>
                  ),
                },
                { id: "wa", icon: "💬", text: "WhatsApp con un tap" },
                { id: "ver", icon: "⭐", text: "Proveedores verificados" },
                { id: "cat", icon: "📂", text: "Filtros por categoría" },
              ].map((item) => (
                <div key={item.id} className="card flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream text-lg">
                    {item.icon}
                  </span>
                  <span className="text-[13px] font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <div className="phone-outer w-[260px]">
              <div className="phone-inner" style={{ aspectRatio: "9 / 19.5" }}>
                <div className="notch" />
                <div className="flex justify-between px-4 pt-3 text-[11px] font-bold">
                  <span>9:41</span>
                  <span>●●●</span>
                </div>
                <div className="px-4 pt-5">
                  <div className="mb-2 font-black text-[17px]">Directorio</div>
                  <div className="mb-3 flex h-8 items-center gap-2 rounded-full bg-black/5 px-3 text-[11px] text-ink/35">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <circle cx="7" cy="7" r="5" stroke="#1A1208" strokeWidth="2" opacity=".4" />
                      <path d="M11 11L14 14" stroke="#1A1208" strokeWidth="2" strokeLinecap="round" opacity=".4" />
                    </svg>
                    Buscar por código…
                  </div>
                  <div className="card mb-2 rounded-2xl p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-black text-white"
                        style={{
                          background: "linear-gradient(135deg,#D88A6A,#C4763E)",
                        }}
                      >
                        #47
                      </span>
                      <div
                        className="h-7 w-7 shrink-0 rounded-full"
                        style={{
                          background: "linear-gradient(135deg,#E8A88E,#C4763E)",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold">Atelier Rosé</div>
                        <div className="text-[10px] text-ink/40">Moda femenina</div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ background: "#25D366" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                        </svg>
                      </span>
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{
                          background: "linear-gradient(45deg,#f09433,#dc2743)",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden>
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </span>
                      <span
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ background: "#4285F4" }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white" aria-hidden>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="card mb-1.5 flex items-center gap-2 rounded-xl p-2.5">
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black text-white"
                      style={{
                        background: "linear-gradient(135deg,#D88A6A,#C4763E)",
                      }}
                    >
                      #48
                    </span>
                    <div
                      className="h-5 w-5 shrink-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg,#B8C8A8,#5A7A3C)",
                      }}
                    />
                    <span className="flex-1 truncate text-[11px] font-semibold">
                      Joyería Maipú
                    </span>
                    <span
                      className="h-5 w-5 shrink-0 rounded-full opacity-30"
                      style={{ background: "#25D366" }}
                    />
                  </div>
                  <div className="card flex items-center gap-2 rounded-xl p-2.5">
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black text-white"
                      style={{
                        background: "linear-gradient(135deg,#D88A6A,#C4763E)",
                      }}
                    >
                      #49
                    </span>
                    <div
                      className="h-5 w-5 shrink-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg,#C8C0A8,#8B7A3C)",
                      }}
                    />
                    <span className="flex-1 truncate text-[11px] font-semibold">
                      Deco Lo Espejo
                    </span>
                    <span
                      className="h-5 w-5 shrink-0 rounded-full opacity-30"
                      style={{ background: "#25D366" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categorias" className="py-20 lg:py-28" style={{ background: "#F5EDE0" }}>
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              CATEGORÍAS
            </div>
            <h2 className="text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              ¿Qué tipo de proveedores encontrarás?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { icon: "👗", name: "Moda Femenina", n: "38", sub: "38 proveedores" },
              { icon: "💍", name: "Joyas", n: "6", sub: "6 proveedores" },
              { icon: "🏠", name: "Deco Hogar", n: "5", sub: "5 proveedores" },
              { icon: "👖", name: "Jeans", n: "5", sub: "5 proveedores" },
              { icon: "💄", name: "Cosméticos", n: "3", sub: "3 proveedores" },
              { icon: "👜", name: "Accesorios", n: "4", sub: "4 proveedores" },
              { icon: "👶", name: "Infantil", n: "2", sub: "2 proveedores" },
              { icon: "🏭", name: "Importadoras", n: "2", sub: "2 proveedores" },
            ].map((c) => (
              <div key={c.name} className="card flex flex-col gap-3 p-5 transition-shadow hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-2xl">
                    {c.icon}
                  </span>
                  <span className="text-[11px] font-black text-brand">{c.n}</span>
                </div>
                <div>
                  <div className="text-[16px] font-bold">{c.name}</div>
                  <div className="mt-0.5 text-[12px] text-ink/35">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div
              className="photo-box relative aspect-[4/5] overflow-hidden rounded-[24px]"
              style={{
                background: "#2A1F14",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Image
                src="/landing/foto-rayana.jpg"
                alt="Rayana"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div
              className="absolute -bottom-4 left-4 flex items-center gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "#1F1510",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg,#FF3B3B,#C4763E)",
                }}
              >
                <svg width="14" height="10" viewBox="0 0 16 12" fill="white" aria-hidden>
                  <path d="M15.5 2.4c-.2-.7-.7-1.2-1.4-1.4C12.8.7 8 .7 8 .7s-4.8 0-6.1.3C1.2 1.2.7 1.7.5 2.4.2 3.6.2 6 .2 6s0 2.4.3 3.6c.2.7.7 1.2 1.4 1.4 1.3.3 6.1.3 6.1.3s4.8 0 6.1-.3c.7-.2 1.2-.7 1.4-1.4.3-1.2.3-3.6.3-3.6s0-2.4-.3-3.6zM6.4 8.3V3.7L10.4 6 6.4 8.3z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] text-white/35">YouTube</div>
                <div className="text-[13px] font-bold">@makeray.youtube</div>
              </div>
            </div>
            <div
              className="absolute -top-4 right-4 rounded-2xl px-4 py-3 text-center"
              style={{
                background: "#1F1510",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-[10px] text-white/35">curados por mí</div>
              <div className="text-[24px] font-black text-brand3">75+</div>
            </div>
          </div>
          <div>
            <div className="mb-4 text-[11px] font-black tracking-widest text-brand3 uppercase">
              ✦ LA CURADORA
            </div>
            <h2 className="mb-6 text-[44px] font-black leading-tight tracking-tight lg:text-[60px]">
              Soy Rayana.
            </h2>
            <div className="max-w-xl space-y-4 text-[17px] leading-relaxed text-white/55">
              <p>
                Llevo{" "}
                <strong className="font-semibold text-white">
                  años construyendo relaciones
                </strong>{" "}
                con proveedores mayoristas en Chile. Este directorio es el
                resultado de ese trabajo.
              </p>
              <p>
                Cada contacto está verificado{" "}
                <strong className="font-semibold text-white">
                  personalmente por mí
                </strong>{" "}
                — para que tú no pierdas tiempo buscando, ni te quemes con
                proveedores que no responden.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="precio" className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              PRECIO
            </div>
            <h2 className="text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              Acceso completo.
            </h2>
          </div>
          <div className="mx-auto max-w-md">
            <div className="card p-8 lg:p-10">
              <div className="mb-3 text-[12px] font-black tracking-widest text-ink/35 uppercase">
                Directorio Makeray
              </div>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-[52px] font-black leading-none">$19.990</span>
                <span className="text-[17px] font-medium text-ink/35">/mes</span>
              </div>
              <div className="mb-8 space-y-3">
                {[
                  "Acceso a +75 proveedores",
                  "Contacto directo por WhatsApp",
                  "Filtros por categoría y búsqueda por código",
                  "Proveedores verificados por Rayana",
                  "Actualizaciones mensuales incluidas",
                  "Cancela cuando quieras",
                ].map((line) => (
                  <div key={line} className="flex items-center gap-3 text-[15px]">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#D88A6A,#C4763E)",
                      }}
                    >
                      ✓
                    </span>
                    {line}
                  </div>
                ))}
              </div>
              <Link
                href="/login"
                className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[16px] font-bold text-white"
              >
                Suscribirme ahora
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M3 8H13M9 4L13 8L9 12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <p className="mt-4 text-center text-[12px] text-ink/35">
                Sin reembolsos. Al suscribirte mantienes el acceso hasta el fin
                del período pagado. Pago seguro con Stripe.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 lg:py-28" style={{ background: "#F5EDE0" }}>
        <div className="mx-auto max-w-6xl px-5">
          <div className="mb-14 max-w-2xl">
            <div className="mb-3 text-[11px] font-black tracking-widest text-brand uppercase">
              FAQ
            </div>
            <h2 className="text-[38px] font-black leading-tight tracking-tight lg:text-[52px]">
              Preguntas frecuentes.
            </h2>
          </div>
          <div className="max-w-3xl space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.id}
                name="faq"
                className="faq-item card overflow-hidden"
              >
                <summary className="flex items-center justify-between gap-4 px-6 py-5">
                  <span className="text-[16px] font-bold">{item.q}</span>
                  <span className="chev flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="#C4763E"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </summary>
                <div className="border-t border-black/5 px-6 pt-4 pb-5 text-[15px] leading-relaxed text-ink/50">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-8 max-w-3xl text-[14px] text-ink/40">
            ¿Tienes otra pregunta?{" "}
            <a href="mailto:hola@makeray.cl" className="font-semibold text-brand hover:underline">
              hola@makeray.cl
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div
            className="relative overflow-hidden rounded-[28px] p-10 lg:p-16"
            style={{
              background:
                "linear-gradient(135deg,#1A1208 0%,#2A1F14 50%,#1A1208 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 80% 50%,#E8A88E,transparent)",
              }}
            />
            <div className="relative max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-semibold text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Acceso inmediato
              </div>
              <h2 className="mb-5 text-[42px] font-black leading-tight tracking-tight text-white lg:text-[62px]">
                Tu negocio
                <br />
                empieza aquí.
              </h2>
              <p className="mb-8 max-w-lg text-[17px] leading-relaxed text-white/50">
                Únete a cientos de emprendedoras que ya tienen acceso a los
                mejores proveedores mayoristas de Chile.
              </p>
              <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="btn-primary flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-[16px] font-bold text-white"
                >
                  Suscribirme — $19.990/mes
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path
                      d="M3 8H13M9 4L13 8L9 12"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
                <span className="text-center text-[13px] text-white/30 sm:text-left">
                  cancela cuando quieras · pago seguro
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-ink py-14 text-white/45">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-3 text-[22px] font-black text-white">Makeray</div>
            <p className="max-w-sm text-[14px] leading-relaxed">
              El directorio de proveedores mayoristas de Rayana. Hecho en Chile,
              para emprendedoras chilenas.
            </p>
          </div>
          <div>
            <div className="mb-4 text-[11px] font-black tracking-widest text-white/25 uppercase">
              Producto
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a href="#incluye" className="transition-colors hover:text-white">
                  ¿Qué incluye?
                </a>
              </li>
              <li>
                <a href="#categorias" className="transition-colors hover:text-white">
                  Categorías
                </a>
              </li>
              <li>
                <a href="#precio" className="transition-colors hover:text-white">
                  Precio
                </a>
              </li>
              <li>
                <a href="#faq" className="transition-colors hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="mb-4 text-[11px] font-black tracking-widest text-white/25 uppercase">
              Legal
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Términos
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="mailto:hola@makeray.cl" className="transition-colors hover:text-white">
                  Contacto
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-white/5 px-5 pt-6 text-[13px] sm:flex-row">
          <span>© 2026 Makeray. Todos los derechos reservados.</span>
          <span className="text-white/15">hecho en Santiago de Chile</span>
        </div>
      </footer>
    </div>
  );
}
