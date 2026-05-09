import { mkdirSync } from "node:fs";
import path from "node:path";

import { test as setup, expect } from "@playwright/test";

const authFile = path.join(process.cwd(), "e2e", ".auth", "user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email?.trim() || !password) {
    throw new Error(
      "E2E_EMAIL / E2E_PASSWORD no están definidos (playwright.config solo registra este proyecto si existen).",
    );
  }

  await page.goto("/login");

  await page.getByLabel(/correo/i).fill(email);
  await page.getByLabel(/contraseña/i).fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();

  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });

  const pathAfter = new URL(page.url()).pathname;
  if (pathAfter.startsWith("/checkout")) {
    throw new Error(
      "E2E: la cuenta llegó a /checkout (sin suscripción activa). Usa un usuario con acceso al directorio.",
    );
  }

  await page.goto("/directorio");
  await expect(
    page.getByRole("heading", { name: /Directorio Makeray/i }),
  ).toBeVisible({ timeout: 30_000 });

  mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
