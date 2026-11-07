import type { Transaction } from "dexie";
import { bookSchema, newBook, type Book } from "../db/schema";
import {
  catalogBookId,
  entrepreneurialCatalog,
  ENTREPRENEURIAL_CATALOG_ID,
  matchesReference,
} from "./entrepreneurial";
export interface CatalogIntegration {
  id: string;
  appliedAt: string;
  addedIds: string[];
  skippedIds: string[];
}
export interface CatalogImportResult {
  added: number;
  skipped: number;
  alreadyApplied: boolean;
}
/** Same function for upgrade transactions and the explicit additive import. Never puts an existing book. */
export async function importCatalogInTransaction(
  tx: Transaction,
  automatic = false,
): Promise<CatalogImportResult> {
  const books = tx.table<Book, string>("books"),
    integrations = tx.table<CatalogIntegration, string>("integrations");
  const previous = await integrations.get(ENTREPRENEURIAL_CATALOG_ID);
  if (automatic && previous)
    return {
      added: 0,
      skipped: entrepreneurialCatalog.length,
      alreadyApplied: true,
    };
  const existing = await books.toArray(),
    addedIds: string[] = [],
    skippedIds: string[] = [];
  for (const definition of entrepreneurialCatalog) {
    const id = catalogBookId(definition.key);
    // Edition-specific ISBNs are intentionally absent until verified. Title+author aliases handle other editions.
    const found = existing.find(
      (b) =>
        b.id === id || b.catalogId === id || matchesReference(b, definition),
    );
    if (found) {
      skippedIds.push(found.id);
      continue;
    }
    const book: Book = {
      ...newBook(),
      id,
      catalogId: id,
      title: definition.title,
      author: definition.author,
      category: definition.category,
      tags: definition.tags.join(", "),
      priority: definition.priority,
      status: definition.status,
      description: definition.description,
      skill: definition.skill,
      learningObjective: definition.objective,
      businesses: [...definition.businesses],
      bibliography: {
        verification: "unverified",
        sources: [],
        format: "Non identifié",
        publisher: "",
        publishedDate: "",
        edition: "",
      },
    };
    bookSchema.parse(book);
    await books.add(book);
    existing.push(book);
    addedIds.push(id);
  }
  await integrations.put({
    id: ENTREPRENEURIAL_CATALOG_ID,
    appliedAt: new Date().toISOString(),
    addedIds: [...new Set([...(previous?.addedIds || []), ...addedIds])],
    skippedIds,
  });
  return {
    added: addedIds.length,
    skipped: skippedIds.length,
    alreadyApplied: !!previous,
  };
}
