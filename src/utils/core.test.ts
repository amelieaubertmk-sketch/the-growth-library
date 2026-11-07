import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  db,
  addEntrepreneurialBooks,
  deleteBook,
  deleteEntry,
  initialize,
  saveBook,
  saveEntry,
  saveSession,
} from "../db";
import { newBook, newEntry, stamp } from "../db/schema";
import { csv, exportData, restore, validateBackup } from "../services/backup";
import { filterBooks, progress, statistics } from "./statistics";
beforeEach(async () => {
  await Promise.all([
    db.books.clear(),
    db.entries.clear(),
    db.sessions.clear(),
    db.preferences.clear(),
    db.integrations.clear(),
  ]);
});
describe("Lectures et connaissances", () => {
  it("crée et modifie un livre persistant", async () => {
    const b = { ...newBook(), title: "Test", pages: 200 };
    await saveBook(b);
    await saveBook({ ...b, currentPage: 70 });
    expect((await db.books.get(b.id))?.currentPage).toBe(70);
  });
  it("borne le calcul de progression", () => {
    expect(progress(3, 0)).toBe(0);
    expect(progress(40, 100)).toBe(40);
    expect(progress(130, 100)).toBe(100);
    expect(progress(-5, 100)).toBe(0);
  });
  it("refuse une progression incohérente", async () => {
    await expect(
      saveBook({ ...newBook(), title: "A", pages: 10, currentPage: 20 }),
    ).rejects.toThrow();
  });
  it("enregistre, corrige et supprime une session sans inventer de durée", async () => {
    const b = { ...newBook(), title: "A", pages: 200 };
    await saveBook(b);
    const s = {
      ...stamp(),
      bookId: b.id,
      date: "2026-11-07",
      from: 0,
      to: 35,
      duration: null,
      chapter: "1",
      note: "",
    };
    await saveSession(s);
    expect((await db.books.get(b.id))?.currentPage).toBe(35);
    expect((await db.sessions.get(s.id))?.duration).toBeNull();
    await expect(saveBook({ ...b, pages: 20 })).rejects.toThrow();
    await saveSession({ ...s, to: 40 });
    expect(await db.sessions.count()).toBe(1);
    await expect(saveSession({ ...s, to: 250 })).rejects.toThrow();
    await db.sessions.delete(s.id);
    expect(await db.sessions.count()).toBe(0);
  });
  it("conserve les liens livre → idée → action et nettoie les suppressions", async () => {
    const b = { ...newBook(), title: "B" };
    await saveBook(b);
    const idea = { ...newEntry("idea"), title: "I", bookId: b.id };
    await saveEntry(idea);
    const action = {
      ...newEntry("action"),
      title: "A",
      bookId: b.id,
      ideaId: idea.id,
    };
    await saveEntry(action);
    expect((await db.entries.get(action.id))?.ideaId).toBe(idea.id);
    await deleteEntry(idea);
    expect((await db.entries.get(action.id))?.ideaId).toBe("");
    await deleteBook(b.id);
    expect((await db.entries.get(action.id))?.bookId).toBe("");
  });
  it("calcule les statistiques des vraies données et filtre les livres", () => {
    const b = {
      ...newBook(),
      title: "Marketing",
      author: "Seth",
      category: "Stratégie",
      status: "Terminé" as const,
      endDate: "2026-11-01",
    };
    const a = { ...newEntry("action"), status: "Terminée" };
    const s = {
      ...stamp(),
      bookId: b.id,
      date: "2026-11-07",
      from: 10,
      to: 30,
      duration: 12,
      chapter: "",
      note: "",
    };
    const stats = statistics([b], [a], [s], 2026);
    expect(stats.pages).toBe(20);
    expect(stats.minutes).toBe(12);
    expect(stats.rate).toBe(100);
    expect(stats.months[10].Livres).toBe(1);
    expect(filterBooks([b], "seth", "Terminé", "title")).toHaveLength(1);
    expect(filterBooks([b], "seth", "À lire", "title")).toHaveLength(0);
  });
  it("ne réinjecte jamais les exemples après initialisation", async () => {
    await initialize(false);
    await initialize(true);
    expect(await db.books.count()).toBe(0);
  });
});
describe("Sauvegardes", () => {
  it("exporte et restaure toutes les données", async () => {
    await initialize(true);
    const backup = await exportData();
    await db.books.clear();
    await restore(backup);
    expect(await db.books.count()).toBe(1);
    expect(await db.entries.where("kind").equals("idea").count()).toBe(3);
  });
  it("refuse les formats, versions, doublons et relations invalides avant mutation", async () => {
    await initialize(true);
    const data = await exportData();
    expect(() => validateBackup({ ...data, schemaVersion: 99 })).toThrow();
    expect(() =>
      validateBackup({ ...data, books: [...data.books, ...data.books] }),
    ).toThrow();
    await expect(restore({ ...data, books: [] })).rejects.toThrow();
    expect(await db.books.count()).toBe(1);
  });
  it("échappe le CSV et protège les formules", () => {
    expect(csv([["=1+1", 'a"b']])).toContain('"\'=1+1","a""b"');
  });
});

it("restaure les exports historiques v1 et conserve les champs et marqueurs v2", async () => {
  await initialize(false);
  await addEntrepreneurialBooks();
  const modern = await exportData();
  expect(modern.schemaVersion).toBe(2);
  expect(modern.integrations).toHaveLength(1);
  await restore(modern);
  expect(await exportData()).toMatchObject({
    books: modern.books,
    integrations: modern.integrations,
  });
  const { integrations: _, ...legacy } = modern;
  await restore({ ...legacy, schemaVersion: 1 });
  expect(await db.integrations.count()).toBe(0);
  expect(await db.books.count()).toBe(14);
  expect((await addEntrepreneurialBooks()).added).toBe(0);
});
