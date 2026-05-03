import Link from "next/link";

export default function CursosPlaceholderPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <Link
          href="/hub"
          className="text-sm text-zinc-500 underline hover:text-zinc-700"
        >
          ← Hub
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">
          Cursos educativos
        </h1>
        <p className="mt-2 text-sm text-zinc-600">Módulo disponible próximamente.</p>
      </div>
    </div>
  );
}
