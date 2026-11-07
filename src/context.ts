import type { Book, Entry, ReadingSession, UserPreferences } from "./db/schema";
export type Context = {
  books: Book[];
  entries: Entry[];
  sessions: ReadingSession[];
  prefs: UserPreferences;
  editBook: (b?: Book) => void;
  editEntry: (e: Entry) => void;
  editSession: (b: Book, s?: ReadingSession) => void;
  execute: (fn: () => Promise<unknown>) => Promise<void>;
  notify: (s?: string) => void;
};
