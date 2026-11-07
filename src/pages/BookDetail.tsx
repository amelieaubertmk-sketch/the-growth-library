import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Field } from "../components/Forms";
import { Cover, Empty } from "../components/UI";
import type { Context } from "../context";
import { db, deleteBook, saveBook } from "../db";
import { newEntry, type Book, type Entry } from "../db/schema";
import { progress } from "../utils/statistics";
import { EntryCards } from "./shared";
const assessmentFields = [
  "Ce que j’ai préféré",
  "Ce que j’ai moins aimé",
  "Les trois enseignements essentiels",
  "Ce qui a changé dans ma manière de penser",
  "Ce que je veux appliquer",
  "Ce que je recommande ou non",
];
export default function BookDetail(c: Context) {
  const { id } = useParams(),
    [tab, t] = useState("overview"),
    [query, setQuery] = useState(""),
    [importance, setImportance] = useState("");
  const book = c.books.find((b) => b.id === id);
  if (!book)
    return (
      <Empty text="Ce livre n’existe plus. Retrouvez votre bibliothèque depuis le menu." />
    );
  const b = book,
    related = c.entries.filter((e) => e.bookId === b.id),
    tabs = [
      ["overview", "Vue d’ensemble"],
      ["idea", "Mes idées clés"],
      ["quote", "Mes citations"],
      ["reflection", "Mes réflexions"],
      ["action", "Mes applications"],
      ["assessment", "Mon bilan"],
    ];
  return (
    <>
      <Link className="back-link" to="/library">
        ← Ma bibliothèque
      </Link>
      <section className="book-detail-header">
        <Cover book={b} large />
        <div>
          <span className="eyebrow">{b.category || "MA BIBLIOTHÈQUE"}</span>
          <h1>{b.title}</h1>
          <p className="book-author">{b.author}</p>
          <div className="chips">
            <span className="badge">{b.status}</span>
            <span className="badge">
              {b.rating ? `${b.rating} / 5` : "Non noté"}
            </span>
            {b.tags && <span className="badge">{b.tags}</span>}
          </div>
          <p>
            {b.startDate && `Commencé le ${b.startDate}`}{" "}
            {b.endDate && ` · Terminé le ${b.endDate}`}
          </p>
          <div className="progress-label">
            <span>
              {b.pages
                ? `${b.currentPage} / ${b.pages} pages`
                : "Progression non renseignée"}
            </span>
            <b>{b.pages ? `${progress(b.currentPage, b.pages)} %` : ""}</b>
          </div>
          <progress value={progress(b.currentPage, b.pages)} max="100" />
          <div className="button-row">
            <button className="primary" onClick={() => c.editSession(b)}>
              <Plus size={17} /> Enregistrer une session
            </button>
            <button onClick={() => c.editBook(b)}>
              <Pencil size={16} /> Modifier le livre
            </button>
            <button
              aria-label="Supprimer le livre"
              onClick={() => {
                if (
                  confirm(
                    "Supprimer ce livre et ses sessions ? Vos notes seront conservées sans lien au livre.",
                  )
                )
                  void c.execute(() => deleteBook(b.id));
              }}
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </section>
      <div className="tabs" role="tablist">
        {tabs.map(([key, label]) => (
          <button
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "active" : ""}
            key={key}
            onClick={() => t(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "overview" ? (
        <div className="detail-grid">
          <section className="panel">
            <h2>À propos de cette lecture</h2>
            <p className="preserve">
              {b.description ||
                "Ajoutez votre description personnelle depuis « Modifier le livre »."}
            </p>
            <h3>Mon résumé personnel</h3>
            <LongNote
              key={b.id}
              initial={b.summary}
              save={async (summary) => {
                await db.books.update(b.id, {
                  summary,
                  updatedAt: new Date().toISOString(),
                });
              }}
              notify={c.notify}
            />
            <h3>Mettre à jour ma progression</h3>
            <form
              className="button-row"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                void c.execute(() =>
                  saveBook({ ...b, currentPage: Number(form.get("page")) }),
                );
              }}
            >
              <Field label="Page actuelle">
                <input
                  name="page"
                  type="number"
                  min="0"
                  max={b.pages}
                  defaultValue={b.currentPage}
                  key={b.currentPage}
                />
              </Field>
              <button className="primary">Enregistrer la progression</button>
            </form>
            <p className="muted">
              Une mise à jour manuelle ne crée pas de session ni de durée
              fictive.
            </p>
          </section>
          <section className="panel">
            <h2>Mes sessions de lecture</h2>
            {c.sessions
              .filter((s) => s.bookId === b.id)
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((s) => (
                <div className="session" key={s.id}>
                  <div>
                    <b>
                      {new Date(s.date + "T12:00:00").toLocaleDateString("fr")}
                    </b>
                    <p>
                      Pages {s.from} → {s.to}
                      {s.duration !== null ? ` · ${s.duration} min` : ""}
                    </p>
                    <small>
                      {s.chapter} {s.note}
                    </small>
                  </div>
                  <button
                    aria-label="Corriger la session"
                    onClick={() => c.editSession(b, s)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    aria-label="Supprimer la session"
                    onClick={() => {
                      if (
                        confirm(
                          "Supprimer cette session ? La page actuelle restera inchangée.",
                        )
                      )
                        void c.execute(() => db.sessions.delete(s.id));
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            {!c.sessions.some((s) => s.bookId === b.id) && (
              <Empty text="Enregistrez une session pour suivre votre lecture réelle." />
            )}
          </section>
        </div>
      ) : tab === "assessment" ? (
        <section className="panel">
          <h2>Ce que cette lecture a changé</h2>
          <Assessment key={b.id} book={b} notify={c.notify} />
        </section>
      ) : (
        <>
          <div className="section-heading">
            <h2>{tabs.find(([key]) => key === tab)?.[1]}</h2>
            <button
              className="primary"
              onClick={() =>
                c.editEntry({ ...newEntry(tab as Entry["kind"]), bookId: b.id })
              }
            >
              <Plus size={17} /> Ajouter
            </button>
          </div>
          <div className="toolbar">
            <input
              aria-label="Rechercher dans les notes du livre"
              placeholder="Rechercher une note…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {tab === "idea" && (
              <select
                aria-label="Importance des idées du livre"
                value={importance}
                onChange={(e) => setImportance(e.target.value)}
              >
                <option value="">Toutes les importances</option>
                {["Faible", "Moyenne", "Élevée"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            )}
          </div>
          <EntryCards
            {...c}
            items={related.filter(
              (e) =>
                e.kind === tab &&
                `${e.title} ${e.text}`
                  .toLowerCase()
                  .includes(query.toLowerCase()) &&
                (tab !== "idea" || !importance || e.importance === importance),
            )}
          />
        </>
      )}
    </>
  );
}
function LongNote({
  initial,
  save,
  notify,
}: {
  initial: string;
  save: (s: string) => Promise<unknown>;
  notify: (s?: string) => void;
}) {
  const [text, set] = useState(initial),
    [status, s] = useState("");
  useEffect(() => {
    if (text === initial) return;
    const timer = setTimeout(() => {
      s("Sauvegarde…");
      void save(text)
        .then(() => s("Sauvegardé"))
        .catch(() => s("Échec de sauvegarde : réessayez avec le bouton."));
    }, 900);
    return () => clearTimeout(timer);
  }, [text]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (text !== initial) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [text, initial]);
  return (
    <>
      <textarea
        aria-label="Résumé personnel"
        onBlur={() => {
          if (text !== initial)
            void save(text)
              .then(() => s("Sauvegardé"))
              .catch(() => s("Sauvegarde impossible : réessayez."));
        }}
        rows={8}
        value={text}
        onChange={(e) => set(e.target.value)}
      />
      <div className="row">
        <small role="status">
          {status || "Sauvegarde automatique après saisie"}
        </small>
        <button
          onClick={() =>
            void save(text)
              .then(() => notify())
              .catch(() => s("Sauvegarde impossible"))
          }
        >
          Sauvegarder maintenant
        </button>
      </div>
    </>
  );
}
function Assessment({
  book,
  notify,
}: {
  book: Book;
  notify: (s?: string) => void;
}) {
  const [values, set] = useState(book.assessment),
    [rating, r] = useState(book.rating),
    [error, e] = useState("");
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        void saveBook({ ...book, assessment: values, rating })
          .then(() => notify())
          .catch(() => e("Sauvegarde impossible. Réessayez."));
      }}
    >
      {assessmentFields.map((k) => (
        <Field key={k} label={k}>
          <textarea
            rows={3}
            value={values[k] || ""}
            onChange={(e) => set({ ...values, [k]: e.target.value })}
          />
        </Field>
      ))}
      <Field label="Ma note sur 5">
        <input
          type="number"
          min="0"
          max="5"
          value={rating}
          onChange={(e) => r(Number(e.target.value))}
        />
      </Field>
      {error && <p role="alert">{error}</p>}
      <button className="primary">Enregistrer mon bilan</button>
    </form>
  );
}
