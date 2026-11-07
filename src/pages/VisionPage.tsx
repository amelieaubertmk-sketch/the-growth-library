import { Compass, Plus } from "lucide-react";
import type { Context } from "../context";
import { newEntry } from "../db/schema";
import { EntryCards, PageHeader } from "./shared";
export default function VisionPage(c: Context) {
  return (
    <>
      <PageHeader
        eyebrow="GARDER LE CAP"
        title="Ma vision"
        description="La direction qui donne du sens à vos prochaines actions."
      >
        <button
          className="primary"
          onClick={() => c.editEntry(newEntry("goal"))}
        >
          <Plus size={17} /> Nouvel objectif
        </button>
      </PageHeader>
      <section className="vision-banner">
        <Compass size={40} />
        <h2>
          Construire la suite,
          <br />
          <em>une intention à la fois.</em>
        </h2>
        <p>
          Ambitions, compétences, priorités et réalisations :<br />
          gardez à portée de vue ce qui vous fait avancer.
        </p>
      </section>
      {[
        "Mes grandes ambitions",
        "Mes objectifs annuels",
        "Mes compétences à développer",
        "Mes priorités",
        "Mes réalisations marquantes",
      ].map((category) => (
        <section className="vision-section" key={category}>
          <div className="section-heading">
            <h2>{category}</h2>
            <button
              onClick={() =>
                c.editEntry({ ...newEntry("goal"), categories: category })
              }
            >
              <Plus size={17} /> Ajouter
            </button>
          </div>
          <EntryCards
            {...c}
            items={c.entries.filter(
              (e) =>
                e.kind === "goal" &&
                (e.categories === category ||
                  (category === "Mes objectifs annuels" &&
                    ![
                      "Mes grandes ambitions",
                      "Mes compétences à développer",
                      "Mes priorités",
                      "Mes réalisations marquantes",
                    ].includes(e.categories))),
            )}
          />
        </section>
      ))}
      <section className="panel">
        <div className="section-heading">
          <h2>Mes projets</h2>
          <button onClick={() => c.editEntry(newEntry("project"))}>
            <Plus size={17} /> Créer un projet
          </button>
        </div>
        <EntryCards
          {...c}
          items={c.entries.filter((e) => e.kind === "project")}
        />
      </section>
    </>
  );
}
