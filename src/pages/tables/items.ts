import type { TableCategoryKind } from './categories'

export interface TableItem {
  id: string
  label: string
  lines: string[]
}

const RANGE_1_TO_10 = Array.from({ length: 10 }, (_, i) => i + 1)
const RANGE_1_TO_15 = Array.from({ length: 15 }, (_, i) => i + 1)

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
}

function toSuperscript(n: number): string {
  return String(n)
    .split('')
    .map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit)
    .join('')
}

function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR')
}

const PRIMES_UNDER_100 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]

const FRACTION_EQUIVALENTS: { fraction: string; decimal: string; percent: string }[] = [
  { fraction: '1/2', decimal: '0,5', percent: '50 %' },
  { fraction: '1/3', decimal: '≈ 0,33', percent: '≈ 33,3 %' },
  { fraction: '2/3', decimal: '≈ 0,67', percent: '≈ 66,7 %' },
  { fraction: '1/4', decimal: '0,25', percent: '25 %' },
  { fraction: '3/4', decimal: '0,75', percent: '75 %' },
  { fraction: '1/5', decimal: '0,2', percent: '20 %' },
  { fraction: '2/5', decimal: '0,4', percent: '40 %' },
  { fraction: '3/5', decimal: '0,6', percent: '60 %' },
  { fraction: '4/5', decimal: '0,8', percent: '80 %' },
  { fraction: '1/8', decimal: '0,125', percent: '12,5 %' },
  { fraction: '1/10', decimal: '0,1', percent: '10 %' },
  { fraction: '1/6', decimal: '≈ 0,17', percent: '≈ 16,7 %' },
  { fraction: '1/100', decimal: '0,01', percent: '1 %' },
]

const AREA_FORMULAS = [
  { shape: 'Carré', formula: 'A = c²', legend: 'c = longueur du côté' },
  { shape: 'Rectangle', formula: 'A = L × l', legend: 'L = longueur, l = largeur' },
  { shape: 'Triangle', formula: 'A = (b × h) ÷ 2', legend: 'b = base, h = hauteur' },
  { shape: 'Cercle', formula: 'A = π × r²', legend: 'r = rayon' },
]

const PERIMETER_FORMULAS = [
  { shape: 'Carré', formula: 'P = 4 × c', legend: 'c = longueur du côté' },
  { shape: 'Rectangle', formula: 'P = 2 × (L + l)', legend: 'L = longueur, l = largeur' },
  { shape: 'Triangle', formula: 'P = a + b + c', legend: 'somme des 3 côtés' },
  { shape: 'Cercle', formula: 'P = 2 × π × r', legend: 'r = rayon (circonférence)' },
]

const TRIGONOMETRY_ROWS: { angle: string; sin: string; cos: string; tan: string }[] = [
  { angle: '0°', sin: '0', cos: '1', tan: '0' },
  { angle: '30°', sin: '1/2', cos: '√3/2', tan: '√3/3' },
  { angle: '45°', sin: '√2/2', cos: '√2/2', tan: '1' },
  { angle: '60°', sin: '√3/2', cos: '1/2', tan: '√3' },
  { angle: '90°', sin: '1', cos: '0', tan: '—' },
]

const LENGTH_UNITS = [
  { unit: 'km', equivalent: '1 000 m' },
  { unit: 'hm', equivalent: '100 m' },
  { unit: 'dam', equivalent: '10 m' },
  { unit: 'm', equivalent: '1 m' },
  { unit: 'dm', equivalent: '0,1 m' },
  { unit: 'cm', equivalent: '0,01 m' },
  { unit: 'mm', equivalent: '0,001 m' },
]

const MASS_UNITS = [
  { unit: 'kg', equivalent: '1 000 g' },
  { unit: 'hg', equivalent: '100 g' },
  { unit: 'dag', equivalent: '10 g' },
  { unit: 'g', equivalent: '1 g' },
  { unit: 'dg', equivalent: '0,1 g' },
  { unit: 'cg', equivalent: '0,01 g' },
  { unit: 'mg', equivalent: '0,001 g' },
]

const VOLUME_UNITS = [
  { unit: 'kL', equivalent: '1 000 L' },
  { unit: 'hL', equivalent: '100 L' },
  { unit: 'daL', equivalent: '10 L' },
  { unit: 'L', equivalent: '1 L' },
  { unit: 'dL', equivalent: '0,1 L' },
  { unit: 'cL', equivalent: '0,01 L' },
  { unit: 'mL', equivalent: '0,001 L' },
]

export function getTableItems(kind: TableCategoryKind): TableItem[] {
  switch (kind) {
    case 'multiplication':
      return RANGE_1_TO_10.map((n) => ({
        id: String(n),
        label: `Table de ${n}`,
        lines: RANGE_1_TO_10.map((k) => `${n} × ${k} = ${n * k}`),
      }))

    case 'division':
      return RANGE_1_TO_10.map((d) => ({
        id: String(d),
        label: `Table de ${d}`,
        lines: RANGE_1_TO_10.map((k) => `${d * k} ÷ ${d} = ${k}`),
      }))

    case 'complements10':
      return ([[0, 10], [1, 9], [2, 8], [3, 7], [4, 6], [5, 5]] as [number, number][]).map(([a, b]) => ({
        id: String(a),
        label: `${a} + ${b}`,
        lines: [`${a} + ${b} = 10`],
      }))

    case 'squares':
      return RANGE_1_TO_15.map((n) => ({
        id: String(n),
        label: `${n}²`,
        lines: [`${n}² = ${n * n}`, `√${n * n} = ${n}`],
      }))

    case 'powersOf2':
      return RANGE_1_TO_10.map((exp) => ({
        id: String(exp),
        label: `2${toSuperscript(exp)}`,
        lines: [`2${toSuperscript(exp)} = ${formatNumber(2 ** exp)}`],
      }))

    case 'powersOf10': {
      const exponents = Array.from({ length: 7 }, (_, i) => i)
      return exponents.map((exp) => ({
        id: String(exp),
        label: `10${toSuperscript(exp)}`,
        lines: [`10${toSuperscript(exp)} = ${formatNumber(10 ** exp)}`],
      }))
    }

    case 'primes':
      return PRIMES_UNDER_100.map((p) => ({
        id: String(p),
        label: String(p),
        lines: [`${p} est un nombre premier`, 'Divisible seulement par 1 et lui-même'],
      }))

    case 'rootApprox':
      return [
        { id: '2', label: '√2', lines: ['√2 ≈ 1,414'] },
        { id: '3', label: '√3', lines: ['√3 ≈ 1,732'] },
        { id: '5', label: '√5', lines: ['√5 ≈ 2,236'] },
      ]

    case 'fractions':
      return FRACTION_EQUIVALENTS.map((f, index) => ({
        id: String(index),
        label: f.fraction,
        lines: [`${f.fraction} = ${f.decimal}`, `${f.fraction} = ${f.percent}`],
      }))

    case 'areaFormulas':
      return AREA_FORMULAS.map((item, index) => ({
        id: String(index),
        label: item.shape,
        lines: [item.formula, item.legend],
      }))

    case 'perimeterFormulas':
      return PERIMETER_FORMULAS.map((item, index) => ({
        id: String(index),
        label: item.shape,
        lines: [item.formula, item.legend],
      }))

    case 'pythagoras':
      return [
        {
          id: 'theoreme',
          label: 'Théorème',
          lines: ['a² + b² = c²', "c = hypoténuse, a et b = les 2 autres côtés"],
        },
        { id: 'exemple', label: 'Exemple', lines: ['3² + 4² = 5²', '9 + 16 = 25'] },
      ]

    case 'triangleAngles':
      return [
        { id: 'somme', label: 'Somme', lines: ["La somme des angles d'un triangle vaut 180°"] },
        { id: 'equilateral', label: 'Équilatéral', lines: ['60° + 60° + 60° = 180°'] },
        { id: 'rectangle-isocele', label: 'Rectangle isocèle', lines: ['90° + 45° + 45° = 180°'] },
        { id: 'rectangle', label: 'Rectangle', lines: ['30° + 60° + 90° = 180°'] },
      ]

    case 'identities':
      return [
        { id: 'somme-carre', label: '(a + b)²', lines: ['(a + b)² = a² + 2ab + b²'] },
        { id: 'diff-carre', label: '(a − b)²', lines: ['(a − b)² = a² − 2ab + b²'] },
        { id: 'produit', label: '(a + b)(a − b)', lines: ['(a + b)(a − b) = a² − b²'] },
      ]

    case 'trigonometry':
      return TRIGONOMETRY_ROWS.map((row) => ({
        id: row.angle.replace('°', ''),
        label: row.angle,
        lines: [`sin(${row.angle}) = ${row.sin}`, `cos(${row.angle}) = ${row.cos}`, `tan(${row.angle}) = ${row.tan}`],
      }))

    case 'unitConversions':
      return [
        ...LENGTH_UNITS.map((u) => ({ ...u, group: 'Longueur' })),
        ...MASS_UNITS.map((u) => ({ ...u, group: 'Masse' })),
        ...VOLUME_UNITS.map((u) => ({ ...u, group: 'Volume' })),
      ].map((u, index) => ({
        id: String(index),
        label: u.unit,
        lines: [`1 ${u.unit} = ${u.equivalent}`, u.group],
      }))

    default:
      return []
  }
}
