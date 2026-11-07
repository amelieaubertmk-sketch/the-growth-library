import { test, expect } from "@playwright/test";
test("parcours réel, persistance et responsive", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Commencer avec une bibliothèque vide" })
    .click();
  await page
    .getByRole("button", { name: "Ajouter un livre", exact: true })
    .click();
  await page.getByLabel("Titre *", { exact: true }).fill("Mon livre de test");
  await page.getByLabel("Auteur", { exact: true }).fill("Autrice");
  await page.getByLabel("Total de pages").fill("200");
  await page.getByLabel("Statut", { exact: true }).selectOption("En cours");
  await page.getByRole("button", { name: "Enregistrer le livre" }).click();
  await expect(
    page.getByRole("heading", { name: "Mon livre de test" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continuer ma lecture" }).click();
  await page.getByLabel("Page de fin").fill("40");
  await page.getByRole("button", { name: "Enregistrer la session" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("40 sur 200 pages")).toBeVisible();
  await page.getByRole("button", { name: "Capture rapide" }).click();
  await page.getByRole("button", { name: "Une idée", exact: true }).click();
  await page.getByLabel("Titre *", { exact: true }).fill("Une idée utile");
  await page
    .getByLabel("Livre associé")
    .selectOption({ label: "Mon livre de test" });
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/#/ideas");
  await page.getByRole("button", { name: "Transformer en action" }).click();
  await page.getByLabel("Titre *", { exact: true }).fill("Tester cette idée");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/#/actions");
  await expect(
    page.getByRole("heading", { name: "Tester cette idée" }),
  ).toBeVisible();
  await page.getByLabel("Statut", { exact: true }).selectOption("Terminée");
  await page.getByLabel("Résultat obtenu").fill("Un retour concret");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Un retour concret")).toBeVisible();
  await page.goto("/");
  for (const width of [375, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect(page.getByRole("heading", { name: "Bonjour." })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `test-results/dashboard-${width}.png`,
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
test("notes, bilan, projets, sauvegarde et restauration", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explorer avec les exemples modifiables" })
    .click();
  await page.getByRole("link", { name: "Ouvrir la fiche" }).click();
  for (const [tab, label, title] of [
    ["Mes citations", "Citation *", "Mon passage personnel"],
    ["Mes réflexions", "Titre *", "Une réflexion personnelle"],
  ] as const) {
    await page.getByRole("tab", { name: tab }).click();
    await page.getByRole("button", { name: "Ajouter", exact: true }).click();
    await page.getByLabel(label, { exact: true }).fill(title);
    await page
      .getByRole("button", { name: "Enregistrer", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }
  await page.getByRole("tab", { name: "Mon bilan" }).click();
  await page
    .getByLabel("Ce que j’ai préféré", { exact: true })
    .fill("La simplicité");
  await page.getByRole("button", { name: "Enregistrer mon bilan" }).click();
  await expect(
    page.getByText("Bilan enregistré", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Mon bilan" }).click();
  await expect(
    page.getByLabel("Ce que j’ai préféré", { exact: true }),
  ).toHaveValue("La simplicité");
  await page.goto("/#/settings");
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();
  await page.getByLabel("Titre *", { exact: true }).fill("Projet test");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Projet test", { exact: true })).toBeVisible();
  const downloadEvent = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Exporter toutes mes données (JSON)" })
    .click();
  const file = await downloadEvent;
  const path = await file.path();
  expect(path).toBeTruthy();
  await page.getByLabel("Restaurer une sauvegarde JSON").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("Sauvegarde invalide");
  await page.getByLabel("Restaurer une sauvegarde JSON").setInputFiles(path!);
  await expect(
    page.getByRole("button", { name: "Confirmer le remplacement" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirmer le remplacement" }).click();
  await expect(
    page.getByRole("button", { name: "Confirmer le remplacement" }),
  ).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Projet test", { exact: true })).toBeVisible();
  await page.goto("/#/progress");
  await expect(
    page.getByRole("heading", { name: "Ma progression", exact: true }),
  ).toBeVisible();
  await page.goto("/#/vision");
  await expect(
    page.getByRole("heading", { name: "Ma vision", exact: true }),
  ).toBeVisible();
});
