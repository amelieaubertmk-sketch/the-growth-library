import { entrepreneurialOrder } from "../catalog/entrepreneurial";
import type { Book, Entry, ReadingSession } from "../db/schema";
export const progress = (current: number, total: number) =>
  total > 0
    ? Math.min(100, Math.max(0, Math.round((current / total) * 100)))
    : 0;
export function filterBooks(
  books: Book[],
  query: string,
  status: string,
  sort: string,
  category = "",
) {
  return books
    .filter(
      (b) =>
        (!status || b.status === status) &&
        (!category || b.category === category) &&
        `${b.title} ${b.author} ${b.category}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()),
    )
    .sort((a, b) =>
      sort === "entrepreneurial"
        ? entrepreneurialOrder(a) - entrepreneurialOrder(b) ||
          a.title.localeCompare(b.title)
        : sort === "title"
          ? a.title.localeCompare(b.title)
          : sort === "progress"
            ? progress(b.currentPage, b.pages) -
              progress(a.currentPage, a.pages)
            : sort === "rating"
              ? b.rating - a.rating
              : b.createdAt.localeCompare(a.createdAt),
    );
}
export function statistics(
  books: Book[],
  entries: Entry[],
  sessions: ReadingSession[],
  year = new Date().getFullYear(),
) {
  const actions = entries.filter((e) => e.kind === "action");
  return {
    reading: books.filter((b) => b.status === "En cours").length,
    finished: books.filter((b) => b.status === "Terminé").length,
    ideas: entries.filter((e) => e.kind === "idea").length,
    done: actions.filter((e) => e.status === "Terminée").length,
    pages: sessions.reduce((n, s) => n + s.to - s.from, 0),
    minutes: sessions.reduce((n, s) => n + (s.duration ?? 0), 0),
    sessions: sessions.length,
    rate: actions.length
      ? Math.round(
          (actions.filter((e) => e.status === "Terminée").length /
            actions.length) *
            100,
        )
      : 0,
    months: Array.from({ length: 12 }, (_, i) => {
      const prefix = `${year}-${String(i + 1).padStart(2, "0")}`;
      return {
        month: new Date(year, i).toLocaleDateString("fr", { month: "short" }),
        Livres: books.filter(
          (b) => b.status === "Terminé" && b.endDate.startsWith(prefix),
        ).length,
        Pages: sessions
          .filter((s) => s.date.startsWith(prefix))
          .reduce((n, s) => n + s.to - s.from, 0),
        Idées: entries.filter(
          (e) => e.kind === "idea" && e.createdAt.startsWith(prefix),
        ).length,
      };
    }),
  };
}
