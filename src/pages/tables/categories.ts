export type TableCategoryGroup = 'calcul' | 'geometrie' | 'trigo-unites'

export type TableCategoryKind =
  | 'multiplication'
  | 'division'
  | 'complements10'
  | 'squares'
  | 'powersOf2'
  | 'powersOf10'
  | 'primes'
  | 'rootApprox'
  | 'fractions'
  | 'areaFormulas'
  | 'perimeterFormulas'
  | 'pythagoras'
  | 'triangleAngles'
  | 'identities'
  | 'trigonometry'
  | 'unitConversions'

export interface TableCategory {
  slug: string
  label: string
  shortLabel: string
  icon: string
  group: TableCategoryGroup
  kind: TableCategoryKind
}

export const GROUP_LABELS: Record<TableCategoryGroup, string> = {
  calcul: 'Calcul mental',
  geometrie: 'Géométrie',
  'trigo-unites': 'Trigonométrie & unités',
}

export const TABLE_CATEGORIES: TableCategory[] = [
  {
    slug: 'multiplication',
    label: 'Tables de multiplication (1 à 10)',
    shortLabel: 'Multiplication',
    icon: '×',
    group: 'calcul',
    kind: 'multiplication',
  },
  {
    slug: 'complements-10',
    label: 'Compléments à 10',
    shortLabel: 'Compléments à 10',
    icon: '+',
    group: 'calcul',
    kind: 'complements10',
  },
  {
    slug: 'division',
    label: 'Tables de division',
    shortLabel: 'Division',
    icon: '÷',
    group: 'calcul',
    kind: 'division',
  },
  {
    slug: 'carres',
    label: 'Carrés parfaits (1² à 15²) et leurs racines carrées',
    shortLabel: 'Carrés et racines',
    icon: '²',
    group: 'calcul',
    kind: 'squares',
  },
  {
    slug: 'puissances-de-2',
    label: 'Puissances de 2 (2¹ à 2¹⁰)',
    shortLabel: 'Puissances de 2',
    icon: '2ⁿ',
    group: 'calcul',
    kind: 'powersOf2',
  },
  {
    slug: 'puissances-de-10',
    label: 'Puissances de 10',
    shortLabel: 'Puissances de 10',
    icon: '10ⁿ',
    group: 'calcul',
    kind: 'powersOf10',
  },
  {
    slug: 'nombres-premiers',
    label: 'Nombres premiers',
    shortLabel: 'Nombres premiers',
    icon: '7',
    group: 'calcul',
    kind: 'primes',
  },
  {
    slug: 'racines-approchees',
    label: 'Valeurs approchées de √2, √3, √5',
    shortLabel: 'Racines approchées',
    icon: '√',
    group: 'calcul',
    kind: 'rootApprox',
  },
  {
    slug: 'fractions-decimaux-pourcentages',
    label: 'Équivalences fractions / décimaux / pourcentages',
    shortLabel: 'Fractions, décimaux, %',
    icon: '½',
    group: 'calcul',
    kind: 'fractions',
  },
  {
    slug: 'aires',
    label: "Formules d'aires",
    shortLabel: "Formules d'aires",
    icon: '▢',
    group: 'geometrie',
    kind: 'areaFormulas',
  },
  {
    slug: 'perimetres',
    label: 'Formules de périmètres',
    shortLabel: 'Périmètres',
    icon: '⬭',
    group: 'geometrie',
    kind: 'perimeterFormulas',
  },
  {
    slug: 'pythagore',
    label: 'Théorème de Pythagore',
    shortLabel: 'Pythagore',
    icon: '△',
    group: 'geometrie',
    kind: 'pythagoras',
  },
  {
    slug: 'angles-triangle',
    label: "Somme des angles d'un triangle",
    shortLabel: 'Angles du triangle',
    icon: '∠',
    group: 'geometrie',
    kind: 'triangleAngles',
  },
  {
    slug: 'identites-remarquables',
    label: 'Identités remarquables',
    shortLabel: 'Identités remarquables',
    icon: 'a²',
    group: 'geometrie',
    kind: 'identities',
  },
  {
    slug: 'trigonometrie',
    label: 'Valeurs de sin / cos / tan pour les angles usuels',
    shortLabel: 'sin / cos / tan',
    icon: 'sin',
    group: 'trigo-unites',
    kind: 'trigonometry',
  },
  {
    slug: 'conversions',
    label: "Conversions d'unités (longueur, masse, volume)",
    shortLabel: "Conversions d'unités",
    icon: '⇄',
    group: 'trigo-unites',
    kind: 'unitConversions',
  },
]

export function findCategoryBySlug(slug: string | undefined): TableCategory | undefined {
  return TABLE_CATEGORIES.find((category) => category.slug === slug)
}
