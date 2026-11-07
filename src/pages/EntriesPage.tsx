import { Plus, Search } from "lucide-react";
import { useState } from "react";
import type { Context } from "../context";
import { newEntry } from "../db/schema";
import { EntryCards, PageHeader } from "./shared";
export default function EntriesPage(c: Context & { kind: "idea" | "action" }) {
  const [query, q] = useState(""),
    [book, b] = useState(""),
    [importance, i] = useState(""),
    [category, cat] = useState(""),
    [mode, m] = useState("all"),
    [view, v] = useState("list"),
    [reverse, r] = useState(false);
  const all = c.entries.filter((e) => e.kind === c.kind),
    items = all
      .filter(
        (e) =>
          `${e.title} ${e.text}`.toLowerCase().includes(query.toLowerCase()) &&
          (!book || e.bookId === book) &&
          (!importance || e.importance === importance) &&
          (!category ||
            e.categories.toLowerCase().includes(category.toLowerCase())) &&
          (mode !== "favorite" || e.favorite) &&
          (mode !== "review" || !!e.reviewDate),
      )
      .sort((a, b) =>
        reverse
          ? a.createdAt.localeCompare(b.createdAt)
          : b.createdAt.localeCompare(a.createdAt),
      );
  return (
    <>
      <PageHeader
        eyebrow={
          c.kind === "idea" ? "CONSERVER CE QUI COMPTE" : "DU SAVOIR À L’ACTION"
        }
        title={c.kind === "idea" ? "Mes idées" : "Mes actions"}
        description={
          c.kind === "idea"
            ? "Votre savoir, relié et prêt à être retrouvé."
            : "Donnez une suite concrète à ce que vous apprenez."
        }
      >
        <button
          className="primary"
          onClick={() => c.editEntry(newEntry(c.kind))}
        >
          <Plus size={18} />{" "}
          {c.kind === "idea" ? "Nouvelle idée" : "Nouvelle action"}
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            aria-label="Rechercher"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => q(e.target.value)}
          />
        </div>
        <select
          aria-label="Livre"
          value={book}
          onChange={(e) => b(e.target.value)}
        >
          <option value="">Tous les livres</option>
          {c.books.map((b) => (
            <option value={b.id} key={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Importance"
          value={importance}
          onChange={(e) => i(e.target.value)}
        >
          <option value="">Toutes les priorités</option>
          {["Faible", "Moyenne", "Élevée"].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input
          aria-label="Catégorie"
          placeholder="Catégorie"
          value={category}
          onChange={(e) => cat(e.target.value)}
        />
        <button onClick={() => r(!reverse)}>
          {reverse ? "Plus anciennes" : "Plus récentes"}
        </button>
        {c.kind === "idea" ? (
          <select
            aria-label="Sélection d’idées"
            value={mode}
            onChange={(e) => m(e.target.value)}
          >
            <option value="all">Toutes les idées</option>
            <option value="favorite">Favoris</option>
            <option value="review">À revoir</option>
          </select>
        ) : (
          <button onClick={() => v(view === "list" ? "board" : "list")}>
            {view === "list" ? "Vue tableau" : "Vue liste"}
          </button>
        )}
      </div>
      {view === "board" ? (
        <div className="kanban">
          {["À faire", "En cours", "Terminée", "Abandonnée"].map((status) => (
            <section key={status}>
              <h3>
                {status} · {items.filter((e) => e.status === status).length}
              </h3>
              <EntryCards
                {...c}
                items={items.filter((e) => e.status === status)}
              />
            </section>
          ))}
        </div>
      ) : (
        <EntryCards {...c} items={items} />
      )}
    </>
  );
}
