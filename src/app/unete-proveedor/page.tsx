import Link from "next/link";

export default function UneteProveedorPage() {
  return (
    <div className="min-h-screen bg-off px-4 py-16 text-navy">
      <div className="mx-auto max-w-2xl rounded-3xl border border-primary/12 bg-white p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Makeray proveedores
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Sumá tu tienda al directorio Pro
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-navy/65">
          Las emprendedoras Makeray ya buscan proveedores en un solo lugar. Creá tu perfil
          con bio, envíos, catálogo digital y ofertas flash. Medimos visitas y clics en
          WhatsApp para que veas resultados reales.
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-navy/70">
          <li>Planes Básico, Vitrina y Pro con Lemon Squeezy</li>
          <li>Badge automático según interacción y reseñas verificadas</li>
          <li>Panel con analytics de 30 días</li>
        </ul>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login?next=/proveedor/onboarding"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-primary px-6 text-sm font-bold text-white"
          >
            Crear mi perfil proveedor
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-primary/25 px-6 text-sm font-bold text-primary"
          >
            Volver al inicio
          </Link>
        </div>
        <p className="mt-6 text-xs text-navy/45">
          Nota: el directorio para suscriptoras sigue en{" "}
          <Link href="/directorio" className="font-semibold text-primary underline">
            /directorio
          </Link>
          . Esta página es la convocatoria pública para nuevos proveedores.
        </p>
      </div>
    </div>
  );
}
