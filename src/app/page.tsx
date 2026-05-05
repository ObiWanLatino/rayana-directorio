import LandingClient from "@/app/landing-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Makeray — Los proveedores que cambiarán tu negocio",
  description:
    "Directorio de proveedores mayoristas verificados por Rayana. Contacto directo por WhatsApp, +75 proveedores.",
};

export default function Home() {
  return <LandingClient />;
}
