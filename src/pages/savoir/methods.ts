export interface WorkedExample {
  problem: string
  steps: string[]
  result: string
}

export interface Method {
  slug: string
  operationKey: string
  title: string
  shortTip: string
  shortExample: string
  intro: string
  steps: string[]
  examples: WorkedExample[]
  tips: string[]
}

export interface OperationMeta {
  key: string
  label: string
  symbol: string
  colorVar: string
}

export const OPERATIONS: OperationMeta[] = [
  { key: 'addition', label: 'Addition', symbol: '+', colorVar: '--color-op-addition' },
  { key: 'subtraction', label: 'Soustraction', symbol: '−', colorVar: '--color-op-subtraction' },
  { key: 'multiplication', label: 'Multiplication', symbol: '×', colorVar: '--color-op-multiplication' },
  { key: 'division', label: 'Division', symbol: '÷', colorVar: '--color-op-division' },
]

export const METHODS: Method[] = [
  {
    slug: 'dizaine-superieure',
    operationKey: 'addition',
    title: 'Passer par la dizaine supérieure',
    shortTip: "Complète le premier nombre jusqu'à la dizaine ronde, puis ajoute ce qu'il reste.",
    shortExample: '8 + 5 → 8 + 2 = 10, puis 10 + 3 = 13',
    intro:
      "Quand un des nombres est proche d'une dizaine, il est souvent plus simple d'atteindre d'abord la dizaine ronde, plutôt que d'additionner directement les deux nombres tels quels.",
    steps: [
      'Repère combien il manque au premier nombre pour atteindre la dizaine supérieure.',
      'Retire cette quantité au second nombre.',
      'Additionne le premier nombre (arrondi à la dizaine) et le reste du second nombre.',
    ],
    examples: [
      {
        problem: '8 + 5',
        steps: ['8 est à 2 de la dizaine supérieure (10).', 'On retire 2 à 5 : il reste 3.', '10 + 3 = 13.'],
        result: '13',
      },
      {
        problem: '27 + 6',
        steps: ['27 est à 3 de 30.', 'On retire 3 à 6 : il reste 3.', '30 + 3 = 33.'],
        result: '33',
      },
    ],
    tips: [
      'Cette méthode est particulièrement efficace quand un nombre se termine par 7, 8 ou 9.',
      "Entraîne-toi à repérer instantanément l'écart jusqu'à la dizaine : c'est la clé de la rapidité.",
    ],
  },
  {
    slug: 'decomposer-dizaines-unites',
    operationKey: 'addition',
    title: 'Décomposer en dizaines et unités',
    shortTip: 'Additionne les dizaines entre elles, les unités entre elles, puis regroupe.',
    shortExample: '47 + 36 → 40 + 30 = 70, 7 + 6 = 13, 70 + 13 = 83',
    intro:
      "On sépare chaque nombre en dizaines et en unités, on additionne les deux paquets séparément, puis on recombine. C'est la méthode la plus naturelle et la plus fiable pour les grands nombres.",
    steps: [
      'Sépare chaque nombre en dizaines + unités.',
      'Additionne les dizaines entre elles.',
      'Additionne les unités entre elles.',
      "Si le total des unités dépasse 9, transforme la dizaine en trop et ajoute-la au total des dizaines.",
      'Additionne les deux résultats.',
    ],
    examples: [
      {
        problem: '47 + 36',
        steps: ['47 = 40 + 7, 36 = 30 + 6.', '40 + 30 = 70.', '7 + 6 = 13.', '70 + 13 = 83.'],
        result: '83',
      },
      {
        problem: '58 + 24',
        steps: ['58 = 50 + 8, 24 = 20 + 4.', '50 + 20 = 70.', '8 + 4 = 12.', '70 + 12 = 82.'],
        result: '82',
      },
    ],
    tips: [
      "C'est la méthode par défaut : elle fonctionne toujours, même si elle demande un peu plus de mémoire de travail.",
      "Avec de l'entraînement, l'étape des dizaines devient automatique et tu gagnes en vitesse.",
    ],
  },
  {
    slug: 'compensation-addition',
    operationKey: 'addition',
    title: 'Compensation',
    shortTip: "Arrondis un nombre proche d'une dizaine ronde, puis corrige le résultat.",
    shortExample: '99 + 47 → 100 + 47 = 147, puis 147 − 1 = 146',
    intro:
      "Si un nombre est proche d'une dizaine ou d'une centaine ronde (99, 199, 48…), on l'arrondit pour simplifier le calcul, puis on corrige le résultat de la différence ajoutée ou enlevée en trop.",
    steps: [
      'Arrondis un des deux nombres à la dizaine (ou centaine) la plus proche.',
      'Effectue l\'addition avec le nombre arrondi.',
      "Corrige le résultat en ajoutant ou retirant la différence d'arrondi.",
    ],
    examples: [
      {
        problem: '99 + 47',
        steps: ['99 est proche de 100 (+1).', '100 + 47 = 147.', 'On avait ajouté 1 en trop, donc on retire 1 : 147 − 1 = 146.'],
        result: '146',
      },
      {
        problem: '48 + 35',
        steps: ['48 est proche de 50 (+2).', '50 + 35 = 85.', 'On retire les 2 ajoutés en trop : 85 − 2 = 83.'],
        result: '83',
      },
    ],
    tips: [
      'Utile surtout pour les nombres qui se terminent par 8, 9, ou proches de 1, 2.',
      "N'oublie jamais l'étape de correction finale : c'est celle qu'on oublie le plus souvent !",
    ],
  },

  {
    slug: 'completer-ecart',
    operationKey: 'subtraction',
    title: "Compléter l'écart",
    shortTip: 'Compte de combien il faut avancer du petit nombre jusqu\'au grand.',
    shortExample: '82 − 47 → 47 à 50 (+3), 50 à 82 (+32) → écart de 35',
    intro:
      "Plutôt que de soustraire directement, on avance du plus petit nombre vers le plus grand en passant par des étapes rondes, puis on additionne tous les sauts effectués : c'est cette somme qui donne le résultat.",
    steps: [
      'Pars du plus petit nombre.',
      'Avance jusqu\'à la dizaine (ou centaine) ronde suivante, en notant le saut effectué.',
      'Continue par sauts ronds jusqu\'à te rapprocher du grand nombre.',
      'Termine par un dernier petit saut jusqu\'au grand nombre.',
      'Additionne tous les sauts : c\'est la réponse.',
    ],
    examples: [
      {
        problem: '82 − 47',
        steps: ['47 → 50 : +3.', '50 → 80 : +30.', '80 → 82 : +2.', 'Total des sauts : 3 + 30 + 2 = 35.'],
        result: '35',
      },
      {
        problem: '61 − 38',
        steps: ['38 → 40 : +2.', '40 → 60 : +20.', '60 → 61 : +1.', 'Total : 2 + 20 + 1 = 23.'],
        result: '23',
      },
    ],
    tips: [
      'Excellent pour les soustractions où les deux nombres sont proches.',
      "Visualise une ligne graduée dans ta tête : c'est souvent plus intuitif que de « retirer ».",
    ],
  },
  {
    slug: 'retirer-nombre-rond',
    operationKey: 'subtraction',
    title: 'Retirer un nombre rond puis rajuster',
    shortTip: 'Retire une dizaine ronde proche, puis corrige la petite différence.',
    shortExample: '63 − 29 → 63 − 30 = 33, puis 33 + 1 = 34',
    intro:
      "On retire un nombre rond proche du nombre à soustraire (plutôt que le nombre exact), ce qui simplifie le calcul, puis on corrige le petit écart créé par cet arrondi.",
    steps: [
      'Arrondis le nombre à soustraire à la dizaine la plus proche.',
      'Effectue la soustraction avec ce nombre rond.',
      'Corrige : si tu as trop retiré, rajoute la différence ; si tu n\'as pas assez retiré, retire-la.',
    ],
    examples: [
      {
        problem: '63 − 29',
        steps: ['29 est proche de 30.', '63 − 30 = 33.', 'On a retiré 1 de trop (30 au lieu de 29), donc on rajoute 1 : 33 + 1 = 34.'],
        result: '34',
      },
      {
        problem: '145 − 58',
        steps: ['58 est proche de 60.', '145 − 60 = 85.', 'On a retiré 2 de trop, donc on rajoute 2 : 85 + 2 = 87.'],
        result: '87',
      },
    ],
    tips: [
      'Fonctionne très bien dès que le nombre à soustraire finit par 8 ou 9.',
      'Attention au sens de la correction : si tu as trop retiré, tu dois rajouter — pas l\'inverse.',
    ],
  },
  {
    slug: 'decomposer-nombre-a-soustraire',
    operationKey: 'subtraction',
    title: 'Décomposer le nombre à soustraire',
    shortTip: "Retire d'abord les dizaines, puis les unités.",
    shortExample: '84 − 37 → 84 − 30 = 54, puis 54 − 7 = 47',
    intro:
      "On soustrait d'abord les dizaines, puis les unités, en deux étapes séparées plutôt qu'en un seul calcul. C'est la méthode la plus fiable quand aucun raccourci évident n'apparaît.",
    steps: [
      'Sépare le nombre à soustraire en dizaines + unités.',
      "Retire d'abord les dizaines.",
      'Retire ensuite les unités.',
    ],
    examples: [
      {
        problem: '84 − 37',
        steps: ['37 = 30 + 7.', '84 − 30 = 54.', '54 − 7 = 47.'],
        result: '47',
      },
      {
        problem: '96 − 42',
        steps: ['42 = 40 + 2.', '96 − 40 = 56.', '56 − 2 = 54.'],
        result: '54',
      },
    ],
    tips: [
      'La méthode la plus fiable quand aucun raccourci évident ne saute aux yeux.',
      "Si tu bloques sur l'ordre, retire toujours les dizaines avant les unités : c'est plus naturel.",
    ],
  },

  {
    slug: 'doubler-x2-x4-x8',
    operationKey: 'multiplication',
    title: 'Doubler pour ×2, ×4, ×8',
    shortTip: 'Double une, deux ou trois fois selon le facteur.',
    shortExample: '23 × 4 → 23 × 2 = 46, puis 46 × 2 = 92',
    intro:
      "Multiplier par 2, 4 ou 8 revient à doubler une, deux ou trois fois de suite — souvent bien plus rapide que de poser une multiplication directe.",
    steps: [
      'Pour ×2, double une fois.',
      'Pour ×4, double deux fois de suite.',
      'Pour ×8, double trois fois de suite.',
    ],
    examples: [
      {
        problem: '23 × 4',
        steps: ['23 × 2 = 46.', '46 × 2 = 92.'],
        result: '92',
      },
      {
        problem: '17 × 8',
        steps: ['17 × 2 = 34.', '34 × 2 = 68.', '68 × 2 = 136.'],
        result: '136',
      },
    ],
    tips: [
      "Entraîne-toi à doubler vite, même les grands nombres : c'est la base de beaucoup de raccourcis.",
      'Le même principe marche pour ×16 (quadrupler deux fois), ×32, etc.',
    ],
  },
  {
    slug: 'x5-x10-puis-div2',
    operationKey: 'multiplication',
    title: '×5 = ×10 puis ÷2',
    shortTip: 'Multiplie par 10 (facile), puis divise le résultat par 2.',
    shortExample: '46 × 5 → 460 ÷ 2 = 230',
    intro:
      "Multiplier par 10 est immédiat (on ajoute un zéro), donc pour multiplier par 5, on multiplie par 10 puis on divise simplement le résultat par 2.",
    steps: [
      'Multiplie le nombre par 10 (ajoute un zéro).',
      'Divise le résultat obtenu par 2.',
    ],
    examples: [
      {
        problem: '46 × 5',
        steps: ['46 × 10 = 460.', '460 ÷ 2 = 230.'],
        result: '230',
      },
      {
        problem: '37 × 5',
        steps: ['37 × 10 = 370.', '370 ÷ 2 = 185.'],
        result: '185',
      },
    ],
    tips: [
      'Marche aussi à l\'envers pour diviser par 5 (voir la méthode équivalente en Division).',
      'Pour ×50, fais ×100 puis ÷2.',
    ],
  },
  {
    slug: 'x9-x10-moins-nombre',
    operationKey: 'multiplication',
    title: '×9 = ×10 moins le nombre',
    shortTip: 'Multiplie par 10, puis retire le nombre de départ.',
    shortExample: '23 × 9 → 230 − 23 = 207',
    intro:
      'Multiplier par 9 revient à multiplier par 10 puis retirer une fois le nombre de départ au résultat.',
    steps: [
      'Multiplie le nombre par 10.',
      'Retire le nombre de départ (une seule fois) au résultat obtenu.',
    ],
    examples: [
      {
        problem: '23 × 9',
        steps: ['23 × 10 = 230.', '230 − 23 = 207.'],
        result: '207',
      },
      {
        problem: '48 × 9',
        steps: ['48 × 10 = 480.', '480 − 48 = 432.'],
        result: '432',
      },
    ],
    tips: [
      'La même logique marche pour ×99 (×100 − le nombre) ou ×11 (×10 + le nombre).',
      "Utile aussi pour vérifier rapidement une table de 9 sans l'avoir apprise par cœur.",
    ],
  },
  {
    slug: 'distribuer',
    operationKey: 'multiplication',
    title: 'Distribuer',
    shortTip: 'Décompose un facteur en dizaines + unités et multiplie chaque partie.',
    shortExample: '23 × 6 → 20 × 6 = 120, 3 × 6 = 18, 120 + 18 = 138',
    intro:
      "On décompose un des facteurs en dizaines et unités, on multiplie l'autre facteur par chaque partie séparément, puis on additionne les résultats. C'est la méthode universelle : elle fonctionne pour n'importe quelle multiplication.",
    steps: [
      'Décompose un facteur en dizaines + unités.',
      "Multiplie l'autre facteur par la partie dizaines.",
      "Multiplie l'autre facteur par la partie unités.",
      'Additionne les deux résultats.',
    ],
    examples: [
      {
        problem: '23 × 6',
        steps: ['23 = 20 + 3.', '20 × 6 = 120.', '3 × 6 = 18.', '120 + 18 = 138.'],
        result: '138',
      },
      {
        problem: '34 × 7',
        steps: ['34 = 30 + 4.', '30 × 7 = 210.', '4 × 7 = 28.', '210 + 28 = 238.'],
        result: '238',
      },
    ],
    tips: [
      "C'est la méthode de secours qui marche toujours, même quand aucun raccourci ne s'applique.",
      'Plus tu connais tes tables par cœur, plus cette méthode devient rapide et fiable.',
    ],
  },

  {
    slug: 'multiple-proche',
    operationKey: 'division',
    title: 'Chercher un multiple proche',
    shortTip: "Pense à la table de multiplication du diviseur, à l'envers.",
    shortExample: '84 ÷ 7 → 7 × 12 = 84, donc 84 ÷ 7 = 12',
    intro:
      "Diviser revient à se demander « combien de fois le diviseur rentre-t-il dans le nombre ? ». On cherche donc, dans la table de multiplication du diviseur, le multiple qui s'en approche le plus.",
    steps: [
      'Pense à la table de multiplication du diviseur.',
      'Cherche le multiple le plus proche (sans dépasser) du nombre à diviser.',
      'Le facteur trouvé est le résultat de la division.',
    ],
    examples: [
      {
        problem: '84 ÷ 7',
        steps: ['Table de 7 : … 7×10=70, 7×11=77, 7×12=84.', '7 × 12 = 84 correspond exactement.'],
        result: '12',
      },
      {
        problem: '96 ÷ 8',
        steps: ['Table de 8 : 8×10=80, 8×12=96.', '8 × 12 = 96 correspond exactement.'],
        result: '12',
      },
    ],
    tips: [
      'Connaître ses tables par cœur rend cette méthode quasi instantanée.',
      "Si le nombre ne tombe pas juste, prends le multiple juste en dessous pour trouver le quotient et le reste.",
    ],
  },
  {
    slug: 'div5-x2-puis-div10',
    operationKey: 'division',
    title: '÷5 = ×2 puis ÷10',
    shortTip: 'Double le nombre, puis divise le résultat par 10.',
    shortExample: '130 ÷ 5 → 130 × 2 = 260, 260 ÷ 10 = 26',
    intro:
      'Diviser par 5 revient à doubler le nombre puis à diviser le résultat par 10, ce qui est immédiat (on enlève un zéro).',
    steps: [
      'Double le nombre.',
      'Divise le résultat par 10 (enlève un zéro, ou décale la virgule).',
    ],
    examples: [
      {
        problem: '130 ÷ 5',
        steps: ['130 × 2 = 260.', '260 ÷ 10 = 26.'],
        result: '26',
      },
      {
        problem: '45 ÷ 5',
        steps: ['45 × 2 = 90.', '90 ÷ 10 = 9.'],
        result: '9',
      },
    ],
    tips: [
      "C'est l'inverse exact de la méthode « ×5 = ×10 puis ÷2 ».",
      'Fonctionne aussi pour ÷50 : ×2 puis ÷100.',
    ],
  },
  {
    slug: 'diviser-plusieurs-etapes',
    operationKey: 'division',
    title: 'Diviser en plusieurs étapes pour ÷4, ÷8',
    shortTip: 'Divise par 2, deux ou trois fois de suite.',
    shortExample: '96 ÷ 4 → 96 ÷ 2 = 48, puis 48 ÷ 2 = 24',
    intro: 'Diviser par 4 ou par 8 revient à diviser par 2 plusieurs fois de suite — un calcul beaucoup plus simple à répéter.',
    steps: [
      'Pour ÷4, divise par 2 deux fois de suite.',
      'Pour ÷8, divise par 2 trois fois de suite.',
    ],
    examples: [
      {
        problem: '96 ÷ 4',
        steps: ['96 ÷ 2 = 48.', '48 ÷ 2 = 24.'],
        result: '24',
      },
      {
        problem: '144 ÷ 8',
        steps: ['144 ÷ 2 = 72.', '72 ÷ 2 = 36.', '36 ÷ 2 = 18.'],
        result: '18',
      },
    ],
    tips: [
      'Diviser par 2 est souvent le calcul le plus simple qui soit : profites-en pour le répéter.',
      "Si le nombre est impair à une étape, la division ne tombera pas juste : c'est normal, continue avec les décimales si besoin.",
    ],
  },
]

export function methodsByOperation(operationKey: string): Method[] {
  return METHODS.filter((m) => m.operationKey === operationKey)
}

export function findMethod(operationKey: string, slug: string): Method | undefined {
  return METHODS.find((m) => m.operationKey === operationKey && m.slug === slug)
}
