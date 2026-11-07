# THE GROWTH LIBRARY

**Read. Think. Apply. Grow.** Une bibliothèque personnelle en français pour transformer ses lectures en idées et en actions.

## Fonctionnalités

- Tableau de bord calculé à partir des données locales, lecture mise en avant, focus cochables et activité réelle.
- Livres : création, modification, suppression confirmée, image locale ou URL, recherche combinée, grille/liste, statuts, note, dates et progression bornée.
- Fiche livre : sessions corrigibles, idées, citations personnelles, réflexions, actions, résumé avec sauvegarde automatique et bilan de lecture.
- Base d’idées : favoris, catégories, projets, recherche, filtres et dates de révision. Révision manuelle, report transparent de sept jours.
- Actions : liste ou tableau par statut, priorité, projets, traçabilité de l’idée au livre, résultat et action complémentaire. Le changement de colonne se fait via le sélecteur de statut, accessible au clavier.
- Progression : indicateurs cumulés, graphiques mensuels par année, catégories, actions par projet, objectifs et bilans mensuels.
- Vision : ambitions, compétences, priorités et objectifs reliés à des livres et actions.
- Préférences, thème persistant, projets modifiables, catégories, sauvegarde JSON complète et CSV livres/actions.
- Premier lancement au choix : vide ou exemples explicitement identifiés. Aucun nombre de pages ou avancement inventé pour _La Vache Pourpre_.

## Technologies et architecture

React 19, TypeScript strict, Vite, Tailwind CSS 4, React Router (HashRouter), Lucide, Recharts, Dexie/IndexedDB, Zod, Vitest et Playwright. Polices DM Sans et DM Serif Display servies localement.

```
src/
  components/     Formulaires accessibles, modales et composants visuels
  pages/          Pages chargées à la demande et composants transversaux
  db/             Modèles validés, schéma Dexie versionné et opérations transactionnelles
  services/       Import/export et contrat de service IA futur
  utils/          Calculs, filtrage et tests métier
  context.ts      Contrat typé des données et opérations de l’interface
  styles.css      Thèmes et responsive
```

Les identifiants utilisent `crypto.randomUUID()`. Les données sont isolées du jeu d’exemples. Les relations sont nettoyées à la suppression ; supprimer un livre supprime ses sessions et conserve les notes, devenues indépendantes. Une suppression de session conserve la page actuelle (modifiable séparément).

## Prérequis et installation

Node.js **24 LTS** et npm. Aucun serveur, compte, clé ni variable secrète nécessaire.

```sh
npm ci
npm run dev
```

Dans un environnement cloud où le cache npm par défaut n’est pas accessible : `npm ci --cache /tmp/growth-npm-cache`.

## Vérification

```sh
npm run typecheck
npm test
npm run test:e2e
npm run test:pwa
npm run build
npm run preview
```

Les tests métier utilisent fake-indexeddb. Les tests navigateur utilisent `/usr/bin/chromium` dans cet environnement cloud ; en CI, Playwright utilise son navigateur installé avec `npx playwright install --with-deps chromium`. Adapter `playwright.config.ts` à l’installation locale si nécessaire.

Les tests d’interface couvrent les principales opérations et contrôlent l’absence de débordement horizontal à 375, 390, 768, 1024 et 1440 px. Ils ne remplacent pas une vérification sur de vrais iPhone et Android.

## Stockage, sauvegarde et restauration

IndexedDB conserve les données entre navigations et redémarrages du navigateur. Le stockage est propre au navigateur, à l’appareil **et à l’origine du site**. Aucun envoi ou synchronisation cloud. Effacer les données du navigateur ou certaines politiques de stockage peut tout supprimer ; conserver des exports JSON réguliers hors de l’appareil.

Paramètres → **Exporter toutes mes données (JSON)** produit une sauvegarde de version 1 contenant livres, sessions, notes, idées, citations, réflexions, actions, projets, objectifs, bilans, révisions et préférences. Les couvertures locales sont incluses. Les images provenant d’une URL restent dépendantes de cette URL.

L’import valide le schéma, la version, les identifiants, les bornes et les relations. Après affichage des quantités, une confirmation explicite remplace les données dans une transaction atomique. Un export des données actuelles est déclenché avant remplacement : conservez ce téléchargement. Il n’y a pas de fusion automatique ni de remplacement silencieux. Les CSV sont des exports de consultation et ne servent pas à la restauration.

Le schéma Dexie commence en version 1. Toute évolution de structure devra ajouter une nouvelle `db.version(n)` avec migration `upgrade`, ainsi qu’une migration du format d’export si nécessaire. Ne jamais effacer la base pour changer de version.

## PWA et mode hors ligne

Le build génère manifest, icônes 192/512, icône Apple et service worker. Les ressources de l’application et polices sont précachées. Après une première visite réussie en HTTPS (ou sur localhost), les fonctions locales restent accessibles hors ligne. Les couvertures externes ne sont pas précachées. Le service worker n’intercepte pas de service cloud.

Une nouvelle version affiche une demande d’actualisation ; enregistrez les formulaires avant de l’accepter. iPhone : menu de partage Safari → Sur l’écran d’accueil. Android : menu du navigateur compatible → Installer l’application. La proposition dépend du navigateur.

## GitHub Pages

Le dépôt sélectionné est `amelieaubertmk-sketch/the-growth-library`. Les fichiers sont préparés localement ; aucun push ni déploiement n’est effectué par cette livraison.

1. Publier les fichiers dans le dépôt, sur `main`.
2. GitHub → Settings → Pages → Source : **GitHub Actions**.
3. Autoriser les workflows Actions du dépôt et, si nécessaire, l’environnement `github-pages`.
4. Le workflow `.github/workflows/deploy.yml` installe avec le lockfile, vérifie TypeScript, exécute les tests métier et navigateur, construit puis déploie `dist` après succès sur `main`. Les pull requests vérifient sans déployer.

Vite utilise `base: './'` et HashRouter : les ressources fonctionnent dans un sous-répertoire de dépôt ou à la racine, sans réécriture serveur. Les routes ont la forme `/#/library`. Le nom du dépôt peut évoluer sans changer la base de build. HTTPS est requis en production pour PWA et UUID.

## Limites de la V1 et évolutions

- Application personnelle locale ; pas d’authentification, paiement ou synchronisation.
- Pas d’API de recherche de livres : l’ajout manuel reste disponible hors ligne.
- Révision des connaissances manuelle ; aucun algorithme scientifique revendiqué.
- Pas de glisser-déposer : tableau actionnable avec sélecteurs de statut.
- Les statistiques de pages et durées proviennent des sessions, pas de la progression manuelle. Les livres terminés mensuels nécessitent une date de fin. Les actions terminées sont datées lors du changement de statut.
- Les réflexions longues sont sauvegardées explicitement ; le résumé personnel dispose d’un enregistrement automatique temporisé. Les bilans restent modifiables à tout moment.
- Aucun assistant IA actif. `services/ai.ts` prévoit un contrat pour une future intégration via backend sécurisé, consentement et contrôle des notes transmises.
- Une évolution Supabase nécessitera des adaptateurs de persistance, authentification et règles d’accès ; les UUID et opérations centralisées préparent cette séparation sans simuler un backend.
- Pas de validation réelle sur appareils iOS/Android ni de publication effectuée depuis ce workspace.
