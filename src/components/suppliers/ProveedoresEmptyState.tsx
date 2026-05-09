type ProveedoresEmptyStateProps = {
  onClear: () => void;
  query?: string;
};

export function ProveedoresEmptyState({
  onClear,
  query,
}: ProveedoresEmptyStateProps) {
  return (
    <div className="rounded-[20px] border border-primary/10 bg-white px-6 py-12 text-center">
      <div className="text-4xl" aria-hidden>
        🔍
      </div>
      <p className="mt-4 font-display text-lg font-bold tracking-tight text-navy">
        No encontramos proveedores
        {query ? (
          <>
            {" "}
            para &ldquo;{query}&rdquo;
          </>
        ) : null}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-navy/55">
        Intenta con otro código o nombre
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 rounded-xl border-2 border-primary/25 px-6 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-soft"
      >
        Limpiar búsqueda
      </button>
    </div>
  );
}
