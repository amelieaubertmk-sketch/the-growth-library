import { Download, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Field } from "../components/Forms";
import type { Context } from "../context";
import { db, deleteEntry, addEntrepreneurialBooks } from "../db";
import { newEntry, type UserPreferences } from "../db/schema";
import {
  csv,
  download,
  exportData,
  restore,
  validateBackup,
} from "../services/backup";
import { PageHeader } from "./shared";
export function PreferencesForm({
  prefs,
  onlyGoals = false,
  notify,
}: {
  prefs: UserPreferences;
  onlyGoals?: boolean;
  notify: (s?: string) => void;
}) {
  const [v, set] = useState(prefs),
    [error, e] = useState("");
  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        void db.preferences
          .put(v)
          .then(() => notify())
          .catch(() => e("Préférences non enregistrées"));
      }}
    >
      {!onlyGoals && (
        <>
          <Field label="Nom d’affichage">
            <input
              value={v.name}
              onChange={(e) => set({ ...v, name: e.target.value })}
            />
          </Field>
          <Field label="Thème">
            <select
              value={v.theme}
              onChange={(e) =>
                set({ ...v, theme: e.target.value as "light" | "dark" })
              }
            >
              <option value="light">Clair</option>
              <option value="dark">Sombre</option>
            </select>
          </Field>
          <Field label="Préférences de lecture">
            <textarea
              value={v.readingPreference}
              onChange={(e) => set({ ...v, readingPreference: e.target.value })}
            />
          </Field>
          <Field label="Catégories (une par ligne)">
            <textarea
              value={v.categories.join("\n")}
              onChange={(e) =>
                set({ ...v, categories: e.target.value.split("\n") })
              }
            />
          </Field>
        </>
      )}
      {(["annualBooks", "monthlyPages", "monthlyActions"] as const).map(
        (key, i) => (
          <Field
            key={key}
            label={
              [
                "Livres à terminer par an",
                "Pages à lire par mois",
                "Actions à réaliser par mois",
              ][i]
            }
          >
            <input
              type="number"
              min="0"
              value={v[key]}
              onChange={(e) => set({ ...v, [key]: Number(e.target.value) })}
            />
          </Field>
        ),
      )}
      {error && <p role="alert">{error}</p>}
      <button className="primary">Enregistrer les préférences</button>
    </form>
  );
}
export default function SettingsPage(c: Context) {
  const [catalogMessage, setCatalogMessage] = useState(""),
    [catalogBusy, setCatalogBusy] = useState(false);
  const [pending, p] = useState<ReturnType<typeof validateBackup>>(),
    [error, e] = useState(""),
    [reset, r] = useState("");
  return (
    <>
      <PageHeader
        eyebrow="UN ESPACE À VOTRE IMAGE"
        title="Paramètres"
        description="Vos préférences et vos données, sous votre contrôle."
      />
      <div className="detail-grid">
        <section className="panel">
          <h2>Mon profil & mes préférences</h2>
          <PreferencesForm prefs={c.prefs} notify={c.notify} />
        </section>
        <div>
          <section className="panel">
            <h2>Bibliothèque entrepreneuriale</h2>
            <p>
              14 références en marketing, finance, management et stratégie.
              Ajout uniquement des livres absents, sans modifier vos livres,
              notes ou progressions. Les éditions non vérifiées restent sans
              ISBN, pagination ni couverture.
            </p>
            <button
              className="primary"
              disabled={catalogBusy}
              onClick={async () => {
                setCatalogBusy(true);
                try {
                  const result = await addEntrepreneurialBooks();
                  const message = `${result.added} livre(s) ajouté(s), ${result.skipped} déjà présent(s).`;
                  setCatalogMessage(message);
                  c.notify(message);
                } catch {
                  setCatalogMessage(
                    "L’ajout n’a pas abouti. Vos données existantes sont conservées. Réessayez.",
                  );
                } finally {
                  setCatalogBusy(false);
                }
              }}
            >
              {catalogBusy
                ? "Ajout en cours…"
                : "Ajouter les références absentes"}
            </button>
            <p role="status">{catalogMessage}</p>
            <small>
              Dans la bibliothèque, choisissez le tri « Parcours entrepreneurial
              » pour retrouver l’ordre conseillé, y compris vos deux premières
              lectures.
            </small>
          </section>
          <section className="panel storage-panel">
            <Download size={26} />
            <h2>Vos données vous appartiennent.</h2>
            <p>
              Stockées dans IndexedDB, sur ce navigateur et cet appareil. Elles
              ne sont pas synchronisées entre appareils. Un effacement du
              navigateur peut les supprimer : exportez régulièrement une
              sauvegarde JSON.
            </p>
            <button
              className="primary"
              onClick={() =>
                c.execute(async () =>
                  download(
                    JSON.stringify(await exportData(), null, 2),
                    `growth-library-${new Date().toISOString().slice(0, 10)}.json`,
                  ),
                )
              }
            >
              Exporter toutes mes données (JSON)
            </button>
            <div className="button-row">
              <button
                onClick={() =>
                  download(
                    csv([
                      ["Titre", "Auteur", "Statut", "Pages", "Page actuelle"],
                      ...c.books.map((b) => [
                        b.title,
                        b.author,
                        b.status,
                        String(b.pages),
                        String(b.currentPage),
                      ]),
                    ]),
                    "livres.csv",
                    "text/csv",
                  )
                }
              >
                Livres CSV
              </button>
              <button
                onClick={() =>
                  download(
                    csv([
                      ["Titre", "Statut", "Résultat attendu", "Résultats"],
                      ...c.entries
                        .filter((e) => e.kind === "action")
                        .map((a) => [
                          a.title,
                          a.status,
                          a.text,
                          JSON.stringify(a.result),
                        ]),
                    ]),
                    "actions.csv",
                    "text/csv",
                  )
                }
              >
                Actions CSV
              </button>
            </div>
            <Field label="Restaurer une sauvegarde JSON">
              <input
                type="file"
                accept=".json,application/json"
                onChange={async (ev) => {
                  try {
                    const f = ev.target.files?.[0];
                    if (f) {
                      if (f.size > 50e6) throw Error("Fichier trop volumineux");
                      p(validateBackup(JSON.parse(await f.text())));
                      e("");
                    }
                  } catch (err) {
                    e(
                      `Sauvegarde invalide : ${err instanceof Error ? err.message : "format inconnu"}`,
                    );
                  }
                  ev.target.value = "";
                }}
              />
            </Field>
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            {pending && (
              <div className="import-warning">
                <h3>
                  Restaurer {pending.books.length} livres et{" "}
                  {pending.entries.length} éléments ?
                </h3>
                <p>
                  Cette opération remplace toutes les données actuelles. Une
                  sauvegarde des données actuelles sera téléchargée avant le
                  remplacement.
                </p>
                <button
                  className="primary"
                  onClick={() =>
                    c.execute(async () => {
                      download(
                        JSON.stringify(await exportData()),
                        "growth-avant-restauration.json",
                      );
                      await restore(pending);
                      p(undefined);
                    })
                  }
                >
                  Confirmer le remplacement
                </button>
                <button onClick={() => p(undefined)}>Annuler</button>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="section-heading">
              <h2>Mes projets</h2>
              <button onClick={() => c.editEntry(newEntry("project"))}>
                <Plus size={17} /> Ajouter
              </button>
            </div>
            {c.entries
              .filter((e) => e.kind === "project")
              .map((e) => (
                <div className="row project-row" key={e.id}>
                  <b>{e.title}</b>
                  <div className="icon-actions">
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
                            "Supprimer ce projet ? Les actions seront conservées sans ce lien.",
                          )
                        )
                          void c.execute(() => deleteEntry(e));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </section>
          <section className="panel danger">
            <h2>Réinitialiser ma bibliothèque</h2>
            <p>
              Suppression définitive de toutes les données locales. Exportez-les
              au préalable.
            </p>
            <Field label="Saisissez SUPPRIMER pour confirmer">
              <input value={reset} onChange={(e) => r(e.target.value)} />
            </Field>
            <button
              disabled={reset !== "SUPPRIMER"}
              onClick={() =>
                c.execute(async () => {
                  await db.transaction(
                    "rw",
                    [
                      db.books,
                      db.entries,
                      db.sessions,
                      db.preferences,
                      db.integrations,
                    ],
                    async () => {
                      await db.books.clear();
                      await db.entries.clear();
                      await db.sessions.clear();
                      await db.preferences.clear();
                      await db.integrations.clear();
                    },
                  );
                  r("");
                })
              }
            >
              Supprimer toutes les données
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
