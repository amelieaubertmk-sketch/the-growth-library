import { ArrowUpRight, BookOpen, Pencil, Star, Trash2 } from "lucide-react";
import { type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Field } from "../components/Forms";
import { Empty } from "../components/UI";
import type { Context } from "../context";
import { deleteEntry, saveEntry } from "../db";
import { newEntry, type Entry } from "../db/schema";
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function EntryCards(c: Context & { items: Entry[] }) {
  const navigate = useNavigate();
  return c.items.length ? (
    <div className="entry-grid">
      {c.items.map((e) => (
        <article className="entry-card" key={e.id}>
          <div className="row">
            <span className="eyebrow">
              {e.demo ? "EXEMPLE MODIFIABLE" : e.categories || e.importance}
            </span>
            <div className="icon-actions">
              {e.kind === "idea" && (
                <button
                  aria-label="Favori"
                  onClick={() =>
                    c.execute(() => saveEntry({ ...e, favorite: !e.favorite }))
                  }
                >
                  <Star size={17} fill={e.favorite ? "currentColor" : "none"} />
                </button>
              )}
              <button
                aria-label={`Modifier ${e.title}`}
                onClick={() => c.editEntry(e)}
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label={`Supprimer ${e.title}`}
                onClick={() => {
                  if (
                    confirm(
                      "Supprimer cet élément ? Les liens associés seront retirés.",
                    )
                  )
                    void c.execute(() => deleteEntry(e));
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <h3>{e.title}</h3>
          <p className="preserve">{e.text}</p>
          {e.bookId && (
            <Link className="origin" to={`/books/${e.bookId}`}>
              <BookOpen size={15} />
              {c.books.find((b) => b.id === e.bookId)?.title}
            </Link>
          )}
          {e.ideaId && (
            <button
              className="origin text-button"
              onClick={() => {
                navigate("/ideas");
                const idea = c.entries.find((i) => i.id === e.ideaId);
                if (idea) c.editEntry(idea);
              }}
            >
              Idée d’origine : {c.entries.find((i) => i.id === e.ideaId)?.title}
            </button>
          )}
          <div className="chips">
            {e.projectIds.map((id) => (
              <span className="badge" key={id}>
                {c.entries.find((p) => p.id === id)?.title}
              </span>
            ))}
            {e.page && <span className="badge">Page {e.page}</span>}
            {e.chapter && <span className="badge">{e.chapter}</span>}
          </div>
          {e.kind === "action" && (
            <>
              <Field label="Statut">
                <select
                  value={e.status}
                  onChange={(ev) => {
                    const updated = { ...e, status: ev.target.value };
                    void c.execute(() => saveEntry(updated));
                    if (updated.status === "Terminée") c.editEntry(updated);
                  }}
                >
                  {["À faire", "En cours", "Terminée", "Abandonnée"].map(
                    (s) => (
                      <option key={s}>{s}</option>
                    ),
                  )}
                </select>
              </Field>
              {e.dueDate && <small>Échéance : {e.dueDate}</small>}
              {Object.entries(e.result)
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <p key={k}>
                    <b>{k} : </b>
                    {v}
                  </p>
                ))}
              {e.status === "Terminée" && (
                <button
                  onClick={() =>
                    c.editEntry({
                      ...newEntry("action"),
                      bookId: e.bookId,
                      ideaId: e.ideaId,
                      projectIds: e.projectIds,
                      title: `Suite : ${e.title}`,
                    })
                  }
                >
                  Créer une action complémentaire
                </button>
              )}
            </>
          )}
          {e.kind === "idea" && (
            <>
              <button
                className="sub-link"
                onClick={() =>
                  c.editEntry({
                    ...newEntry("action"),
                    bookId: e.bookId,
                    ideaId: e.id,
                    projectIds: e.projectIds,
                  })
                }
              >
                Transformer en action <ArrowUpRight size={15} />
              </button>
              {c.entries
                .filter((a) => a.kind === "action" && a.ideaId === e.id)
                .map((a) => (
                  <button
                    className="origin"
                    key={a.id}
                    onClick={() => c.editEntry(a)}
                  >
                    Action : {a.title}
                  </button>
                ))}
              {e.reviewDate && (
                <div className="review">
                  <small>À revoir le {e.reviewDate}</small>
                  <button
                    onClick={() =>
                      c.execute(async () => {
                        await saveEntry({
                          ...newEntry("review"),
                          ideaId: e.id,
                          title: `Revue : ${e.title}`,
                        });
                        await saveEntry({ ...e, reviewDate: "" });
                      })
                    }
                  >
                    Revue
                  </button>
                  <button
                    onClick={() =>
                      c.execute(() =>
                        saveEntry({
                          ...e,
                          reviewDate: new Date(Date.now() + 7 * 864e5)
                            .toISOString()
                            .slice(0, 10),
                        }),
                      )
                    }
                  >
                    + 7 jours
                  </button>
                </div>
              )}
            </>
          )}
          {e.kind === "goal" && (
            <>
              <progress value={e.progress} max="100" />
              <small>
                {e.progress} % · {e.status} {e.dueDate && `· ${e.dueDate}`}
              </small>
              {e.bookIds.map((id) => (
                <Link key={id} className="origin" to={`/books/${id}`}>
                  {c.books.find((b) => b.id === id)?.title}
                </Link>
              ))}
              {e.actionIds.map((id) => (
                <button
                  className="origin"
                  key={id}
                  onClick={() => {
                    const a = c.entries.find((a) => a.id === id);
                    if (a) c.editEntry(a);
                  }}
                >
                  {c.entries.find((a) => a.id === id)?.title}
                </button>
              ))}
            </>
          )}
          <small className="entry-date">
            {new Date(e.createdAt).toLocaleDateString("fr")}
          </small>
        </article>
      ))}
    </div>
  ) : (
    <Empty />
  );
}
