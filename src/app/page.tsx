import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="font-semibold text-zinc-900">Rayana</span>
          <nav className="flex gap-4 text-sm">
            <Link
              href="/login"
              className="font-medium text-zinc-700 hover:text-zinc-900"
            >
              Iniciar sesión
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-12 sm:py-20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Plataforma Rayana
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600">
            Directorio de proveedores, fabricantes y cursos en una sola
            suscripción. Comienza creando tu cuenta o iniciando sesión.
          </p>
        </div>
        <div>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-zinc-900 px-8 py-3 text-sm font-medium text-white hover:bg-zinc-800 active:scale-[0.98]"
          >
            Comenzar
          </Link>
        </div>
      </main>
    </div>
  );
}
