import { supplierInitial } from "@/components/suppliers/supplier-utils";
import { BookOpen, CheckCircle, MessageCircle, Star } from "lucide-react";

export type FeaturedCardPreviewProps = {
  tienda: string;
  categoria?: string;
  direccion?: string;
  verificado: boolean;
  logoUrl: string | null;
  coverUrl: string | null;
  foto1Url: string | null;
  foto2Url: string | null;
  foto3Url: string | null;
  /** Si se omite, solo se muestra el botón WA en preview. */
  showCatalog?: boolean;
  whatsappUrl?: string | null;
};

export function FeaturedCardPreview({
  tienda,
  categoria = "",
  direccion = "",
  verificado,
  logoUrl,
  coverUrl,
  foto1Url,
  foto2Url,
  foto3Url,
  showCatalog = true,
  whatsappUrl = null,
}: FeaturedCardPreviewProps) {
  const initials = supplierInitial(tienda || "?");
  const metaParts = [categoria?.trim(), direccion?.trim()].filter(Boolean);
  const metaLine = metaParts.length > 0 ? metaParts.join(" · ") : "—";
  const hasPhotos = Boolean(foto1Url || foto2Url || foto3Url);
  const photoUrls = [foto1Url, foto2Url, foto3Url];

  return (
    <article className="relative flex flex-col overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm">
      <div className="relative h-32 w-full bg-gradient-to-br from-[#23153c] to-indigo-600">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
          <Star className="h-3 w-3 fill-yellow-900" aria-hidden />
          Destacado
        </div>
      </div>

      <div className="relative z-10 -mt-8 mb-2 ml-5 h-16 w-16 rounded-xl bg-white p-1 shadow-md">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-indigo-100 text-xl font-bold text-indigo-700">
            {initials}
          </div>
        )}
      </div>

      <h3 className="flex items-center gap-1 px-5 text-lg font-bold text-gray-900">
        {tienda || "Nombre del proveedor"}
        {verificado ? (
          <CheckCircle
            className="h-3.5 w-3.5 fill-blue-50 text-blue-500"
            aria-hidden
          />
        ) : null}
      </h3>
      <p className="mb-4 px-5 text-xs text-gray-500">{metaLine}</p>

      {hasPhotos ? (
        <div className="mb-4 flex gap-2 px-5">
          {photoUrls.map((url, i) =>
            url ? (
              <div
                key={i}
                className="aspect-square flex-1 overflow-hidden rounded-lg border border-gray-100 bg-gray-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null,
          )}
        </div>
      ) : null}

      <div className="mt-auto grid grid-cols-2 gap-2 px-5 pb-5">
        {showCatalog ? (
          <div className="flex items-center justify-center gap-1 rounded-lg border border-gray-200 py-2 px-3 text-sm font-medium text-gray-700">
            <BookOpen className="h-4 w-4" aria-hidden />
            Catálogo
          </div>
        ) : null}
        {whatsappUrl ? (
          <div
            className={`flex items-center justify-center gap-1 rounded-lg bg-[#25D366] py-2 px-3 text-sm font-medium text-white ${
              !showCatalog ? "col-span-2" : ""
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Contactar
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-1 rounded-lg bg-gray-200 py-2 px-3 text-sm font-medium text-gray-500 ${
              !showCatalog ? "col-span-2" : ""
            }`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Contactar
          </div>
        )}
      </div>
    </article>
  );
}
