import "fake-indexeddb/auto";
import Dexie from "dexie";
import { afterEach, describe, expect, it } from "vitest";
import {
  createDatabase,
  addEntrepreneurialBooks,
  type GrowthDatabase,
} from "../db";
import {
  defaultPreferences,
  newBook,
  newEntry,
  stamp,
  type Book,
} from "../db/schema";
import {
  entrepreneurialCatalog,
  entrepreneurialOrder,
  matchesReference,
} from "./entrepreneurial";
import { importCatalogInTransaction } from "./import";
import { statistics, filterBooks } from "../utils/statistics";
const opened: GrowthDatabase[] = [];
afterEach(async () => {
  for (const database of opened.splice(0)) {
    database.close();
    await Dexie.delete(database.name);
  }
});
function fresh() {
  const database = createDatabase(`catalog-test-${crypto.randomUUID()}`);
  opened.push(database);
  return database;
}
async function legacyLibrary() {
  const name = `catalog-test-${crypto.randomUUID()}`;
  const old = new Dexie(name);
  old
    .version(1)
    .stores({
      books: "id,status,createdAt",
      entries: "id,kind,bookId,ideaId,createdAt",
      sessions: "id,bookId,date",
      preferences: "id",
    });
  const protectedBooks: Book[] = [
    {
      ...newBook(),
      id: "original-purple-cow",
      title: "La Vache Pourpre",
      author: "Seth Godin",
      status: "En cours",
      pages: 281,
      currentPage: 37,
      cover: "data:image/png;base64,PERSONAL",
      startDate: "2026-10-01",
      description: "Mon texte",
      summary: "Résumé personnel",
      assessment: { avis: "Mon avis" },
      rating: 4,
    },
    {
      ...newBook(),
      id: "original-backpack",
      title: "Votre empire dans un sac à dos",
      author: "Stan Leloup",
      status: "En pause",
      pages: 300,
      currentPage: 52,
      description: "Ne pas changer",
      tags: "Personnel",
      isbn: "",
      cover: "https://example.com/my-cover.png",
    },
  ];
  const extra = {
    ...newBook(),
    title: "Mon autre livre personnel",
    author: "Autrice",
    status: "Terminé" as const,
    pages: 90,
    currentPage: 90,
    endDate: "2025-04-03",
  };
  const note = {
    ...newEntry("reflection"),
    title: "Annotation",
    text: "Texte personnel",
    bookId: protectedBooks[0].id,
  };
  const session = {
    ...stamp(),
    bookId: protectedBooks[0].id,
    date: "2026-10-02",
    from: 0,
    to: 37,
    duration: 45,
    chapter: "1",
    note: "Ma session",
  };
  const preferences = {
    ...defaultPreferences,
    initialized: true,
    name: "Lectrice",
    theme: "dark" as const,
  };
  await old.table("books").bulkAdd([...protectedBooks, extra]);
  await old.table("entries").add(note);
  await old.table("sessions").add(session);
  await old.table("preferences").add(preferences);
  old.close();
  const database = createDatabase(name);
  opened.push(database);
  return { database, protectedBooks, extra, note, session, preferences };
}
describe("Catalogue entrepreneurial non destructif", () => {
  it("migre une vraie base v1 et préserve intégralement les données personnelles", async () => {
    const f = await legacyLibrary();
    await f.database.open();
    expect(await f.database.books.count()).toBe(17);
    for (const book of [...f.protectedBooks, f.extra])
      expect(await f.database.books.get(book.id)).toEqual(book);
    expect(await f.database.entries.toArray()).toEqual([f.note]);
    expect(await f.database.sessions.toArray()).toEqual([f.session]);
    expect(await f.database.preferences.get("user")).toEqual(f.preferences);
    expect(await f.database.integrations.count()).toBe(1);
    const stats = statistics(
      await f.database.books.toArray(),
      await f.database.entries.toArray(),
      await f.database.sessions.toArray(),
      2026,
    );
    expect(stats.finished).toBe(1);
    expect(stats.reading).toBe(1);
    expect(stats.pages).toBe(37);
    expect(stats.ideas).toBe(0);
  });
  it("reste idempotent après répétition, rechargement et deux appels concurrents", async () => {
    const database = fresh();
    const results = await Promise.all([
      addEntrepreneurialBooks(database),
      addEntrepreneurialBooks(database),
    ]);
    expect(results.map((r) => r.added).sort((a, b) => a - b)).toEqual([0, 14]);
    expect(await database.books.count()).toBe(14);
    const snapshot = await database.books.toArray();
    database.close();
    await database.open();
    expect((await addEntrepreneurialBooks(database)).added).toBe(0);
    expect(await database.books.toArray()).toEqual(snapshot);
  });
  it("reconnaît un livre déjà saisi sous un titre traduit sans le modifier", async () => {
    const database = fresh();
    const original = {
      ...newBook(),
      title: "C’EST ÇA, LE MARKETING",
      author: "Seth Godin",
      currentPage: 12,
      pages: 200,
      status: "En cours" as const,
      summary: "Mes notes",
    };
    await database.books.add(original);
    const result = await addEntrepreneurialBooks(database);
    expect(result).toMatchObject({ added: 13, skipped: 1 });
    expect(await database.books.get(original.id)).toEqual(original);
    expect(await database.books.count()).toBe(14);
    expect(
      matchesReference(
        { ...original, title: "Un autre livre" },
        entrepreneurialCatalog[1],
      ),
    ).toBe(false);
  });
  it("ne restaure pas automatiquement un livre volontairement retiré", async () => {
    const database = fresh();
    await addEntrepreneurialBooks(database);
    const first = (await database.books.toArray())[0];
    await database.books.delete(first.id);
    await database.transaction(
      "rw",
      [database.books, database.integrations],
      (tx) => importCatalogInTransaction(tx, true),
    );
    database.close();
    await database.open();
    expect(await database.books.count()).toBe(13);
  });
  it("annule atomiquement tous les ajouts si la transaction échoue", async () => {
    const database = fresh();
    const original = { ...newBook(), title: "Original", author: "Moi" };
    await database.books.add(original);
    await expect(
      database.transaction(
        "rw",
        [database.books, database.integrations],
        async (tx) => {
          await importCatalogInTransaction(tx);
          throw Error("Échec simulé");
        },
      ),
    ).rejects.toThrow("Échec simulé");
    expect(await database.books.toArray()).toEqual([original]);
    expect(await database.integrations.count()).toBe(0);
  });
  it("conserve le choix vide sur une nouvelle base et les bons états initiaux du catalogue", async () => {
    const database = fresh();
    await database.open();
    expect(await database.books.count()).toBe(0);
    await addEntrepreneurialBooks(database);
    const books = await database.books.toArray();
    expect(books.filter((b) => b.status === "Liste de souhaits")).toHaveLength(
      13,
    );
    expect(
      books.filter((b) => b.status === "À lire prochainement"),
    ).toHaveLength(1);
    for (const b of books) {
      expect(b.currentPage).toBe(0);
      expect(b.pages).toBe(0);
      expect(b.isbn).toBe("");
      expect(b.cover).toBe("");
      expect(b.rating).toBe(0);
      expect(b.startDate).toBe("");
      expect(b.endDate).toBe("");
      expect(b.summary).toBe("");
      expect(b.assessment).toEqual({});
      expect(b.learningObjective).toBeTruthy();
      expect(b.skill).toBeTruthy();
      expect(b.bibliography?.verification).toBe("unverified");
      const words = b.description.trim().split(/\s+/).length;
      expect(words).toBeGreaterThanOrEqual(80);
      expect(words).toBeLessThanOrEqual(120);
    }
    expect(await database.entries.count()).toBe(0);
    expect(await database.sessions.count()).toBe(0);
    expect(
      filterBooks(
        books,
        "",
        "Liste de souhaits",
        "title",
        "Finance & Investissement",
      ),
    ).toHaveLength(2);
    expect(
      filterBooks(books, "", "À lire prochainement", "entrepreneurial")[0]
        .title,
    ).toBe("Le Personal MBA");
    expect(
      entrepreneurialOrder({
        ...newBook(),
        title: "La Vache Pourpre",
        author: "Seth Godin",
      }),
    ).toBe(1);
  });
});
