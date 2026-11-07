import { z } from "zod";
import { db } from "../db";
import {
  bookSchema,
  entrySchema,
  preferenceSchema,
  sessionSchema,
} from "../db/schema";
export const backupSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(),
  books: z.array(bookSchema),
  entries: z.array(entrySchema),
  sessions: z.array(sessionSchema),
  preferences: z.array(preferenceSchema).length(1),
});
export function validateBackup(input: unknown) {
  const data = backupSchema.parse(input);
  for (const list of [data.books, data.entries, data.sessions])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      throw Error("Identifiants dupliqués");
  const books = new Set(data.books.map((b) => b.id)),
    entries = new Map(data.entries.map((e) => [e.id, e]));
  for (const s of data.sessions)
    if (
      !books.has(s.bookId) ||
      s.to > data.books.find((b) => b.id === s.bookId)!.pages
    )
      throw Error("Session incohérente");
  for (const e of data.entries) {
    if (e.bookId && !books.has(e.bookId)) throw Error("Livre associé absent");
    if (e.ideaId && entries.get(e.ideaId)?.kind !== "idea")
      throw Error("Idée associée absente");
    if (
      e.projectIds.some((id) => entries.get(id)?.kind !== "project") ||
      e.bookIds.some((id) => !books.has(id)) ||
      e.actionIds.some((id) => entries.get(id)?.kind !== "action")
    )
      throw Error("Relation invalide");
  }
  return data;
}
export async function exportData() {
  return {
    schemaVersion: 1 as const,
    exportedAt: new Date().toISOString(),
    books: await db.books.toArray(),
    entries: await db.entries.toArray(),
    sessions: await db.sessions.toArray(),
    preferences: await db.preferences.toArray(),
  };
}
export async function restore(input: unknown) {
  const data = validateBackup(input);
  await db.transaction(
    "rw",
    [db.books, db.entries, db.sessions, db.preferences],
    async () => {
      await Promise.all([
        db.books.clear(),
        db.entries.clear(),
        db.sessions.clear(),
        db.preferences.clear(),
      ]);
      await db.books.bulkAdd(data.books);
      await db.entries.bulkAdd(data.entries);
      await db.sessions.bulkAdd(data.sessions);
      await db.preferences.bulkAdd(data.preferences);
    },
  );
}
export function download(
  content: string,
  name: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csv(rows: string[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map(
            (value) =>
              '"' +
              value.replace(/^[=+@\-]/, "'$&").replaceAll('"', '""') +
              '"',
          )
          .join(","),
      )
      .join("\r\n")
  );
}
