import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCheck,
  Library,
  Lightbulb,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Field } from "../components/Forms";
import { BookCard, Cover, Empty } from "../components/UI";
import type { Context } from "../context";
import { db, saveEntry } from "../db";
import { newEntry } from "../db/schema";
import { progress, statistics } from "../utils/statistics";
import { PageHeader } from "./shared";
export default function Dashboard(c: Context) {
  const stats = statistics(c.books, c.entries, c.sessions),
    reading = c.books.filter((b) => b.status === "En cours"),
    featured = reading.find((b) => b.id === c.prefs.featuredBook) || reading[0],
    ideas = c.entries
      .filter((e) => e.kind === "idea")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3),
    focus = c.entries.filter((e) => e.kind === "focus");
  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        title={`Bonjour${c.prefs.name ? `, ${c.prefs.name}` : ""}.`}
        description="Chaque lecture est une nouvelle possibilité de grandir."
      >
        <button className="primary" onClick={() => c.editBook()}>
          <Plus size={19} /> Ajouter un livre
        </button>
      </PageHeader>
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">VOTRE PROCHAIN CHAPITRE</span>
          <h2>
            Lire pour apprendre.
            <br />
            <em>Appliquer pour grandir.</em>
          </h2>
          <p>
            Un espace pour les livres qui vous inspirent,
            <br />
            les idées qui restent et les actions qui changent tout.
          </p>
          <Link to="/ideas">
            Explorer mes idées <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="book-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-book art-back">
            THINK
            <br />
            <i>deeply.</i>
          </div>
          <div className="art-book art-front">
            <span>THE GROWTH LIBRARY</span>
            <b>
              One idea.
              <br />A thousand
              <br />
              <i>possibilities.</i>
            </b>
            <small>READ · THINK · APPLY · GROW</small>
          </div>
          <span className="art-star">✦</span>
        </div>
      </section>
      <div className="stat-grid">
        {[
          [stats.reading, "Livres en cours", BookOpen, "lilac"],
          [stats.finished, "Livres terminés", Library, "sage"],
          [stats.ideas, "Idées enregistrées", Lightbulb, "peach"],
          [stats.done, "Actions réalisées", CheckCheck, "lilac"],
        ].map(([n, label, Icon, color]) => {
          const I = Icon as typeof BookOpen;
          return (
            <div className="stat" key={String(label)}>
              <span className={`stat-icon ${color}`}>
                <I size={22} />
              </span>
              <div>
                <strong>{String(n).padStart(2, "0")}</strong>
                <p>{String(label)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Ma lecture du moment</h2>
            <Link to="/reading">
              Mes lectures <ArrowUpRight size={16} />
            </Link>
          </div>
          {featured ? (
            <>
              <div className="featured">
                <Cover book={featured} large />
                <div>
                  <span className="eyebrow">
                    {featured.category || "En cours de découverte"}
                  </span>
                  <h2>{featured.title}</h2>
                  <p>{featured.author}</p>
                  <span className="badge">En cours</span>
                  <div className="progress-label">
                    <span>Votre progression</span>
                    <b>
                      {featured.pages
                        ? `${progress(featured.currentPage, featured.pages)} %`
                        : "Non renseignée"}
                    </b>
                  </div>
                  <progress
                    value={progress(featured.currentPage, featured.pages)}
                    max="100"
                  />
                  <small>
                    {featured.pages
                      ? `${featured.currentPage} sur ${featured.pages} pages`
                      : "Ajoutez le nombre de pages pour suivre votre progression."}
                  </small>
                  <p className="muted">
                    Dernière session :{" "}
                    {c.sessions
                      .filter((s) => s.bookId === featured.id)
                      .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ||
                      "aucune"}
                  </p>
                  <button
                    className="primary"
                    onClick={() => c.editSession(featured)}
                  >
                    Continuer ma lecture <ArrowRight size={16} />
                  </button>
                  <Link className="sub-link" to={`/books/${featured.id}`}>
                    Ouvrir la fiche
                  </Link>
                </div>
              </div>
              {reading.length > 1 && (
                <Field label="Mettre en avant">
                  <select
                    value={featured.id}
                    onChange={(e) =>
                      c.execute(() =>
                        db.preferences.put({
                          ...c.prefs,
                          featuredBook: e.target.value,
                        }),
                      )
                    }
                  >
                    {reading.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          ) : (
            <Empty text="Ajoutez un livre et passez-le au statut « En cours »." />
          )}
        </section>
        <section className="panel focus-panel">
          <div className="section-heading">
            <h2>Mon focus du moment</h2>
            <button
              aria-label="Ajouter un focus"
              onClick={() => c.editEntry(newEntry("focus"))}
            >
              <Plus size={19} />
            </button>
          </div>
          <p className="muted">De petites actions. De vrais progrès.</p>
          {focus.length ? (
            focus.map((f) => (
              <div className="focus-item" key={f.id}>
                <input
                  aria-label={`Terminer ${f.title}`}
                  type="checkbox"
                  checked={f.status === "Terminée"}
                  onChange={(e) =>
                    c.execute(() =>
                      saveEntry({
                        ...f,
                        status: e.target.checked ? "Terminée" : "À faire",
                      }),
                    )
                  }
                />
                <button
                  className={
                    f.status === "Terminée"
                      ? "struck text-button"
                      : "text-button"
                  }
                  onClick={() => c.editEntry(f)}
                >
                  {f.title}
                </button>
              </div>
            ))
          ) : (
            <p className="empty-inline">
              Quelle petite action souhaitez-vous accomplir aujourd’hui ?
            </p>
          )}
          <div className="focus-quote">
            « Le savoir ne prend de valeur
            <br />
            que lorsqu’il devient action. »
            <small>LA PHILOSOPHIE GROWTH LIBRARY</small>
          </div>
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Mes prochaines lectures</h2>
            <Link to="/library">
              Toute la bibliothèque <ArrowUpRight size={16} />
            </Link>
          </div>
          {c.books.some((b) =>
            ["À lire", "À lire prochainement"].includes(b.status),
          ) ? (
            <div className="next-books">
              {c.books
                .filter((b) =>
                  ["À lire", "À lire prochainement"].includes(b.status),
                )
                .slice(0, 4)
                .map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
            </div>
          ) : (
            <Empty text="Les prochaines découvertes de votre bibliothèque apparaîtront ici." />
          )}
        </section>
        <section className="panel">
          <div className="section-heading">
            <h2>Dernières idées</h2>
            <Link to="/ideas">
              <ArrowUpRight size={18} />
            </Link>
          </div>
          {ideas.length ? (
            ideas.map((e) => (
              <button
                className="idea-preview"
                key={e.id}
                onClick={() => c.editEntry(e)}
              >
                <span className="idea-dot">
                  <Lightbulb size={17} />
                </span>
                <div>
                  <b>{e.title}</b>
                  <small>
                    {c.books.find((b) => b.id === e.bookId)?.title ||
                      "Idée personnelle"}
                    {e.demo ? " · Exemple" : ""}
                  </small>
                </div>
                <ArrowUpRight size={16} />
              </button>
            ))
          ) : (
            <Empty text="Capturez une idée pour ne plus la perdre." />
          )}
        </section>
      </div>
      <section className="panel activity">
        <div className="section-heading">
          <h2>Votre chemin, une étape à la fois</h2>
          <span className="eyebrow">ACTIVITÉ RÉCENTE</span>
        </div>
        {c.entries
          .filter((e) => e.kind === "activity")
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 5)
          .map((e) => (
            <div className="activity-row" key={e.id}>
              <span className="activity-dot" />
              <span>{e.title}</span>
              <small>{new Date(e.createdAt).toLocaleDateString("fr")}</small>
            </div>
          ))}
        {!c.entries.some((e) => e.kind === "activity") && (
          <p className="muted">
            Votre histoire commence avec votre première action.
          </p>
        )}
      </section>
    </>
  );
}
