import { ArrowUpRight, BookOpen } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Book } from "../db/schema";
import { progress } from "../utils/statistics";
export function Cover({
  book,
  large = false,
}: {
  book: Book;
  large?: boolean;
}) {
  return (
    <div className={`cover ${large ? "large" : ""}`}>
      {book.cover && /^(https?:\/\/|data:image\/)/.test(book.cover) ? (
        <img
          src={book.cover}
          alt={`Couverture de ${book.title}`}
          onError={(e) => {
            e.currentTarget.hidden = true;
          }}
        />
      ) : null}
      <div>
        <BookOpen size={20} />
        <strong>{book.title}</strong>
        <small>{book.author}</small>
      </div>
    </div>
  );
}
export function Empty({
  text = "Cet espace attend vos premières découvertes.",
}: {
  text?: string;
}) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h3>Tout commence par une première page.</h3>
      <p>{text}</p>
    </div>
  );
}
export function BookCard({ book }: { book: Book }) {
  return (
    <Link className="book-card" to={`/books/${book.id}`}>
      <Cover book={book} />
      <div>
        <span className="eyebrow">{book.category || "Votre bibliothèque"}</span>
        <h3>{book.title}</h3>
        <p>{book.author || "Auteur non renseigné"}</p>
        <div className="row">
          <span className="badge">{book.status}</span>
          <ArrowUpRight size={18} />
        </div>
        {book.pages > 0 && (
          <>
            <progress
              value={progress(book.currentPage, book.pages)}
              max="100"
            />
            <small>
              {book.currentPage} / {book.pages} pages
            </small>
          </>
        )}
      </div>
    </Link>
  );
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main>
        <h1>Un problème est survenu.</h1>
        <p>
          Vos données locales sont conservées. Rechargez l’application pour
          réessayer.
        </p>
        <button onClick={() => location.reload()}>Recharger</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
