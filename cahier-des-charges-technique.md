# Cahier des charges technique — Calcul/Mental

Document destiné à être utilisé comme brief de développement (Claude Code). Il couvre la Phase 1 en détail (à développer intégralement) et la Phase 2 en synthèse (à garder en tête pour ne pas fermer de portes architecturales).

---

## 0. Stack technique recommandée

- **Frontend** : React + Vite + TypeScript
- **Style** : CSS avec variables custom properties (design tokens), pas de framework CSS lourd imposé — Tailwind acceptable si préféré, mais les tokens couleur/typo doivent rester pilotables par variables CSS (`:root`) pour permettre la personnalisation utilisateur prévue en Phase 2
- **Routing** : React Router
- **State** : Context API + hooks suffisant pour la Phase 1 (pas de Redux nécessaire)
- **Stockage** : `localStorage` en Phase 1, migration vers backend + base de données en Phase 2
- **Pas de backend en Phase 1** : site 100% statique, déployable sur Vercel/Netlify

Si une autre stack est préférée (Next.js, Vue, Svelte), adapter l'arborescence ci-dessous en conséquence — le modèle de données et les specs fonctionnelles restent valables indépendamment de la stack.

---

## 1. Arborescence de fichiers proposée

```
src/
  components/
    ui/                    # boutons, cartes, badges, inputs génériques
    config/                # composants de l'écran de configuration
    session/                # composants de l'écran de session (question, input, timer, progress)
    layout/                 # nav, footer, wrapper de page
  pages/
    HomePage.tsx
    MenuPresetsPage.tsx      # liste des modes scolaires/thématiques
    ConfigPage.tsx           # mode simple/avancé
    SessionPage.tsx          # écran plein écran de la série
    ResultsPage.tsx          # écran de fin de session
    MyConfigsPage.tsx        # configs sauvegardées localement
  engine/
    types.ts                 # types TypeScript du modèle de config (voir section 2)
    questionGenerator.ts      # moteur de génération (voir section 3)
    validators.ts             # validation d'une réponse utilisateur
    presets/
      schoolPresets.ts        # CP → Lycée
      themedPresets.ts        # Addition, Fractions, Chrono, etc.
  storage/
    localConfigStore.ts       # CRUD configs perso en localStorage
    localStatsStore.ts        # historique de sessions en localStorage
  styles/
    tokens.css                # variables CSS (couleurs, typo, radius, spacing)
    global.css
  App.tsx
  main.tsx
```

---

## 2. Modèle de données — objet de configuration

**Toute session (preset ou perso) est pilotée par un seul et même objet JSON.** Aucune logique ne doit être dupliquée entre "mode simple", "mode avancé" et "presets" : ce sont trois interfaces différentes qui produisent ou éditent le même objet.

```typescript
interface SessionConfig {
  id: string;                    // uuid généré, ou id de preset fixe (ex: "school-ce1")
  name: string;                  // "CE1", "Ma config du mardi", etc.
  source: "preset" | "custom";

  operations: Operation[];       // au moins 1, plusieurs possibles

  numberTypes: {
    integer:  { enabled: boolean; min: number; max: number };
    decimal:  { enabled: boolean; decimals: number; min: number; max: number };
    fraction: {
      enabled: boolean;
      numeratorMax: number;
      denominators: number[];     // ex: [2, 4, 5, 10]
      simplifyResult: boolean;    // le résultat doit-il être simplifié
      allowImproper: boolean;     // autoriser fractions > 1 (7/4)
    };
    allowNegative: boolean;
  };

  difficulty: {
    operandsCount: 2 | 3 | 4;
    forceCarry: boolean | null;       // true = retenue obligatoire, false = jamais, null = indifférent
    tablesOnly: number[] | null;      // ex: [7] pour ne travailler que la table de 7
    divisionExactOnly: boolean;       // pas de reste
    maxPowerExponent?: number;        // pour les puissances
  };

  session: {
    mode: "fixedCount" | "totalTime" | "survival" | "training";
    questionCount?: number;           // requis si mode = fixedCount
    totalTimeSeconds?: number;        // requis si mode = totalTime
  };

  answer: {
    inputMode: "keyboard" | "mcq" | "trueFalse" | "knewOrNot";
    mcqChoicesCount?: number;         // défaut 4
  };

  correction: {
    mode: "immediate" | "delayed" | "onDemand" | "endOfSeries" | "none";
    delaySeconds?: number;            // requis si mode = delayed
  };

  timing: {
    responseTimeSeconds: number | null;    // null = illimité
    correctionDisplaySeconds: number;      // temps d'affichage de la correction avant question suivante
  };
}

type Operation =
  | "addition" | "subtraction" | "multiplication" | "division"
  | "power" | "squareRoot" | "percentage" | "orderOfOperations" | "rounding";
```

**Objet Question généré** (sortie du moteur, une par question) :

```typescript
interface GeneratedQuestion {
  id: string;
  displayText: string;        // "12 + 7 = ?" ou "3/4 + 1/2 = ?"
  operands: (number | Fraction)[];
  operation: Operation;
  correctAnswer: number | Fraction;
  correctAnswerDisplay: string;   // format d'affichage ("3/4", "12.5", "-4")
  choices?: string[];             // uniquement si inputMode = mcq, mélangées aléatoirement
}

interface Fraction { numerator: number; denominator: number; }
```

---

## 3. Moteur de génération de questions

Algorithme général pour chaque question :

1. Choisir une opération au hasard parmi `config.operations`
2. Choisir un type de nombre au hasard parmi les types activés dans `config.numberTypes` (pondération égale par défaut entre types activés)
3. Générer les opérandes (nombre défini par `difficulty.operandsCount`) respectant :
   - la plage min/max du type choisi
   - `allowNegative`
   - `forceCarry` (addition/soustraction : vérifier si l'opération génère une retenue, régénérer sinon si contrainte imposée)
   - `tablesOnly` (multiplication/division : un des deux opérandes doit appartenir à la liste)
   - `divisionExactOnly` (division : générer diviseur et quotient d'abord, en déduire le dividende, pour garantir un résultat entier)
4. Calculer le résultat exact
5. Formatter `displayText` et `correctAnswerDisplay` selon le type de nombre (virgule française pour les décimaux : `12,5` et non `12.5`)
6. Si `inputMode === "mcq"` : générer 3 réponses fausses plausibles (proches du résultat correct, erreurs de calcul typiques comme inversion de chiffres ou erreur de retenue), mélanger l'ordre
7. Retourner l'objet `GeneratedQuestion`

**Cas particulier — priorités opératoires** : générer une expression à 2-3 opérations en respectant la précédence standard (`×` et `÷` avant `+` et `−`), avec parenthèses optionnelles selon la difficulté.

**Cas particulier — fractions** : les opérations entre fractions (addition, soustraction) doivent mettre au même dénominateur ; le résultat est simplifié si `simplifyResult` est activé (calcul du PGCD).

**Validation des réponses utilisateur** (`validators.ts`) :
- Nombre entier/décimal : comparaison numérique stricte (tolérance 0 sauf si arrondi explicitement demandé)
- Fraction : accepter toute fraction équivalente à la réponse correcte (ex: `2/4` accepté si la réponse attendue est `1/2`, sauf si `simplifyResult` impose la forme simplifiée uniquement — à configurer)
- Accepter `,` et `.` comme séparateur décimal en saisie clavier

---

## 4. Spécification écran par écran

### 4.1 Page d'accueil (`HomePage.tsx`)

- Nav (voir section 6, composant partagé sur toutes les pages sauf session)
- Bloc héro : titre + sous-texte + visuel + bouton principal "Commencer une série" → redirige vers `MenuPresetsPage`
- Grille de 6 à 8 cartes "modes rapides" : chaque carte affiche un tag (nom court), un titre, et déclenche directement le lancement d'un `SessionConfig` preset (pas de passage par la config)
- Bloc "3 portes d'entrée" avec liens vers Modes scolaires / Modes thématiques / Personnalisé

### 4.2 Page menu / liste des presets (`MenuPresetsPage.tsx`)

- Deux onglets ou sections : **Scolaires** / **Thématiques**
- Modes scolaires affichés sous forme de liste ordonnée (CP → Lycée), chaque item cliquable ouvre directement `ConfigPage` en mode Simple, préchargé avec le preset (l'utilisateur peut ajuster avant de lancer, ou lancer direct)
- Modes thématiques affichés en grille de cartes

### 4.3 Page de configuration (`ConfigPage.tsx`)

- Toggle **Simple / Avancé** en haut de page, persistant pendant la session de configuration
- Bandeau récapitulatif fixe (sticky) affichant en temps réel un résumé lisible de la config actuelle (ex: "Addition, soustraction · Entiers 1-100 · 20 questions")

**Mode Simple** — formulaire court :
- Sélecteur d'opération(s) (chips cliquables, multi-sélection)
- Sélecteur de difficulté : Facile / Moyen / Difficile (mappe vers des presets internes de `numberTypes` et `difficulty`, non éditables en mode simple)
- Nombre de questions (slider ou input, 10/20/30/50)
- Bouton "Lancer"

**Mode Avancé** — accordéon, chaque section repliée par défaut avec valeurs pré-remplies raisonnables :
1. **Opérations** — cases à cocher pour chaque `Operation`
2. **Types de nombres** — un bloc par type (entiers, décimaux, fractions), qui ne révèle ses sous-réglages (plage, décimales, dénominateurs) que si la case "activer" est cochée ; toggle séparé pour les négatifs
3. **Difficulté** — nombre d'opérandes, retenues, tables spécifiques, division exacte
4. **Format de session** — mode (nombre fixe / chrono / survie / entraînement), valeurs associées
5. **Réponse** — mode de saisie (clavier/QCM/vrai-faux/je savais), nombre de choix si QCM
6. **Correction & chronométrage** — mode de correction, délai de correction, temps de réponse

- Boutons en bas de page : "Enregistrer cette configuration" (ouvre un champ nom, sauvegarde en `localStorage` via `localConfigStore`) et "Lancer"

### 4.4 Page de session (`SessionPage.tsx`)

- **Plein écran**, sans nav ni menu — uniquement un bouton "Quitter" discret en coin (avec confirmation si des questions ont déjà été répondues)
- Zone centrale : la question (`displayText`), grande, lisible
- Zone de réponse selon `answer.inputMode` :
  - `keyboard` : input numérique/texte + clavier virtuel à l'écran (utile mobile et pour usage sans clavier physique)
  - `mcq` : 3-4 boutons de choix
  - `trueFalse` : affichage d'une égalité (parfois fausse), deux boutons Vrai/Faux
  - `knewOrNot` : la réponse n'est pas saisie, deux boutons "Je savais" / "Je ne savais pas"
- Barre de progression (question X / Y, ou temps restant si mode chrono)
- Chronomètre visible si `timing.responseTimeSeconds` défini (compte à rebours visuel, ex: cercle qui se vide)
- Comportement de correction selon `correction.mode` :
  - `immediate` : dès validation, affichage juste/faux (icône + couleur, jamais couleur seule) + bonne réponse si faux, puis passage automatique à la question suivante après `timing.correctionDisplaySeconds`
  - `delayed` : la correction s'affiche après `correction.delaySeconds`, indépendamment du moment où l'utilisateur a répondu
  - `onDemand` : un bouton "Voir la réponse" apparaît après validation, la correction ne s'affiche qu'au clic
  - `endOfSeries` : aucune correction affichée pendant la série, uniquement l'écran de résultats à la fin liste toutes les questions avec bonnes/mauvaises réponses
  - `none` : pas de correction du tout, à aucun moment (mode entraînement pur)

### 4.5 Page de résultats (`ResultsPage.tsx`)

- Score global (X/Y bonnes réponses), temps total et temps moyen par question
- Répartition des erreurs par type d'opération (si plusieurs opérations mélangées)
- Si `correction.mode === "endOfSeries"` : liste complète des questions avec réponse donnée vs correcte
- Actions : "Relancer la même config", "Retour à l'accueil", "Enregistrer cette config" (si ce n'était pas déjà une config sauvegardée)
- Écriture de l'historique dans `localStatsStore`

### 4.6 Page "Mes configurations" (`MyConfigsPage.tsx`)

- Liste des `SessionConfig` sauvegardées localement (nom, résumé, date de création)
- Actions par ligne : Lancer / Éditer (ouvre `ConfigPage` pré-rempli) / Dupliquer / Supprimer

---

## 5. Stockage local

**`localConfigStore.ts`** — clé `localStorage` : `calcul-mental:configs`, valeur = tableau de `SessionConfig` sérialisés en JSON.

**`localStatsStore.ts`** — clé `localStorage` : `calcul-mental:sessions-history`, valeur = tableau d'objets :

```typescript
interface SessionResult {
  configId: string;
  configName: string;
  date: string;          // ISO 8601
  totalQuestions: number;
  correctAnswers: number;
  averageTimeSeconds: number;
  breakdownByOperation: Record<Operation, { correct: number; total: number }>;
}
```

Prévoir une fonction d'export/import JSON simple (utile pour la migration vers un compte en Phase 2, et pour ne pas perdre les données si l'utilisateur vide son cache).

---

## 6. Design system — tokens

Fichier `styles/tokens.css`, variables CSS uniquement (aucune couleur en dur ailleurs dans le code) :

```css
:root {
  --color-bg: #E4E3DD;
  --color-card-bg: #FFFFFF;
  --color-panel: #EFEEE7;
  --color-ink: #17171A;
  --color-ink-soft: #6B6B66;
  --color-line: rgba(0,0,0,0.10);

  --color-accent: #3E6FD9;      /* actions, liens, éléments interactifs */
  --color-correct: #4E8B63;     /* toujours accompagné d'une icône ✓ */
  --color-incorrect: #C1583B;   /* toujours accompagné d'une icône ✗ */

  --color-op-addition: #4A7BD9;
  --color-op-subtraction: #8B6FD9;
  --color-op-multiplication: #D98F4A;
  --color-op-division: #4E8B63;
  --color-op-fraction: #4AA3A0;

  --font-main: 'Archivo', sans-serif;

  --radius: 18px;
  --radius-sm: 10px;
  --spacing-gap: 16px;
}
```

- **Aucune couleur ni police en valeur brute dans les composants** — tout passe par ces variables, pour permettre la personnalisation utilisateur prévue en Phase 2 sans refactorisation
- Structure visuelle : blocs indépendants à coins arrondis (`--radius`), espacés (`--spacing-gap`), jamais un unique cadre englobant avec des séparateurs internes
- Accessibilité : focus clavier visible sur tous les éléments interactifs, contraste AA minimum, jamais de code couleur seul pour juste/faux

### Composant nav (partagé, toutes pages sauf session)

- Bloc à part entière : fond blanc, bordure `--color-line`, `border-radius: var(--radius)`, marge basse `--spacing-gap`
- Logo à gauche (empilé sur 2 lignes), liens de navigation au centre, icônes à droite (apparence, compte — compte inactif visuellement en Phase 1)

---

## 7. Contenu des presets

### 7.1 Modes scolaires (valeurs de départ, ajustables)

| Niveau | Opérations | Plage entiers | Décimaux | Fractions | Négatifs | Opérandes |
|---|---|---|---|---|---|---|
| CP | addition, subtraction | 1–20 | non | non | non | 2 |
| CE1 | addition, subtraction, multiplication | 1–100 | non | non | non | 2 |
| CE2 | + division (exacte) | 1–100 | non | non | non | 2 |
| CM1 | toutes tables, division avec reste | 1–1000 | 1 décimale | fractions simples (1/2, 1/4, 1/3) | non | 2–3 |
| CM2 | idem + priorités simples | 1–1000 | 2 décimales | fractions simples + comparaison | non | 2–3 |
| 6e-5e | + fractions dénominateurs différents | 1–1000 | 2 décimales | avancées | oui | 2–3 |
| 4e-3e | + puissances, racines, pourcentages | 1–10000 | 2–3 décimales | avancées | oui | 2–4 |
| Lycée | tout mélangé, estimation rapide | large | 2–3 décimales | avancées | oui | 3–4 |

### 7.2 Modes thématiques

- **Tables de multiplication** : sélection d'une ou plusieurs tables spécifiques (`tablesOnly`)
- **Calcul rapide / Chrono** : `session.mode = "totalTime"`, 60 secondes, correction immédiate
- **Fractions & décimaux** : toutes opérations activées sur ces deux types uniquement
- **Mix Collège** : priorités opératoires + relatifs + puissances combinés

---

## 8. Critères d'acceptation Phase 1

- [ ] Un utilisateur peut lancer une session en 1 clic depuis un mode rapide de l'accueil
- [ ] Le mode Simple et le mode Avancé produisent tous deux un `SessionConfig` valide et utilisable par le même moteur
- [ ] Toutes les combinaisons opération × type de nombre listées fonctionnent sans erreur (pas de division par zéro, pas de fraction avec dénominateur 0, pas de racine négative)
- [ ] Les 4 modes de correction et les 4 modes de saisie sont tous fonctionnels
- [ ] Une configuration personnalisée est sauvegardée et rechargeable après rafraîchissement de la page (persistance localStorage)
- [ ] Le site est utilisable au clavier seul (accessibilité)
- [ ] Le site est responsive de 360px à desktop large
- [ ] Aucune couleur/police en valeur brute dans le CSS des composants (tout passe par les tokens)

---

## PHASE 2 — Synthèse (architecture à anticiper, développement ultérieur)

Ne pas développer maintenant, mais concevoir la Phase 1 pour que ces ajouts n'imposent pas de refonte :

- **Comptes utilisateurs** : prévoir un point d'entrée unique pour l'état "utilisateur connecté ou non" (ex: contexte React `AuthContext` vide/mocké en Phase 1, prêt à être branché)
- **Monétisation freemium** : 5 sessions gratuites, puis 3€ pour 30 jours d'accès (paiement unique, pas d'abonnement récurrent, Stripe one-time payment) — le compteur de sessions gratuites doit pouvoir être lu depuis `localStatsStore` en attendant le backend
- **Multilingue** : ne jamais coder de texte en dur dans les composants — centraliser tous les libellés dans un objet/fichier de traduction dès la Phase 1 (même avec une seule langue disponible), pour rendre l'ajout d'i18n indolore
- **Mode vocal** : le moteur de génération doit produire un texte de question totalement découplé de son affichage (`displayText` généré séparément de la mise en forme visuelle), pour pouvoir être envoyé tel quel à `SpeechSynthesis` sans réécrire la logique
- **Personnalisation apparence utilisateur** : puisque tous les tokens sont déjà en variables CSS (section 6), il suffira d'ajouter une interface de sélection qui réécrit ces variables à la volée + persistance du choix
