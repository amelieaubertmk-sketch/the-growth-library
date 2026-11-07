import type { Book } from "../db/schema";
export const ENTREPRENEURIAL_CATALOG_ID = "entrepreneurial-library-v1";
export interface CatalogDefinition {
  key: string;
  title: string;
  author: string;
  category: string;
  tags: string[];
  priority: "Haute" | "Moyenne" | "Basse";
  status: "Liste de souhaits" | "À lire prochainement";
  skill: string;
  objective: string;
  businesses: string[];
  order: number;
  description: string;
  titleAliases?: string[];
  authorAliases?: string[];
}
// Descriptions originales de présentation, sans prétendre constituer des notes de lecture.
// Aucune édition vérifiée : ISBN, pagination et couverture restent inconnus.
export const entrepreneurialCatalog: CatalogDefinition[] = [
  {
    key: "one-page-marketing-plan",
    title: "Votre plan marketing en 1 page",
    author: "Allan Dib",
    category: "Marketing & Stratégie",
    tags: [
      "Acquisition client",
      "Marketing",
      "Fidélisation",
      "Stratégie commerciale",
    ],
    priority: "Haute",
    status: "Liste de souhaits",
    skill: "Structurer une stratégie d’acquisition et de fidélisation",
    objective:
      "Construire un plan marketing applicable à Infinity Moove et KISSIP.",
    businesses: ["Infinity Moove", "KISSIP"],
    order: 4,
    titleAliases: [
      "Le plan marketing en 1 page",
      "Votre plan marketing en une page",
      "The 1-Page Marketing Plan",
    ],
    description: `Allan Dib propose une méthode pour organiser le marketing d’une entreprise autour d’un plan synthétique. Le livre aborde le choix du public, la formulation du message, les moyens de contact, la conversion et la relation après l’achat. Il invite à relier les actions commerciales plutôt qu’à multiplier les initiatives isolées. Cette lecture pourra servir à préparer un document de travail pour Infinity Moove et KISSIP, en distinguant acquisition et fidélisation. L’objectif personnel sera de transformer les questions du livre en décisions adaptées à chaque activité, puis de choisir quelques actions observables à expérimenter sans supposer leur efficacité à l’avance.`,
  },
  {
    key: "this-is-marketing",
    title: "This Is Marketing",
    author: "Seth Godin",
    category: "Marketing & Stratégie",
    tags: ["Positionnement", "Audience", "Différenciation", "Valeur"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Définir une audience et une proposition de valeur",
    objective:
      "Mieux comprendre comment créer une offre qui répond à une véritable demande.",
    businesses: ["KISSIP", "Infinity Moove"],
    order: 13,
    titleAliases: ["C’est ça, le marketing", "C'est ça le marketing"],
    description: `Seth Godin présente le marketing comme une démarche fondée sur la compréhension des personnes auxquelles une offre s’adresse. Le livre explore le choix d’un public, la confiance, le positionnement et le changement que l’entreprise souhaite rendre possible. Il invite à dépasser la seule recherche de visibilité pour examiner la pertinence de la promesse. Cette lecture pourra aider à préciser les besoins servis par KISSIP et Infinity Moove, sans chercher à satisfaire indistinctement tous les publics. L’objectif sera de formuler une proposition de valeur compréhensible, puis de la confronter aux attentes exprimées par des clients réels.`,
  },
  {
    key: "storybrand",
    title: "Construire une StoryBrand",
    author: "Donald Miller",
    category: "Branding & Communication",
    tags: ["Storytelling", "Identité de marque", "Communication", "Conversion"],
    priority: "Haute",
    status: "Liste de souhaits",
    skill: "Clarifier un message de marque centré sur le client",
    objective:
      "Renforcer l’identité de KISSIP et améliorer la communication des entreprises.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 5,
    titleAliases: ["StoryBrand", "Building a StoryBrand"],
    description: `Donald Miller propose un cadre narratif destiné à rendre la communication commerciale plus claire. Le client y occupe une place centrale, tandis que la marque explique comment elle peut l’accompagner face à un problème et vers un résultat souhaité. Le livre examine la lisibilité du message et le rôle des appels à l’action. Pour KISSIP, marque de bijoux et de commerce en ligne, cette lecture pourra nourrir une réflexion sur les pages produits, la présentation de la marque et les parcours de découverte. L’objectif sera de clarifier les messages existants sans inventer de promesses ni effacer la personnalité de chaque entreprise.`,
  },
  {
    key: "influence",
    title: "Influence et manipulation",
    author: "Robert Cialdini",
    category: "Vente & Psychologie",
    tags: [
      "Persuasion",
      "Psychologie du consommateur",
      "Vente",
      "Comportement",
    ],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Analyser les mécanismes de persuasion et de décision",
    objective: "Comprendre les mécanismes de décision d’achat.",
    businesses: ["KISSIP", "Infinity Moove"],
    order: 6,
    titleAliases: ["Influence", "Influence: The Psychology of Persuasion"],
    authorAliases: ["Robert B. Cialdini"],
    description: `Robert Cialdini examine les mécanismes psychologiques qui influencent l’adhésion à une demande ou à une proposition. À travers des recherches et des situations concrètes, il décrit notamment le rôle du contexte social, de la cohérence et de la perception de l’autorité. Les contenus et leur organisation peuvent varier selon l’édition. Cette lecture pourra aider à mieux comprendre les décisions d’achat et à repérer des pratiques de persuasion dans la communication commerciale. Pour les projets concernés, l’objectif sera de questionner les messages et les parcours clients avec discernement, en privilégiant une information honnête plutôt que des procédés destinés à tromper.`,
  },
  {
    key: "personal-mba",
    title: "Le Personal MBA",
    author: "Josh Kaufman",
    category: "Gestion d'entreprise",
    tags: ["Finance", "Management", "Business", "Stratégie", "Rentabilité"],
    priority: "Haute",
    status: "À lire prochainement",
    skill: "Comprendre les fonctions essentielles d’une entreprise",
    objective:
      "Acquérir une vision globale du fonctionnement d’une entreprise.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 3,
    titleAliases: ["Personal MBA", "The Personal MBA"],
    description: `Josh Kaufman rassemble des concepts essentiels pour comprendre le fonctionnement d’une entreprise sans organiser son propos comme un cursus universitaire complet. Il aborde notamment la création de valeur, le marketing, la vente, la livraison de la promesse et les finances, ainsi que le travail individuel et collectif. Cette lecture pourra servir de repère transversal pour relier les difficultés rencontrées dans plusieurs activités. L’objectif personnel sera d’identifier les fonctions à renforcer dans KISSIP, Infinity Moove et Infinity Cab, puis de choisir des questions de gestion à approfondir. Les connaissances acquises seront consignées progressivement pendant la lecture, sans bilan prérempli.`,
  },
  {
    key: "financial-intelligence",
    title: "Financial Intelligence for Entrepreneurs",
    author: "Karen Berman et Joe Knight",
    category: "Finance & Gestion",
    tags: ["Comptabilité", "Trésorerie", "Rentabilité", "Analyse financière"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Lire et interpréter les principaux états financiers",
    objective:
      "Savoir analyser les chiffres de mes sociétés et prendre de meilleures décisions financières.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 9,
    description: `Karen Berman et Joe Knight présentent des notions financières destinées aux personnes qui pilotent une entreprise sans être spécialistes de la comptabilité. Le livre aide à distinguer les résultats comptables, les mouvements de trésorerie et les hypothèses qui interviennent dans la production des chiffres. Il encourage une lecture critique des indicateurs plutôt qu’une confiance automatique dans un total isolé. Cette lecture pourra préparer des échanges plus précis avec les professionnels qui accompagnent les sociétés. L’objectif sera de comprendre les principaux documents financiers, de repérer les questions utiles et de relier les décisions courantes à leurs conséquences économiques.`,
  },
  {
    key: "high-output-management",
    title: "High Output Management",
    author: "Andrew S. Grove",
    category: "Management & Leadership",
    tags: ["Management", "Productivité", "Équipe", "Organisation"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Organiser le travail et développer l’efficacité collective",
    objective:
      "Améliorer l’encadrement des collaborateurs et la performance collective.",
    businesses: ["Infinity Cab", "Infinity Moove"],
    order: 10,
    authorAliases: ["Andrew Grove", "Andy Grove"],
    description: `Andrew S. Grove analyse le travail du manager à partir de l’organisation de la production et de la contribution d’une équipe. Le livre traite des activités de management, des réunions, de l’évaluation, de la formation et des moyens d’agir sur les résultats collectifs. Il propose de réfléchir à l’effet des interventions du responsable plutôt qu’à son seul niveau d’occupation. Pour Infinity Cab et Infinity Moove, cette lecture pourra éclairer la structuration des échanges et des responsabilités. L’objectif sera de sélectionner des pratiques adaptées aux équipes réelles, en tenant compte des métiers, des contraintes et du degré d’autonomie de chacun.`,
  },
  {
    key: "five-dysfunctions",
    title: "Les 5 dysfonctions d'une équipe",
    author: "Patrick Lencioni",
    category: "Management & Leadership",
    tags: ["Leadership", "Cohésion", "Communication", "Travail d'équipe"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Repérer les obstacles à la coopération dans une équipe",
    objective: "Construire une équipe plus autonome et efficace.",
    businesses: ["Infinity Cab", "Infinity Moove"],
    order: 11,
    titleAliases: [
      "Les cinq dysfonctions d'une équipe",
      "Les cinq dysfonctionnements d'une équipe",
      "Les 5 dysfonctionnements d'une équipe",
      "The Five Dysfunctions of a Team",
    ],
    description: `Patrick Lencioni présente un modèle des difficultés qui peuvent freiner la coopération dans une équipe. Son approche s’appuie sur un récit et sur une grille de lecture abordant notamment la confiance, les désaccords, l’engagement et la responsabilité collective. Le livre peut servir de point de départ pour observer les habitudes d’un groupe, sans constituer à lui seul un diagnostic de son fonctionnement. Pour Infinity Cab et Infinity Moove, l’objectif sera d’identifier des situations précises à discuter avec les collaborateurs. Les pistes retenues devront favoriser des échanges plus clairs et une meilleure coopération, plutôt qu’attribuer rapidement des étiquettes aux personnes.`,
  },
  {
    key: "lean-startup",
    title: "Lean Startup",
    author: "Eric Ries",
    category: "Innovation & Entrepreneuriat",
    tags: ["Innovation", "MVP", "Validation", "Lancement", "Expérimentation"],
    priority: "Haute",
    status: "Liste de souhaits",
    skill: "Tester une hypothèse avant d’engager des ressources importantes",
    objective: "Apprendre à tester les nouvelles idées avant d’investir.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 7,
    titleAliases: ["The Lean Startup"],
    description: `Eric Ries propose une approche de l’innovation fondée sur l’expérimentation et l’apprentissage à partir des réactions du marché. Le livre développe notamment les notions de produit minimum viable, d’hypothèses à vérifier et de décisions de poursuite ou de changement de direction. Il invite à distinguer l’activité réalisée des enseignements effectivement obtenus. Cette lecture pourra aider à préparer de nouveaux produits, services ou offres dans les différentes entreprises. L’objectif personnel sera de définir une hypothèse risquée, une expérience proportionnée et des critères d’observation avant d’investir davantage. Aucun succès commercial ne sera supposé avant la confrontation aux usages et aux retours réels.`,
  },
  {
    key: "blue-ocean",
    title: "Stratégie Océan Bleu",
    author: "W. Chan Kim et Renée Mauborgne",
    category: "Stratégie & Croissance",
    tags: ["Concurrence", "Différenciation", "Innovation", "Marché"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Repenser une offre et ses critères de concurrence",
    objective: "Identifier des opportunités commerciales peu exploitées.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 12,
    titleAliases: ["Blue Ocean Strategy"],
    description: `W. Chan Kim et Renée Mauborgne proposent de réfléchir à des espaces de marché où l’entreprise ne se contente pas de reproduire les critères habituels de concurrence. Leur approche met en relation la valeur apportée au client et les choix de conception de l’offre. Le livre présente des outils destinés à comparer, questionner et recomposer ces choix. Cette lecture pourra nourrir une réflexion stratégique sur les activités existantes et sur de nouvelles propositions. L’objectif sera d’identifier une opportunité à examiner, puis de vérifier la demande et la faisabilité économique avant de considérer qu’un marché est réellement accessible ou peu disputé.`,
  },
  {
    key: "e-myth",
    title: "The E-Myth Revisited",
    author: "Michael E. Gerber",
    category: "Organisation & Croissance",
    tags: ["Processus", "Délégation", "Systèmes", "Entrepreneuriat"],
    priority: "Haute",
    status: "Liste de souhaits",
    skill: "Formaliser des processus qui facilitent la délégation",
    objective:
      "Construire des entreprises moins dépendantes de ma présence quotidienne.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 8,
    titleAliases: ["E-Myth Revisited"],
    description: `Michael E. Gerber examine les difficultés qui apparaissent lorsqu’une entreprise repose principalement sur le savoir-faire et la présence permanente de sa fondatrice ou de son fondateur. Le livre distingue plusieurs rôles nécessaires à son développement et insiste sur l’organisation de processus reproductibles. Il invite à travailler sur le fonctionnement de l’entreprise, au-delà de l’exécution quotidienne des tâches. Cette lecture pourra aider à repérer les opérations trop dépendantes d’une seule personne. L’objectif sera de choisir un processus à documenter, de clarifier les responsabilités et d’envisager une délégation progressive, sans supposer que toutes les activités peuvent être standardisées de la même manière.`,
  },
  {
    key: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivité & Organisation",
    tags: ["Concentration", "Organisation", "Efficacité", "Gestion du temps"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill: "Protéger des périodes de travail exigeant de la concentration",
    objective: "Mieux organiser mon temps entre plusieurs entreprises.",
    businesses: ["KISSIP", "Infinity Moove", "Infinity Cab"],
    order: 14,
    description: `Cal Newport s’intéresse au travail qui demande une attention soutenue et à la difficulté de le préserver dans un environnement riche en sollicitations. Le livre distingue ces activités des tâches plus fragmentées et propose des pistes pour organiser ses habitudes, son emploi du temps et ses interruptions. Cette lecture pourra aider à examiner la répartition du temps entre plusieurs entreprises, sans nier les contraintes opérationnelles ou relationnelles. L’objectif personnel sera d’identifier les tâches qui méritent une concentration particulière, puis d’expérimenter une organisation réaliste. Les bénéfices éventuels seront observés dans la pratique plutôt que déduits automatiquement du temps réservé au calendrier.`,
  },
  {
    key: "psychology-of-money",
    title: "La Psychologie de l'argent",
    author: "Morgan Housel",
    category: "Finance & Investissement",
    tags: ["Patrimoine", "Investissement", "Risque", "Psychologie financière"],
    priority: "Moyenne",
    status: "Liste de souhaits",
    skill:
      "Reconnaître les comportements qui influencent les décisions financières",
    objective:
      "Comprendre les comportements financiers et développer une stratégie patrimoniale à long terme.",
    businesses: ["Développement personnel"],
    order: 15,
    titleAliases: ["The Psychology of Money"],
    description: `Morgan Housel explore la place du comportement, de l’expérience personnelle et des émotions dans la manière de gagner, conserver et utiliser l’argent. Le livre met en perspective le risque, l’incertitude, le temps et les différences de trajectoire entre les personnes. Il encourage une réflexion sur les décisions financières qui dépasse la seule maîtrise de calculs ou de produits d’investissement. Cette lecture pourra nourrir une démarche patrimoniale personnelle à long terme. L’objectif sera de clarifier mes propres attentes et limites, puis d’identifier les habitudes à interroger. Ces réflexions ne remplaceront pas une analyse adaptée à ma situation ni un accompagnement professionnel lorsque nécessaire.`,
  },
  {
    key: "intelligent-investor",
    title: "L'Investisseur intelligent",
    author: "Benjamin Graham",
    category: "Finance & Investissement",
    tags: ["Investissement", "Valorisation", "Risque", "Marchés financiers"],
    priority: "Basse",
    status: "Liste de souhaits",
    skill: "Comprendre les principes de l’investissement fondé sur la valeur",
    objective:
      "Comprendre les principes fondamentaux de l’investissement à long terme.",
    businesses: ["Développement personnel"],
    order: 16,
    titleAliases: ["The Intelligent Investor"],
    description: `Benjamin Graham expose une conception de l’investissement centrée sur l’analyse, la discipline et la distinction entre investissement et spéculation. Le livre aborde notamment la marge de sécurité, les réactions aux fluctuations de marché et les différences entre profils d’investisseurs. Les commentaires et compléments varient selon les éditions, ce qui rend importante l’identification de l’exemplaire utilisé. Cette lecture pourra servir à comprendre des principes historiques de l’investissement à long terme. L’objectif personnel sera d’en examiner les raisonnements, les limites et les conditions d’application actuelles, sans transformer des exemples du livre en recommandations automatiques d’achat ou en promesses de rendement.`,
  },
];
export function normalizedText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}
function titleKey(value: string) {
  return normalizedText(value.split(/[:—–]/)[0]).replace(
    /^(?:le|la|les|the|l) /,
    "",
  );
}
function authorKey(value: string) {
  return normalizedText(value)
    .split(" ")
    .filter((t) => t.length > 1 && !["et", "and"].includes(t))
    .sort()
    .join(" ");
}
export function matchesReference(
  book: Pick<Book, "title" | "author">,
  reference: {
    title: string;
    author: string;
    titleAliases?: string[];
    authorAliases?: string[];
  },
) {
  return (
    [reference.title, ...(reference.titleAliases || [])].some(
      (t) => titleKey(t) === titleKey(book.title),
    ) &&
    [reference.author, ...(reference.authorAliases || [])].some(
      (a) => authorKey(a) === authorKey(book.author),
    )
  );
}
export function catalogBookId(key: string) {
  return `${ENTREPRENEURIAL_CATALOG_ID}:${key}`;
}
export function entrepreneurialOrder(book: Book) {
  if (
    matchesReference(book, { title: "La Vache Pourpre", author: "Seth Godin" })
  )
    return 1;
  if (
    matchesReference(book, {
      title: "Votre empire dans un sac à dos",
      author: "Stan Leloup",
    })
  )
    return 2;
  return (
    entrepreneurialCatalog.find(
      (d) =>
        book.id === catalogBookId(d.key) ||
        book.catalogId === catalogBookId(d.key) ||
        matchesReference(book, d),
    )?.order ?? Number.POSITIVE_INFINITY
  );
}
