import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { BookCard, Empty } from "../components/UI";
import type { Context } from "../context";
import { filterBooks } from "../utils/statistics";
import { PageHeader } from "./shared";
export default function LibraryPage(c: Context & { reading?: boolean }) {
  const [query, q] = useState(""),
    [status, s] = useState(""),
    [sort, ss] = useState("date"),
    [list, l] = useState(false);
  const books = filterBooks(
    c.reading
      ? c.books.filter((b) => ["En cours", "En pause"].includes(b.status))
      : c.books,
    query,
    status,
    sort,
  );
  return (
    <>
      <PageHeader
        eyebrow="LIRE AVEC INTENTION"
        title={c.reading ? "Mes lectures" : "Ma bibliothèque"}
        description="Les livres qui nourrissent votre prochaine évolution."
      >
        <button className="primary" onClick={() => c.editBook()}>
          <Plus size={18} /> Ajouter un livre
        </button>
      </PageHeader>
      <div className="toolbar">
        <div className="search">
          <Search size={18} />
          <input
            aria-label="Rechercher des livres"
            placeholder="Titre, auteur, catégorie…"
            value={query}
            onChange={(e) => q(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrer par statut"
          value={status}
          onChange={(e) => s(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {["À lire", "En cours", "Terminé", "En pause", "Abandonné"].map(
            (x) => (
              <option key={x}>{x}</option>
            ),
          )}
        </select>
        <select
          aria-label="Trier les livres"
          value={sort}
          onChange={(e) => ss(e.target.value)}
        >
          <option value="date">Ajout récent</option>
          <option value="title">Ordre alphabétique</option>
          <option value="progress">Progression</option>
          <option value="rating">Note personnelle</option>
        </select>
        <button onClick={() => l(!list)}>
          {list ? "Vue grille" : "Vue liste"}
        </button>
      </div>
      <p className="muted">
        {books.length} livre{books.length !== 1 ? "s" : ""}
      </p>
      {books.length ? (
        <div className={list ? "books-list" : "books-grid"}>
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      ) : (
        <Empty text="Ajoutez votre premier livre ou ajustez vos filtres." />
      )}
    </>
  );
}
