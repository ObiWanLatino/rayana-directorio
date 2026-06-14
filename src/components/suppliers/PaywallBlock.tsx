"use client";

import { ProviderCard, type ProviderCardProvider } from "@/components/ProviderCard";
import { SIGNUP_URL } from "@/lib/directorio/constants";
import { Lock } from "lucide-react";
import Link from "next/link";

/** Datos ficticios — no exponen el listado protegido. */
const MOCK_BLUR_CARDS: ProviderCardProvider[] = [
  {
    id: "mock-1",
    code: "#1001",
    name: "Moda Mayorista Demo",
    category: "Moda Femenina",
    subcategory: "Ropa",
    location: "Santiago",
    whatsappUrl: "",
    verified: true,
  },
  {
    id: "mock-2",
    code: "#1002",
    name: "Joyas & Accesorios Demo",
    category: "Joyas",
    location: "Valparaíso",
    whatsappUrl: "",
    verified: false,
  },
  {
    id: "mock-3",
    code: "#1003",
    name: "Importadora Demo",
    category: "Importadoras",
    subcategory: "Mayorista",
    location: "São Paulo",
    whatsappUrl: "",
    verified: true,
  },
  {
    id: "mock-4",
    code: "#1004",
    name: "Cosméticos Demo",
    category: "Cosméticos",
    location: "Concepción",
    whatsappUrl: "",
    verified: false,
  },
];

export function PaywallBlock() {
  return (
    <div id="directorio-todos" className="relative mt-2 min-h-[420px]">
      <div
        className="pointer-events-none grid grid-cols-1 gap-4 opacity-50 sm:grid-cols-2"
        style={{
          filter: "blur(4px)",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        }}
        aria-hidden
      >
        {MOCK_BLUR_CARDS.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center px-4 py-10">
        <div className="max-w-md rounded-[24px] border border-primary/15 bg-white/95 px-8 py-10 text-center shadow-xl shadow-primary/10 backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#23153c]/10">
            <Lock className="h-7 w-7 text-[#23153c]" aria-hidden />
          </div>
          <h2 className="font-display text-xl font-bold text-navy">
            Accede al directorio completo de proveedores
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy/65">
            Más de 1.000 proveedores verificados en Chile y Brasil, con contacto
            directo por WhatsApp.
          </p>
          <Link
            href={SIGNUP_URL}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#23153c] px-6 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-95"
          >
            Suscribirme ahora →
          </Link>
          <p className="mt-4 text-sm text-navy/55">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/checkout"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
