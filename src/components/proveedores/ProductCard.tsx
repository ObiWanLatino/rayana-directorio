import type { SupplierProduct } from "@/types/proveedores";

export function ProductCard({ product }: { product: SupplierProduct }) {
  const mayor = product.precio_mayorista;
  const unit = product.precio_clp;
  return (
    <article className="rounded-2xl border border-primary/12 bg-white p-4">
      {product.foto_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.foto_url}
          alt=""
          className="mb-3 h-36 w-full rounded-xl object-cover"
        />
      ) : null}
      <h3 className="font-semibold text-navy">{product.nombre}</h3>
      {product.descripcion ? (
        <p className="mt-1 line-clamp-2 text-sm text-navy/55">{product.descripcion}</p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        {mayor != null ? (
          <span className="font-bold text-primary">
            ${mayor.toLocaleString("es-CL")} mayorista
          </span>
        ) : null}
        {unit != null ? (
          <span className="text-navy/50">${unit.toLocaleString("es-CL")} unit.</span>
        ) : null}
      </div>
      {product.minimo_unidades > 1 ? (
        <p className="mt-1 text-xs text-navy/45">
          Mínimo {product.minimo_unidades} u.
        </p>
      ) : null}
    </article>
  );
}
