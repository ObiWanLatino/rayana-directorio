import { IconSearch } from "@/components/suppliers/directory-icons";

type ProveedoresEmptyStateProps = {
  onClear: () => void;
};

export function ProveedoresEmptyState({ onClear }: ProveedoresEmptyStateProps) {
  return (
    <div className="px-6 py-10 text-center">
      <div
        className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px]"
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F5EDE0 100%)",
          boxShadow:
            "10px 10px 22px rgba(120,90,60,.10), -5px -5px 16px rgba(255,255,255,.95), inset 0 1px 0 rgba(255,255,255,.95)",
        }}
      >
        <IconSearch size={38} color="#C9A37C" />
      </div>
      <div
        className="mt-5 text-lg font-bold tracking-tight"
        style={{ color: "#2B2B2B" }}
      >
        No encontramos proveedores
      </div>
      <p
        className="mx-auto mt-1.5 max-w-[280px] text-[13.5px] leading-normal"
        style={{ color: "#7A7A7A" }}
      >
        con ese código o nombre. Prueba con otra categoría o revisa los filtros.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 cursor-pointer rounded-[14px] border-2 bg-transparent px-6 py-2.5 text-[13.5px] font-bold"
        style={{ borderColor: "#D4A373", color: "#B98852" }}
      >
        Limpiar búsqueda
      </button>
    </div>
  );
}
