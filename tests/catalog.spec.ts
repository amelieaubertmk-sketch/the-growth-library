import { test, expect } from "@playwright/test";
import { newBook, newEntry, defaultPreferences, stamp } from "../src/db/schema";
test("migration navigateur : deux fiches conservées, quatorze ajouts et import répétable", async ({
  page,
}) => {
  const originals = [
    {
      ...newBook(),
      id: "personal-purple",
      title: "La Vache Pourpre",
      author: "Seth Godin",
      pages: 281,
      currentPage: 37,
      status: "En cours" as const,
      summary: "Résumé à préserver",
      description: "Description à préserver",
      rating: 4,
      startDate: "2026-10-01",
      tags: "mes étiquettes",
      assessment: { avis: "Mon bilan" },
    },
    {
      ...newBook(),
      id: "personal-backpack",
      title: "Votre empire dans un sac à dos",
      author: "Stan Leloup",
      pages: 300,
      currentPage: 52,
      status: "En pause" as const,
      cover:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jN1cAAAAASUVORK5CYII=",
    },
  ];
  const note = {
    ...newEntry("reflection"),
    id: "personal-reflection",
    bookId: originals[0].id,
    title: "Ma note",
    text: "Contenu personnel à préserver",
  };
  const session = {
    ...stamp(),
    bookId: originals[0].id,
    date: "2026-10-02",
    from: 0,
    to: 37,
    duration: 45,
    chapter: "1",
    note: "Session personnelle",
  };
  const preferences = {
    ...defaultPreferences,
    initialized: true,
    name: "Lectrice",
  };
  await page.route("**/legacy-fixture", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Fixture locale</title>",
    }),
  );
  await page.goto("/legacy-fixture");
  await page.evaluate(
    async ({ originals, note, session, preferences }) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("growth-library", 10);
        request.onupgradeneeded = () => {
          const db = request.result;
          const schemas = {
            books: ["status", "createdAt"],
            entries: ["kind", "bookId", "ideaId", "createdAt"],
            sessions: ["bookId", "date"],
            preferences: [],
          };
          for (const [name, indexes] of Object.entries(schemas)) {
            const store = db.createObjectStore(name, { keyPath: "id" });
            for (const index of indexes) store.createIndex(index, index);
          }
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(
            ["books", "entries", "sessions", "preferences"],
            "readwrite",
          );
          originals.forEach((b) => tx.objectStore("books").add(b));
          tx.objectStore("entries").add(note);
          tx.objectStore("sessions").add(session);
          tx.objectStore("preferences").add(preferences);
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      });
    },
    { originals, note, session, preferences },
  );
  await page.goto("/#/library");
  await expect(page.locator(".book-card")).toHaveCount(16);
  const readStored = () =>
    page.evaluate(async () => {
      return await new Promise<{
        books: unknown[];
        entries: unknown[];
        sessions: unknown[];
        preferences: unknown[];
      }>((resolve, reject) => {
        const request = indexedDB.open("growth-library");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const tx = database.transaction(
            ["books", "entries", "sessions", "preferences"],
            "readonly",
          );
          const result: Record<string, unknown[]> = {};
          for (const key of ["books", "entries", "sessions", "preferences"]) {
            const query = tx.objectStore(key).getAll();
            query.onsuccess = () => {
              result[key] = query.result;
            };
          }
          tx.oncomplete = () => {
            database.close();
            resolve(
              result as {
                books: unknown[];
                entries: unknown[];
                sessions: unknown[];
                preferences: unknown[];
              },
            );
          };
        };
      });
    });
  let stored = await readStored();
  for (const original of originals)
    expect(stored.books).toContainEqual(original);
  expect(stored.entries).toEqual([note]);
  expect(stored.sessions).toEqual([session]);
  expect(stored.preferences).toEqual([preferences]);
  await page.getByLabel("Filtrer par statut").selectOption("Liste de souhaits");
  await expect(page.locator(".book-card")).toHaveCount(13);
  await page
    .getByLabel("Filtrer par catégorie")
    .selectOption("Finance & Investissement");
  await expect(page.locator(".book-card")).toHaveCount(2);
  await page.getByLabel("Rechercher des livres").fill("Morgan Housel");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "La Psychologie de l'argent" }),
  ).toBeVisible();
  await page.getByLabel("Rechercher des livres").fill("");
  await page.getByLabel("Filtrer par catégorie").selectOption("");
  await page
    .getByLabel("Filtrer par statut")
    .selectOption("À lire prochainement");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await page.getByRole("heading", { name: "Le Personal MBA" }).click();
  await expect(
    page.getByText(
      "Acquérir une vision globale du fonctionnement d’une entreprise.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Édition non vérifiée", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Modifier le livre" }).click();
  await expect(page.getByLabel("Statut", { exact: true })).toHaveValue(
    "À lire prochainement",
  );
  await page.getByRole("button", { name: "Fermer", exact: true }).click();
  await page.goto("/#/settings");
  await page
    .getByRole("button", { name: "Ajouter les références absentes" })
    .click();
  await expect(
    page.getByText("0 livre(s) ajouté(s), 14 déjà présent(s).").first(),
  ).toBeVisible();
  await page.goto("/#/library");
  await page.reload();
  await expect(page.locator(".book-card")).toHaveCount(16);
  await page.getByLabel("Trier les livres").selectOption("entrepreneurial");
  await expect(page.locator(".book-card").first()).toContainText(
    "La Vache Pourpre",
  );
  await expect(page.locator(".book-card").nth(1)).toContainText(
    "Votre empire dans un sac à dos",
  );
  await expect(page.locator("img")).toHaveCount(1);
  expect(
    await page
      .locator("img")
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0),
      ),
  ).toBe(true);
  stored = await readStored();
  for (const original of originals)
    expect(stored.books).toContainEqual(original);
  expect(stored.entries).toEqual([note]);
  expect(stored.sessions).toEqual([session]);
});
