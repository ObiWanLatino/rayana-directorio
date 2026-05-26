"use client";

import type { Categoria } from "@/types/categories";
import { useEffect, useState } from "react";

/** Conteos de referencia para la landing (hasta conectar conteo dinámico). */
export const CATEGORIA_CONTEOS: Record<string, number> = {
  "Moda Femenina": 38,
  Joyas: 6,
  "Joyas y Bisutería": 6,
  "Deco Hogar": 5,
  Jeans: 5,
  Cosméticos: 3,
  "Cosmética y Maquillaje": 3,
  Accesorios: 4,
  "Carteras y accesorios": 4,
  Infantil: 2,
  "Moda Infantil": 2,
  Importadoras: 2,
};

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/categories", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: Categoria[] | { error?: string }) => {
        setCategorias(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategorias([]))
      .finally(() => setLoading(false));
  }, []);

  return { categorias, loading, conteos: CATEGORIA_CONTEOS };
}
