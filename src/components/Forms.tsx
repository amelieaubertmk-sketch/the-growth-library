import { X } from "lucide-react";
import {
  cloneElement,
  isValidElement,
  useId,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { saveBook, saveEntry, saveSession } from "../db";
import type { Book, Entry, ReadingSession } from "../db/schema";
import { BOOK_STATUSES, stamp } from "../db/schema";
export function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const [dirty, setDirty] = useState(false);
  const requestClose = () => {
    if (dirty && !confirm("Fermer sans enregistrer les modifications ?"))
      return;
    close();
  };
  return (
    <dialog
      open
      onChangeCapture={() => setDirty(true)}
      ref={(el) => {
        if (el && !el.hasAttribute("data-modal")) {
          el.close();
          el.showModal();
          el.setAttribute("data-modal", "true");
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button aria-label="Fermer" onClick={requestClose}>
          <X size={20} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}
export function BookForm({
  book,
  done,
  categories = [],
}: {
  book: Book;
  done: () => void;
  categories?: string[];
}) {
  const [b, set] = useState(book),
    [businessText, setBusinessText] = useState(
      book.businesses?.join(", ") || "",
    ),
    [error, err] = useState("");
  const patch = (key: keyof Book, value: string | number) =>
    set((p) => ({ ...p, [key]: value }));
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await saveBook(b);
          done();
        } catch (e) {
          err(e instanceof Error ? e.message : "Sauvegarde impossible");
        }
      }}
    >
      <datalist id="book-categories">
        {categories.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <div className="form-grid">
        {(
          ["title", "author", "isbn", "category", "tags", "cover"] as const
        ).map((key, i) => (
          <Field
            key={key}
            label={
              [
                "Titre *",
                "Auteur",
                "ISBN",
                "Catégorie",
                "Étiquettes",
                "URL de couverture",
              ][i]
            }
          >
            <input
              list={key === "category" ? "book-categories" : undefined}
              required={key === "title"}
              value={b[key]}
              onChange={(e) => patch(key, e.target.value)}
            />
          </Field>
        ))}
        <Field label="Image locale (max. 3 Mo)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 3e6) {
                  err("Image trop volumineuse (3 Mo maximum).");
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => patch("cover", String(reader.result));
                reader.readAsDataURL(f);
              }
            }}
          />
        </Field>
        <Field label="Statut">
          <select
            value={b.status}
            onChange={(e) => patch("status", e.target.value)}
          >
            {BOOK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        {(["pages", "currentPage", "rating"] as const).map((k, i) => (
          <Field
            key={k}
            label={
              ["Total de pages (0 = inconnu)", "Page actuelle", "Note sur 5"][i]
            }
          >
            <input
              type="number"
              min="0"
              max={k === "rating" ? 5 : undefined}
              value={b[k]}
              onChange={(e) =>
                set((p) => ({
                  ...p,
                  [k]: Number(e.target.value),
                  ...(k === "pages"
                    ? {
                        currentPage: Math.min(
                          p.currentPage,
                          Number(e.target.value),
                        ),
                      }
                    : {}),
                }))
              }
            />
          </Field>
        ))}
        {(["startDate", "endDate"] as const).map((k, i) => (
          <Field label={i ? "Fin de lecture" : "Début de lecture"} key={k}>
            <input
              type="date"
              value={b[k]}
              onChange={(e) => patch(k, e.target.value)}
            />
          </Field>
        ))}
      </div>
      <details className="reading-objectives">
        <summary>Objectifs et priorité de lecture</summary>
        <div className="form-grid">
          <Field label="Priorité de lecture">
            <select
              value={b.priority || ""}
              onChange={(e) =>
                set((previous) => ({
                  ...previous,
                  priority: (e.target.value || undefined) as Book["priority"],
                }))
              }
            >
              <option value="">Non renseignée</option>
              {["Haute", "Moyenne", "Basse"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Compétence à développer">
            <input
              value={b.skill || ""}
              onChange={(e) => patch("skill", e.target.value)}
            />
          </Field>
          <Field label="Entreprises concernées (séparées par des virgules)">
            <input
              value={businessText}
              onChange={(e) => {
                setBusinessText(e.target.value);
                set((previous) => ({
                  ...previous,
                  businesses: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                }));
              }}
            />
          </Field>
        </div>
        <Field label="Objectif personnel de lecture">
          <textarea
            value={b.learningObjective || ""}
            onChange={(e) => patch("learningObjective", e.target.value)}
          />
        </Field>
      </details>
      <Field label="Description">
        <textarea
          value={b.description}
          onChange={(e) => patch("description", e.target.value)}
        />
      </Field>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary">Enregistrer le livre</button>
    </form>
  );
}
export function EntryForm({
  entry,
  books,
  entries,
  done,
}: {
  entry: Entry;
  books: Book[];
  entries: Entry[];
  done: () => void;
}) {
  const [v, set] = useState(entry),
    [error, err] = useState("");
  const p = (k: keyof Entry, value: unknown) =>
    set((x) => ({ ...x, [k]: value }));
  const action = v.kind === "action",
    goal = v.kind === "goal";
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await saveEntry(v);
          done();
        } catch {
          err(
            "Enregistrement impossible. Vérifiez les champs et le stockage disponible.",
          );
        }
      }}
    >
      <Field label={v.kind === "quote" ? "Citation *" : "Titre *"}>
        {v.kind === "quote" ? (
          <textarea
            required
            value={v.title}
            onChange={(e) => p("title", e.target.value)}
          />
        ) : (
          <input
            required
            value={v.title}
            onChange={(e) => p("title", e.target.value)}
          />
        )}
      </Field>
      <Field label={action ? "Description" : "Texte personnel"}>
        <textarea
          rows={5}
          value={v.text}
          onChange={(e) => p("text", e.target.value)}
        />
      </Field>
      {action && (
        <Field label="Résultat attendu">
          <textarea
            value={v.result["Résultat attendu"] || ""}
            onChange={(e) =>
              p("result", { ...v.result, "Résultat attendu": e.target.value })
            }
          />
        </Field>
      )}
      <div className="form-grid">
        <Field label="Livre associé">
          <select
            value={v.bookId}
            onChange={(e) => p("bookId", e.target.value)}
          >
            <option value="">Indépendant</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </Field>
        {action && (
          <Field label="Idée d’origine">
            <select
              value={v.ideaId}
              onChange={(e) => {
                const idea = entries.find((x) => x.id === e.target.value);
                set((x) => ({
                  ...x,
                  ideaId: e.target.value,
                  bookId: idea?.bookId || x.bookId,
                }));
              }}
            >
              <option value="">Aucune</option>
              {entries
                .filter((x) => x.kind === "idea")
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
            </select>
          </Field>
        )}
        <Field label="Projets (sélection multiple)">
          <select
            multiple
            value={v.projectIds}
            onChange={(e) =>
              p(
                "projectIds",
                Array.from(e.target.selectedOptions, (x) => x.value),
              )
            }
          >
            {entries
              .filter((x) => x.kind === "project")
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.title}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Catégories">
          <input
            value={v.categories}
            onChange={(e) => p("categories", e.target.value)}
          />
        </Field>
        <Field label="Importance / priorité">
          <select
            value={v.importance}
            onChange={(e) => p("importance", e.target.value)}
          >
            {["Faible", "Moyenne", "Élevée"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        {(action || goal || v.kind === "focus") && (
          <>
            <Field label="Statut">
              <select
                value={v.status}
                onChange={(e) => p("status", e.target.value)}
              >
                {["À faire", "En cours", "Terminée", "Abandonnée"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Échéance">
              <input
                type="date"
                value={v.dueDate}
                onChange={(e) => p("dueDate", e.target.value)}
              />
            </Field>
          </>
        )}
        {!action && (
          <>
            <Field label="Page">
              <input
                value={v.page}
                onChange={(e) => p("page", e.target.value)}
              />
            </Field>
            <Field label="Chapitre">
              <input
                value={v.chapter}
                onChange={(e) => p("chapter", e.target.value)}
              />
            </Field>
            <Field label="Étiquettes">
              <input
                value={v.tags}
                onChange={(e) => p("tags", e.target.value)}
              />
            </Field>
          </>
        )}
        {v.kind === "idea" && (
          <Field label="À revoir le">
            <input
              type="date"
              value={v.reviewDate}
              onChange={(e) => p("reviewDate", e.target.value)}
            />
          </Field>
        )}
        {goal && (
          <>
            <Field label="Progression manuelle (%)">
              <input
                type="number"
                min="0"
                max="100"
                value={v.progress}
                onChange={(e) => p("progress", Number(e.target.value))}
              />
            </Field>
            <Field label="Livres liés">
              <select
                multiple
                value={v.bookIds}
                onChange={(e) =>
                  p(
                    "bookIds",
                    Array.from(e.target.selectedOptions, (x) => x.value),
                  )
                }
              >
                {books.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Actions liées">
              <select
                multiple
                value={v.actionIds}
                onChange={(e) =>
                  p(
                    "actionIds",
                    Array.from(e.target.selectedOptions, (x) => x.value),
                  )
                }
              >
                {entries
                  .filter((x) => x.kind === "action")
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.title}
                    </option>
                  ))}
              </select>
            </Field>
          </>
        )}
      </div>
      {action && (
        <fieldset>
          <legend>Bilan de l’action</legend>
          {[
            "Réalisation",
            "Résultat obtenu",
            "Ce qui a fonctionné",
            "Difficultés",
            "À faire différemment",
          ].map((key) => (
            <Field key={key} label={key}>
              <textarea
                value={v.result[key] || ""}
                onChange={(e) =>
                  p("result", { ...v.result, [key]: e.target.value })
                }
              />
            </Field>
          ))}
        </fieldset>
      )}
      {error && <p role="alert">{error}</p>}
      <button className="primary">Enregistrer</button>
    </form>
  );
}
export function SessionForm({
  book,
  session,
  done,
}: {
  book: Book;
  session?: ReadingSession;
  done: () => void;
}) {
  const [v, set] = useState<ReadingSession>(
      session || {
        ...stamp(),
        bookId: book.id,
        date: new Date().toISOString().slice(0, 10),
        from: book.currentPage,
        to: book.currentPage,
        duration: null,
        chapter: "",
        note: "",
      },
    ),
    [error, err] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await saveSession(v);
          done();
        } catch (e) {
          err(e instanceof Error ? e.message : "Erreur");
        }
      }}
    >
      <Field label="Date">
        <input
          required
          type="date"
          value={v.date}
          onChange={(e) => set({ ...v, date: e.target.value })}
        />
      </Field>
      {(["from", "to", "duration"] as const).map((key, i) => (
        <Field
          key={key}
          label={
            [
              "Page de départ",
              "Page de fin",
              "Durée mesurée (minutes, facultatif)",
            ][i]
          }
        >
          <input
            type="number"
            min="0"
            max={key !== "duration" ? book.pages : undefined}
            required={key !== "duration"}
            value={v[key] ?? ""}
            onChange={(e) =>
              set({
                ...v,
                [key]: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </Field>
      ))}
      <Field label="Chapitre">
        <input
          value={v.chapter}
          onChange={(e) => set({ ...v, chapter: e.target.value })}
        />
      </Field>
      <Field label="Note rapide">
        <textarea
          value={v.note}
          onChange={(e) => set({ ...v, note: e.target.value })}
        />
      </Field>
      {error && <p role="alert">{error}</p>}
      <button className="primary">Enregistrer la session</button>
    </form>
  );
}
