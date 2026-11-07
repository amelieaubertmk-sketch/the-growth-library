import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Empty } from "../components/UI";
import type { Context } from "../context";
import { newEntry } from "../db/schema";
import { statistics } from "../utils/statistics";
import { PreferencesForm } from "./SettingsPage";
import { EntryCards, PageHeader } from "./shared";
export default function ProgressPage(c: Context) {
  const [year, y] = useState(new Date().getFullYear());
  const s = statistics(c.books, c.entries, c.sessions, year),
    projects = c.entries.filter((e) => e.kind === "project"),
    categories = Array.from(
      new Set(c.books.map((b) => b.category || "Sans catégorie")),
    ).map((category) => ({
      month: category,
      Total: c.books.filter(
        (b) => (b.category || "Sans catégorie") === category,
      ).length,
    }));
  const projectData = projects.map((p) => ({
    month: p.title,
    Total: c.entries.filter(
      (e) =>
        e.kind === "action" &&
        e.status === "Terminée" &&
        e.projectIds.includes(p.id),
    ).length,
  }));
  return (
    <>
      <PageHeader
        eyebrow="VOTRE ÉVOLUTION, CONCRÈTEMENT"
        title="Ma progression"
        description="Des indicateurs issus de vos lectures et de vos actions réelles."
      >
        <select
          aria-label="Année des graphiques"
          value={year}
          onChange={(e) => y(Number(e.target.value))}
        >
          {[
            new Date().getFullYear() - 2,
            new Date().getFullYear() - 1,
            new Date().getFullYear(),
            new Date().getFullYear() + 1,
          ].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </PageHeader>
      <p className="eyebrow">CUMUL DE TOUTES VOS DONNÉES</p>
      <div className="metric-grid">
        {[
          [
            c.books.filter(
              (b) =>
                b.startDate ||
                b.status === "En cours" ||
                b.status === "Terminé",
            ).length,
            "Livres commencés",
          ],
          [s.finished, "Livres terminés"],
          [s.pages, "Pages en sessions"],
          [s.sessions, "Sessions enregistrées"],
          [s.minutes, "Minutes enregistrées"],
          [s.ideas, "Idées sauvegardées"],
          [s.done, "Actions réalisées"],
          [`${s.rate} %`, "Taux de réalisation"],
        ].map(([n, l]) => (
          <div className="panel metric" key={l}>
            <strong>{n}</strong>
            <p>{l}</p>
          </div>
        ))}
      </div>
      <div className="detail-grid">
        <Chart
          title={`Livres terminés par mois · ${year}`}
          data={s.months}
          field="Livres"
        />
        <Chart
          title={`Pages lues par mois · ${year}`}
          data={s.months}
          field="Pages"
        />
        <Chart
          title="Répartition des catégories · cumul"
          data={categories}
          field="Total"
        />
        <Chart
          title={`Nouvelles idées par mois · ${year}`}
          data={s.months}
          field="Idées"
        />
        <Chart
          title="Actions terminées par projet · cumul"
          data={projectData}
          field="Total"
        />
        <section className="panel">
          <h2>Mes objectifs personnels</h2>
          <PreferencesForm prefs={c.prefs} onlyGoals notify={c.notify} />
          <p>
            {
              c.books.filter(
                (b) =>
                  b.status === "Terminé" &&
                  b.endDate.startsWith(String(new Date().getFullYear())),
              ).length
            }{" "}
            / {c.prefs.annualBooks} livres cette année
          </p>
          <p>
            {s.months[new Date().getMonth()]?.Pages || 0} /{" "}
            {c.prefs.monthlyPages} pages ce mois{" "}
            {year !== new Date().getFullYear() &&
              `(année sélectionnée : ${year})`}
          </p>
          <p>
            {
              c.entries.filter(
                (e) =>
                  e.kind === "action" &&
                  e.status === "Terminée" &&
                  e.completedAt.startsWith(
                    new Date().toISOString().slice(0, 7),
                  ),
              ).length
            }{" "}
            / {c.prefs.monthlyActions} actions ce mois (année actuelle)
          </p>
        </section>
      </div>
      <div className="section-heading">
        <h2>Mes bilans mensuels</h2>
        <button
          className="primary"
          onClick={() =>
            c.editEntry({
              ...newEntry("monthly"),
              title: new Date().toLocaleDateString("fr", {
                month: "long",
                year: "numeric",
              }),
              text: "Ce que j’ai appris :\n\nCe que j’ai appliqué :\n\nMes progrès :\n\nMes difficultés :\n\nMes priorités du mois suivant :\n",
            })
          }
        >
          <Plus size={17} /> Nouveau bilan
        </button>
      </div>
      <EntryCards
        {...c}
        items={c.entries.filter((e) => e.kind === "monthly")}
      />
    </>
  );
}
function Chart({
  title,
  data,
  field,
}: {
  title: string;
  data: Record<string, string | number>[];
  field: string;
}) {
  return (
    <section className="panel chart">
      <h2>{title}</h2>
      {data.some((d) => Number(d[field]) > 0) ? (
        <>
          <ResponsiveContainer width="100%" height={235}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip />
              <Bar dataKey={field} fill="#7043A0" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <details>
            <summary>Données du graphique</summary>
            {data.map((d, i) => (
              <p key={i}>
                {d.month} : {d[field]}
              </p>
            ))}
          </details>
        </>
      ) : (
        <Empty text="Vos données dessineront votre progression ici." />
      )}
    </section>
  );
}
