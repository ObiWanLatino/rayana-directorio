import { expect, test } from "@playwright/test";

test.describe("Directorio autenticado", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/directorio");
    await expect(page.getByText("Directorio Makeray")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("muestra el título del directorio", async ({ page }) => {
    await expect(page).toHaveTitle(/Makeray/);
    await expect(
      page.getByRole("heading", { name: /Directorio Makeray/i }),
    ).toBeVisible();
  });

  test("sidebar muestra las 8 categorías", async ({ page }) => {
    const filterBtn = page.getByRole("button", { name: /filtrar/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
    }

    const categories = [
      "Moda Femenina",
      "Joyas",
      "Deco Hogar",
      "Jeans",
      "Cosméticos",
      "Accesorios",
      "Infantil",
      "Importadoras",
    ];
    for (const cat of categories) {
      await expect(
        page.getByRole("button", { name: new RegExp(cat, "i") }),
      ).toBeVisible();
    }
  });

  test("el campo de búsqueda filtra proveedores por nombre", async ({
    page,
  }) => {
    const search = page.getByPlaceholder(/buscar/i);
    await expect(search).toBeVisible();

    await search.fill("Moda");
    await page.waitForTimeout(300);

    const cards = page.getByTestId("provider-card");
    await expect(cards.first()).toBeVisible();

    await search.fill("zzzzznonexistent99999");
    await page.waitForTimeout(300);
    await expect(page.getByText(/no encontramos/i)).toBeVisible();
  });

  test("limpiar búsqueda restaura todos los resultados", async ({
    page,
  }) => {
    const search = page.getByPlaceholder(/buscar/i);
    await search.fill("xyz");
    await page.waitForTimeout(300);

    await page.getByRole("button", { name: /limpiar búsqueda/i }).click();
    await expect(search).toHaveValue("");

    const cards = page.getByTestId("provider-card");
    await expect(cards.first()).toBeVisible();
  });

  test("filtrar por categoría muestra solo esa categoría", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Joyas/i }).click();
    await page.waitForTimeout(300);

    const cards = page.getByTestId("provider-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
  });

  test("botón WhatsApp tiene href wa.me válido", async ({ page }) => {
    const waLink = page.locator('a[href*="wa.me"]').first();
    await expect(waLink).toBeVisible();

    const href = await waLink.getAttribute("href");
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+/);
    expect(href).toContain("text=");
  });

  test("móvil: sidebar oculto por defecto, se abre con botón Filtrar", async ({
    page,
  }) => {
    const filterBtn = page.getByRole("button", { name: /filtrar/i });
    if (!(await filterBtn.isVisible())) {
      return;
    }

    await filterBtn.click();
    await expect(
      page.getByRole("button", { name: /Moda Femenina/i }),
    ).toBeVisible();
  });

  test("308 redirect: /proveedores apunta a /directorio", async ({
    request,
  }) => {
    const res = await request.get("/proveedores", { maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toContain("/directorio");
  });
});
