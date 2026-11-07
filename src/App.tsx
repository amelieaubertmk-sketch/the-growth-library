import { useLiveQuery } from "dexie-react-hooks";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChartNoAxesCombined,
  CheckCheck,
  Compass,
  LayoutDashboard,
  Library,
  Lightbulb,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter, Link, NavLink, Route, Routes } from "react-router-dom";
import { BookForm, EntryForm, Modal, SessionForm } from "./components/Forms";
import { db, initialize } from "./db";
import {
  defaultPreferences,
  newBook,
  newEntry,
  type Book,
  type Entry,
  type ReadingSession,
} from "./db/schema";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const LibraryPage = lazy(() => import("./pages/LibraryPage"));
const EntriesPage = lazy(() => import("./pages/EntriesPage"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const VisionPage = lazy(() => import("./pages/VisionPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const nav = [
  ["/", "Tableau de bord", LayoutDashboard],
  ["/library", "Ma bibliothèque", Library],
  ["/reading", "Mes lectures", BookOpen],
  ["/ideas", "Mes idées", Lightbulb],
  ["/actions", "Mes actions", CheckCheck],
  ["/progress", "Ma progression", ChartNoAxesCombined],
  ["/vision", "Ma vision", Compass],
  ["/settings", "Paramètres", Settings],
] as const;
type Editor =
  | { type: "book"; book: Book }
  | { type: "entry"; entry: Entry }
  | { type: "session"; book: Book; session?: ReadingSession }
  | { type: "capture" };
export default function App() {
  return (
    <HashRouter>
      <Workspace />
    </HashRouter>
  );
}
function Workspace() {
  const data = useLiveQuery(async () => ({
    books: await db.books.toArray(),
    entries: await db.entries.toArray(),
    sessions: await db.sessions.toArray(),
    prefs: await db.preferences.get("user"),
  }));
  const [editor, setEditor] = useState<Editor>(),
    [toast, setToast] = useState(""),
    [menu, setMenu] = useState(false),
    [failure, setFailure] = useState("");
  useEffect(() => {
    document.documentElement.dataset.theme = data?.prefs?.theme || "light";
  }, [data?.prefs?.theme]);
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const notify = (s = "Enregistré dans votre bibliothèque.") => setToast(s);
  const execute = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      notify();
    } catch (e) {
      setFailure(
        e instanceof Error
          ? e.message
          : "Impossible d’enregistrer les données.",
      );
    }
  };
  if (!data)
    return <div className="loading">Ouverture de votre bibliothèque…</div>;
  const { books, entries, sessions } = data,
    prefs = data.prefs || defaultPreferences;
  const editBook = (book = newBook()) => setEditor({ type: "book", book }),
    editEntry = (entry: Entry) => setEditor({ type: "entry", entry });
  const ctx = {
    books,
    entries,
    sessions,
    prefs,
    editBook,
    editEntry,
    editSession: (book: Book, session?: ReadingSession) =>
      setEditor({ type: "session", book, session }),
    execute,
    notify,
  };
  return (
    <>
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <Link to="/" className="brand">
          <div className="brand-icon">
            <BookOpen />
          </div>
          <span>
            THE GROWTH
            <br />
            <b>LIBRARY</b>
          </span>
        </Link>
        <p className="nav-label">VOTRE ESPACE PERSONNEL</p>
        <nav>
          {nav.map(([url, label, Icon]) => (
            <NavLink
              end={url === "/"}
              to={url}
              key={url}
              onClick={() => setMenu(false)}
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Read. Think.
            <br />
            <em>Apply. Grow.</em>
          </p>
          <small>
            Un peu chaque jour.
            <br />
            Une différence pour demain.
          </small>
          <div className="profile">
            <span>{(prefs.name || "M").slice(0, 1).toUpperCase()}</span>
            <div>
              <b>{prefs.name || "Mon espace"}</b>
              <small>Bibliothèque personnelle</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span className="top-quote">
            Les idées prennent vie quand on les applique.
          </span>
          <button
            className="mobile-menu"
            aria-label="Menu"
            onClick={() => setMenu(!menu)}
          >
            <Menu />
          </button>
          <div className="top-actions">
            <span className="local-indicator">● Stockage sur cet appareil</span>
            <button
              aria-label="Changer de thème"
              onClick={() =>
                execute(() =>
                  db.preferences.put({
                    ...prefs,
                    theme: prefs.theme === "dark" ? "light" : "dark",
                  }),
                )
              }
            >
              {prefs.theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button
              className="primary small"
              onClick={() => setEditor({ type: "capture" })}
            >
              <Plus size={17} /> Capture rapide
            </button>
          </div>
        </header>
        <main>
          <Suspense
            fallback={<div className="loading">Ouverture de cet espace…</div>}
          >
            <Routes>
              <Route path="/" element={<Dashboard {...ctx} />} />
              <Route path="/library" element={<LibraryPage {...ctx} />} />
              <Route
                path="/reading"
                element={<LibraryPage {...ctx} reading />}
              />
              <Route path="/books/:id" element={<BookDetail {...ctx} />} />
              <Route
                path="/ideas"
                element={<EntriesPage {...ctx} kind="idea" />}
              />
              <Route
                path="/actions"
                element={<EntriesPage {...ctx} kind="action" />}
              />
              <Route path="/progress" element={<ProgressPage {...ctx} />} />
              <Route path="/vision" element={<VisionPage {...ctx} />} />
              <Route path="/settings" element={<SettingsPage {...ctx} />} />
              <Route
                path="*"
                element={
                  <>
                    <h1>Page introuvable</h1>
                    <Link to="/">Retour à l’accueil</Link>
                  </>
                }
              />
            </Routes>
          </Suspense>
          <footer>
            THE GROWTH LIBRARY <span>Read. Think. Apply. Grow.</span>
          </footer>
        </main>
      </div>
      <nav className="bottom-nav">
        {nav
          .filter((_, i) => [0, 1, 3, 4].includes(i))
          .map(([url, label, Icon]) => (
            <NavLink end={url === "/"} to={url} key={url}>
              <Icon size={21} />
              <span>{label.replace("Ma ", "").replace("Mes ", "")}</span>
            </NavLink>
          ))}
        <button aria-label="Plus de sections" onClick={() => setMenu(!menu)}>
          <Menu size={21} />
          <span>Menu</span>
        </button>
      </nav>
      {editor && (
        <Modal
          title={
            editor.type === "book"
              ? "Votre livre"
              : editor.type === "session"
                ? "Session de lecture"
                : editor.type === "capture"
                  ? "Capturer une découverte"
                  : `Enregistrer · ${{ idea: "idée", quote: "citation", reflection: "réflexion", action: "action", goal: "objectif", project: "projet", focus: "focus", monthly: "bilan", activity: "activité", review: "révision" }[editor.entry.kind]}`
          }
          close={() => setEditor(undefined)}
        >
          {editor.type === "book" ? (
            <BookForm
              book={editor.book}
              categories={[
                ...new Set([
                  ...prefs.categories,
                  ...books.map((b) => b.category).filter(Boolean),
                ]),
              ]}
              done={() => {
                setEditor(undefined);
                notify();
              }}
            />
          ) : editor.type === "entry" ? (
            <EntryForm
              key={editor.entry.id}
              entry={editor.entry}
              books={books}
              entries={entries}
              done={() => {
                setEditor(undefined);
                notify();
              }}
            />
          ) : editor.type === "session" ? (
            <SessionForm
              book={editor.book}
              session={editor.session}
              done={() => {
                setEditor(undefined);
                notify();
              }}
            />
          ) : (
            <div className="capture-grid">
              {(["idea", "quote", "reflection", "action"] as const).map(
                (k, i) => (
                  <button key={k} onClick={() => editEntry(newEntry(k))}>
                    <Plus />{" "}
                    {
                      [
                        "Une idée",
                        "Une citation",
                        "Une réflexion",
                        "Une action",
                      ][i]
                    }
                    <ArrowUpRight />
                  </button>
                ),
              )}
              <h3>Mettre à jour une lecture</h3>
              {books.length ? (
                books.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setEditor({ type: "session", book: b })}
                  >
                    {b.title}
                    <ArrowRight />
                  </button>
                ))
              ) : (
                <button onClick={() => editBook()}>
                  Ajouter votre premier livre
                </button>
              )}
            </div>
          )}
        </Modal>
      )}
      {!prefs.initialized && (
        <Modal
          title="Votre prochain chapitre commence ici."
          close={() => void 0}
        >
          <p>
            Une bibliothèque pour lire avec intention, conserver vos découvertes
            et leur donner vie.
          </p>
          <div className="onboarding-mark">
            <BookOpen size={50} />
            <h2>Read. Think. Apply. Grow.</h2>
          </div>
          <button
            className="primary full"
            onClick={() => execute(() => initialize(false))}
          >
            Commencer avec une bibliothèque vide
          </button>
          <button
            className="full"
            onClick={() => execute(() => initialize(true))}
          >
            Explorer avec les exemples modifiables
          </button>
          <p className="muted">
            Vos données restent sur cet appareil. Aucun compte ni
            synchronisation cloud. Exportez régulièrement une sauvegarde.
          </p>
        </Modal>
      )}
      {failure && (
        <Modal
          title="Une opération n’a pas abouti"
          close={() => setFailure("")}
        >
          <p role="alert">{failure}</p>
          <button onClick={() => setFailure("")}>Compris</button>
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <CheckCheck size={18} />
          {toast}
        </div>
      )}
    </>
  );
}
