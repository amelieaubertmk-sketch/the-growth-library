import { test, expect } from "@playwright/test";
test("le build garde les pages et données disponibles hors ligne", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explorer avec les exemples modifiables" })
    .click();
  await expect(
    page.getByRole("heading", { name: "La Vache Pourpre" }),
  ).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "La Vache Pourpre" }),
  ).toBeVisible();
  for (const [route, title] of [
    ["library", "Ma bibliothèque"],
    ["ideas", "Mes idées"],
    ["actions", "Mes actions"],
    ["progress", "Ma progression"],
    ["vision", "Ma vision"],
    ["settings", "Paramètres"],
  ]) {
    await page.goto(`/#/${route}`);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await page
    .getByRole("button", { name: "Ajouter les références absentes" })
    .click();
  await expect(
    page.getByText("14 livre(s) ajouté(s), 0 déjà présent(s).").first(),
  ).toBeVisible();
  await page.goto("/#/library");
  await page.reload();
  await expect(page.locator(".book-card")).toHaveCount(15);
  await page.goto("/#/ideas");
  await page.getByRole("button", { name: "Nouvelle idée" }).click();
  await page.getByLabel("Titre *", { exact: true }).fill("Capturée hors ligne");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Capturée hors ligne" }),
  ).toBeVisible();
});
