import type { Metadata } from "next";
import HomeLandingClient from "./home-landing-client";

export const metadata: Metadata = {
  title: "Makeray — Los proveedores que cambiarán tu negocio",
  description:
    "Directorio de proveedores mayoristas verificados por Rayana. + 1000 proveedores. Contacto directo por WhatsApp desde tu celular.",
};

export default function Home() {
  return <HomeLandingClient />;
}
