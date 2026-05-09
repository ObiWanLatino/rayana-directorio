"use client";

type SearchBarProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  id,
  value,
  onChange,
  placeholder = "Buscar por código #47 o nombre…",
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-white px-4 py-3 shadow-sm shadow-primary/5">
      <svg
        width="18"
        height="18"
        viewBox="0 0 16 16"
        fill="none"
        className="shrink-0 text-primary/50"
        aria-hidden
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M11 11L14 14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <input
        id={id}
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-navy outline-none placeholder:text-navy/40"
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy/70 transition-colors hover:bg-navy/15"
          onClick={() => onChange("")}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
