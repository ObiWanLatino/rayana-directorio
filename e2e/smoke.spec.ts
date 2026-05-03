import { expect, test } from "@playwright/test";

test.describe("humo público", () => {
  test("la portada carga y muestra Rayana", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Rayana/i);
    await expect(
      page.getByRole("heading", { name: /Plataforma Rayana/i }),
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

  test("proveedores redirige a login sin sesión", async ({ page }) => {
    await page.goto("/proveedores");
    await expect(page).toHaveURL(/\/login/);
  });
});
