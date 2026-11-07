import Dexie, { type EntityTable } from "dexie";
import {
  type Book,
  type Entry,
  type ReadingSession,
  type UserPreferences,
  bookSchema,
  defaultPreferences,
  entrySchema,
  newBook,
  newEntry,
  sessionSchema,
} from "./schema";
export const db = new Dexie("growth-library") as Dexie & {
  books: EntityTable<Book, "id">;
  entries: EntityTable<Entry, "id">;
  sessions: EntityTable<ReadingSession, "id">;
  preferences: EntityTable<UserPreferences, "id">;
};
db.version(1).stores({
  books: "id,status,createdAt",
  entries: "id,kind,bookId,ideaId,createdAt",
  sessions: "id,bookId,date",
  preferences: "id",
});
export async function activity(title: string) {
  await db.entries.add({ ...newEntry("activity"), title });
}
export async function saveBook(book: Book) {
  bookSchema.parse(book);
  await db.transaction("rw", db.books, db.entries, db.sessions, async () => {
    const sessions = await db.sessions
      .where("bookId")
      .equals(book.id)
      .toArray();
    if (sessions.some((s) => s.to > book.pages))
      throw Error(
        "Le total de pages ne peut pas être inférieur à une session existante. Corrigez d’abord les sessions concernées.",
      );
    const old = await db.books.get(book.id);
    await db.books.put({ ...book, updatedAt: new Date().toISOString() });
    await activity(
      !old
        ? `Livre ajouté : ${book.title}`
        : old.status !== book.status
          ? `${book.title} · ${book.status}`
          : `Lecture mise à jour : ${book.title}`,
    );
  });
}
export async function saveEntry(entry: Entry) {
  entrySchema.parse(entry);
  await db.transaction("rw", db.entries, async () => {
    const old = await db.entries.get(entry.id);
    await db.entries.put({
      ...entry,
      completedAt:
        entry.kind === "action" && entry.status === "Terminée"
          ? old?.completedAt || new Date().toISOString()
          : "",
      updatedAt: new Date().toISOString(),
    });
    if (entry.kind !== "activity")
      await activity(
        `${entry.kind === "action" ? "Action" : "Note"} : ${entry.title || entry.text.slice(0, 50)}`,
      );
  });
}
export async function saveSession(session: ReadingSession) {
  sessionSchema.parse(session);
  await db.transaction("rw", db.books, db.sessions, db.entries, async () => {
    const b = await db.books.get(session.bookId);
    if (!b || session.to > b.pages)
      throw Error(
        "Indiquez un nombre total de pages suffisant dans la fiche du livre.",
      );
    await db.sessions.put({ ...session, updatedAt: new Date().toISOString() });
    await db.books.update(b.id, {
      currentPage: session.to,
      updatedAt: new Date().toISOString(),
    });
    await activity(
      `Session enregistrée : ${b.title} · pages ${session.from}–${session.to}`,
    );
  });
}
export async function deleteBook(id: string) {
  await db.transaction("rw", db.books, db.sessions, db.entries, async () => {
    await db.books.delete(id);
    await db.sessions.where("bookId").equals(id).delete();
    await db.entries.where("bookId").equals(id).modify({ bookId: "" });
    await db.entries.toCollection().modify((e) => {
      e.bookIds = e.bookIds.filter((x) => x !== id);
    });
  });
}
export async function deleteEntry(entry: Entry) {
  await db.transaction("rw", db.entries, async () => {
    await db.entries.delete(entry.id);
    await db.entries.toCollection().modify((e) => {
      if (e.ideaId === entry.id) e.ideaId = "";
      e.projectIds = e.projectIds.filter((x) => x !== entry.id);
      e.actionIds = e.actionIds.filter((x) => x !== entry.id);
    });
  });
}
export async function initialize(demo: boolean) {
  await db.transaction("rw", db.books, db.entries, db.preferences, async () => {
    if ((await db.preferences.get("user"))?.initialized) return;
    await db.preferences.put({ ...defaultPreferences, initialized: true });
    if (!demo) return;
    const projects = [
      "KISSIP",
      "Infinity Moove",
      "Infinity Cab",
      "Développement personnel",
    ].map((title) => ({ ...newEntry("project"), title, demo: true }));
    await db.entries.bulkAdd(projects);
    const book = {
      ...newBook(),
      title: "La Vache Pourpre",
      author: "Seth Godin",
      category: "Marketing / Différenciation",
      status: "En cours" as const,
      description: "Livre de démonstration · progression non renseignée.",
    };
    await db.books.add(book);
    const ideas = [
      "Être remarquable plutôt que simplement bon.",
      "Intégrer la différenciation dès la conception du produit.",
      "Ne pas chercher à plaire à tout le monde.",
    ].map((title) => ({
      ...newEntry("idea"),
      title,
      text: "Exemple modifiable — synthèse générale, pas une citation.",
      bookId: book.id,
      demo: true,
    }));
    await db.entries.bulkAdd(ideas);
    await db.entries.add({
      ...newEntry("action"),
      title:
        "Identifier ce qui rend FIRST SIP suffisamment original pour provoquer le bouche-à-oreille.",
      bookId: book.id,
      ideaId: ideas[0].id,
      projectIds: [projects[0].id],
      demo: true,
    });
  });
}
