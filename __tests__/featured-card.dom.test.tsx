import { FeaturedSupplierCard } from "@/components/suppliers/FeaturedSupplierCard";
import type { Supplier } from "@/types";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

function baseSupplier(over: Partial<Supplier>): Supplier {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    codigo: 1,
    tienda: "Test Shop",
    instagram: null,
    instagram_url: null,
    tiktok_url: null,
    maps_url: null,
    categoria: "Cat",
    direccion: null,
    tipo: "x",
    observacion: null,
    whatsapp: "56912345678",
    logo_url: null,
    cover_url: null,
    cover_height: 128,
    destacado: true,
    verificado: false,
    foto_1_url: null,
    foto_2_url: null,
    foto_3_url: null,
    activo: true,
    pais_codigo: "56",
    created_at: "",
    updated_at: "",
    ...over,
  };
}

afterEach(() => {
  cleanup();
});

describe("FeaturedSupplierCard", () => {
  test("1 foto: sin flechas ni puntos", () => {
    render(
      <FeaturedSupplierCard
        supplier={baseSupplier({
          foto_1_url: "https://ex.com/a.jpg",
          foto_2_url: null,
          foto_3_url: null,
        })}
      />,
    );
    expect(screen.queryByLabelText("Foto anterior")).toBeNull();
    expect(screen.queryByTestId("featured-dot-0")).toBeNull();
  });

  test("2+ fotos: flechas y puntos visibles", () => {
    render(
      <FeaturedSupplierCard
        supplier={baseSupplier({
          foto_1_url: "https://ex.com/1.jpg",
          foto_2_url: "https://ex.com/2.jpg",
          foto_3_url: null,
        })}
      />,
    );
    expect(screen.getByLabelText("Foto anterior")).toBeTruthy();
    expect(screen.getByTestId("featured-dot-0")).toBeTruthy();
    expect(screen.getByTestId("featured-dot-1")).toBeTruthy();
  });

  test("photoIndex cicla con las flechas (0→1→2→0)", () => {
    const { container } = render(
      <FeaturedSupplierCard
        supplier={baseSupplier({
          foto_1_url: "https://ex.com/1.jpg",
          foto_2_url: "https://ex.com/2.jpg",
          foto_3_url: "https://ex.com/3.jpg",
        })}
      />,
    );
    const img = () => container.querySelector("article img");
    expect(img()?.getAttribute("src")).toBe("https://ex.com/1.jpg");

    fireEvent.click(screen.getByLabelText("Foto siguiente"));
    expect(img()?.getAttribute("src")).toBe("https://ex.com/2.jpg");
    fireEvent.click(screen.getByLabelText("Foto siguiente"));
    expect(img()?.getAttribute("src")).toBe("https://ex.com/3.jpg");
    fireEvent.click(screen.getByLabelText("Foto siguiente"));
    expect(img()?.getAttribute("src")).toBe("https://ex.com/1.jpg");
    fireEvent.click(screen.getByLabelText("Foto anterior"));
    expect(img()?.getAttribute("src")).toBe("https://ex.com/3.jpg");
  });

  test("sin fotos: muestra avatar (sin img)", () => {
    const { container } = render(
      <FeaturedSupplierCard
        supplier={baseSupplier({
          foto_1_url: null,
          foto_2_url: null,
          foto_3_url: null,
        })}
      />,
    );
    expect(container.querySelector("article img")).toBeNull();
    expect(container.textContent).toContain("TS");
  });
});
