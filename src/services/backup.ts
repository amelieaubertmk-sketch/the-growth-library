import { z } from "zod";
import { db } from "../db";
import {
  bookSchema,
  entrySchema,
  preferenceSchema,
  sessionSchema,
} from "../db/schema";
const backupFields = {
  exportedAt: z.string(),
  books: z.array(bookSchema),
  entries: z.array(entrySchema),
  sessions: z.array(sessionSchema),
  preferences: z.array(preferenceSchema).length(1),
};
const integrationsSchema = z.array(
  z.object({
    id: z.string(),
    appliedAt: z.string(),
    addedIds: z.array(z.string()),
    skippedIds: z.array(z.string()),
  }),
);
export const backupSchema = z
  .discriminatedUnion("schemaVersion", [
    z.object({ ...backupFields, schemaVersion: z.literal(1) }),
    z.object({
      ...backupFields,
      schemaVersion: z.literal(2),
      integrations: integrationsSchema,
    }),
  ])
  .transform((data) => ({
    ...data,
    schemaVersion: 2 as const,
    integrations: "integrations" in data ? data.integrations : [],
  }));
export function validateBackup(input: unknown) {
  const data = backupSchema.parse(input);
  for (const list of [
    data.books,
    data.entries,
    data.sessions,
    data.integrations,
  ])
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
  return db.transaction(
    "r",
    [db.books, db.entries, db.sessions, db.preferences, db.integrations],
    async () => ({
      schemaVersion: 2 as const,
      exportedAt: new Date().toISOString(),
      integrations: await db.integrations.toArray(),
      books: await db.books.toArray(),
      entries: await db.entries.toArray(),
      sessions: await db.sessions.toArray(),
      preferences: await db.preferences.toArray(),
    }),
  );
}
export async function restore(input: unknown) {
  const data = validateBackup(input);
  await db.transaction(
    "rw",
    [db.books, db.entries, db.sessions, db.preferences, db.integrations],
    async () => {
      await Promise.all([
        db.books.clear(),
        db.entries.clear(),
        db.sessions.clear(),
        db.preferences.clear(),
        db.integrations.clear(),
      ]);
      await db.books.bulkAdd(data.books);
      await db.entries.bulkAdd(data.entries);
      await db.sessions.bulkAdd(data.sessions);
      await db.preferences.bulkAdd(data.preferences);
      await db.integrations.bulkAdd(data.integrations);
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
