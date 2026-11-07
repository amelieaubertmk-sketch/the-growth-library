import { z } from "zod";
const base = {
  id: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
};
export const bookSchema = z
  .object({
    ...base,
    title: z.string().min(1),
    author: z.string(),
    cover: z.string(),
    pages: z.number().int().nonnegative(),
    currentPage: z.number().int().nonnegative(),
    status: z.enum(["À lire", "En cours", "Terminé", "En pause", "Abandonné"]),
    category: z.string(),
    description: z.string(),
    isbn: z.string(),
    tags: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    rating: z.number().min(0).max(5),
    summary: z.string(),
    assessment: z.record(z.string(), z.string()),
  })
  .refine((b) => b.currentPage <= b.pages, "La page actuelle dépasse le total");
export type Book = z.infer<typeof bookSchema>;
export const entrySchema = z.object({
  ...base,
  kind: z.enum([
    "idea",
    "quote",
    "reflection",
    "action",
    "goal",
    "monthly",
    "focus",
    "project",
    "activity",
    "review",
  ]),
  title: z.string(),
  text: z.string(),
  bookId: z.string(),
  ideaId: z.string(),
  projectIds: z.array(z.string()),
  categories: z.string(),
  importance: z.enum(["Faible", "Moyenne", "Élevée"]),
  status: z
    .string()
    .refine(
      (s) => ["À faire", "En cours", "Terminée", "Abandonnée"].includes(s),
      "Statut invalide",
    ),
  completedAt: z.string().default(""),
  dueDate: z.string(),
  page: z.string(),
  chapter: z.string(),
  tags: z.string(),
  favorite: z.boolean(),
  reviewDate: z.string(),
  progress: z.number().min(0).max(100),
  bookIds: z.array(z.string()),
  actionIds: z.array(z.string()),
  result: z.record(z.string(), z.string()),
  demo: z.boolean(),
});
export type Entry = z.infer<typeof entrySchema>;
export const sessionSchema = z
  .object({
    ...base,
    bookId: z.string(),
    date: z.string(),
    from: z.number().int().nonnegative(),
    to: z.number().int().nonnegative(),
    duration: z.number().nonnegative().nullable(),
    chapter: z.string(),
    note: z.string(),
  })
  .refine((s) => s.to >= s.from, "Pages invalides");
export type ReadingSession = z.infer<typeof sessionSchema>;
export const preferenceSchema = z.object({
  id: z.literal("user"),
  name: z.string(),
  theme: z.enum(["light", "dark"]),
  initialized: z.boolean(),
  featuredBook: z.string(),
  categories: z.array(z.string()),
  annualBooks: z.number().nonnegative(),
  monthlyPages: z.number().nonnegative(),
  monthlyActions: z.number().nonnegative(),
  readingPreference: z.string(),
});
export type UserPreferences = z.infer<typeof preferenceSchema>;
export type BookNote = Entry & { kind: "reflection" };
export type Idea = Entry & { kind: "idea" };
export type Quote = Entry & { kind: "quote" };
export type Reflection = Entry & { kind: "reflection" };
export type Action = Entry & { kind: "action" };
export type Project = Entry & { kind: "project" };
export type Goal = Entry & { kind: "goal" };
export type MonthlyReview = Entry & { kind: "monthly" };
export type KnowledgeReview = Entry & { kind: "review" };
export const stamp = () => ({
  id: crypto.randomUUID(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
export const newBook = (): Book => ({
  ...stamp(),
  title: "",
  author: "",
  cover: "",
  pages: 0,
  currentPage: 0,
  status: "À lire",
  category: "",
  description: "",
  isbn: "",
  tags: "",
  startDate: "",
  endDate: "",
  rating: 0,
  summary: "",
  assessment: {},
});
export const newEntry = (kind: Entry["kind"]): Entry => ({
  ...stamp(),
  kind,
  title: "",
  text: "",
  bookId: "",
  ideaId: "",
  projectIds: [],
  categories: "",
  importance: "Moyenne",
  status: kind === "action" ? "À faire" : "En cours",
  completedAt: "",
  dueDate: "",
  page: "",
  chapter: "",
  tags: "",
  favorite: false,
  reviewDate: "",
  progress: 0,
  bookIds: [],
  actionIds: [],
  result: {},
  demo: false,
});
export const defaultPreferences: UserPreferences = {
  id: "user",
  name: "",
  theme: "light",
  initialized: false,
  featuredBook: "",
  categories: [
    "Entrepreneuriat",
    "Marketing",
    "Psychologie",
    "Développement personnel",
    "Stratégie",
    "Productivité",
    "Finances",
    "Créativité",
    "Leadership",
  ],
  annualBooks: 12,
  monthlyPages: 300,
  monthlyActions: 3,
  readingPreference: "",
};
