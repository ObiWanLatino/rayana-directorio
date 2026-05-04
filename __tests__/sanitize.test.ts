import { describe, expect, test } from "vitest";
import { sanitizeInstagram, sanitizeWhatsapp } from "@/lib/utils/sanitize";

describe("sanitizeInstagram", () => {
  test("quita @ inicial", () => {
    expect(sanitizeInstagram("@donpapito.cl")).toBe("donpapito.cl");
  });
  test("quita @ con punto y guion bajo", () => {
    expect(sanitizeInstagram("@_heaven.mayoristas_")).toBe("_heaven.mayoristas_");
  });
  test("quita URL completa (defensa futura)", () => {
    expect(sanitizeInstagram("https://instagram.com/usuario/")).toBe("usuario");
  });
  test("quita URL con www (defensa futura)", () => {
    expect(sanitizeInstagram("https://www.instagram.com/usuario")).toBe("usuario");
  });
  test("retorna null si vacío", () => {
    expect(sanitizeInstagram("")).toBeNull();
  });
  test("retorna null si undefined", () => {
    expect(sanitizeInstagram(undefined)).toBeNull();
  });
});

describe("sanitizeWhatsapp", () => {
  test("limpia formato chileno", () => {
    expect(sanitizeWhatsapp("+56 9 1234-5678")).toBe("56912345678");
  });
  test("deja solo dígitos", () => {
    expect(sanitizeWhatsapp("56912345678")).toBe("56912345678");
  });
  test("número local sin prefijo país", () => {
    expect(sanitizeWhatsapp("9 1234 5678")).toBe("56912345678");
  });
  test("retorna null si NaN", () => {
    expect(sanitizeWhatsapp(Number.NaN)).toBeNull();
  });
  test("retorna null si null", () => {
    expect(sanitizeWhatsapp(null)).toBeNull();
  });
  test("retorna null si string vacío", () => {
    expect(sanitizeWhatsapp("")).toBeNull();
  });
  test("maneja number de pandas", () => {
    expect(sanitizeWhatsapp(56_912_345_678)).toBe("56912345678");
  });
});
