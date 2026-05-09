import { expect, test } from "@playwright/test";

test.describe("humo público", () => {
  test("la portada carga y muestra Makeray", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Makeray/i);
    await expect(
      page.getByRole("heading", { name: /Los proveedores/i }),
    ).toBeVisible();
  });

  test("login muestra el formulario", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Iniciar sesión|Crear cuenta/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Continuar con Google/i }),
    ).toBeVisible();
  });

  test("hub redirige a login sin sesión", async ({ page }) => {
    await page.goto("/hub");
    await expect(page).toHaveURL(/\/login/);
  });

  test("proveedores responde 308 a directorio", async ({ request }) => {
    const res = await request.get("/proveedores", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    const loc = res.headers()["location"] ?? "";
    expect(loc).toContain("/directorio");
  });

  test("proveedores → directorio → login sin sesión", async ({ page }) => {
    await page.goto("/proveedores");
    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/directorio");
  });

  test("directorio redirige a login sin sesión", async ({ page }) => {
    await page.goto("/directorio");
    await expect(page).toHaveURL(/\/login/);
    expect(new URL(page.url()).searchParams.get("next")).toBe("/directorio");
  });
});
