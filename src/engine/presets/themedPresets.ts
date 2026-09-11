import type { SessionConfig } from '../types'

const DEFAULT_ANSWER: SessionConfig['answer'] = { inputMode: 'keyboard' }
const DEFAULT_TIMING: SessionConfig['timing'] = { responseTimeSeconds: null, correctionDisplaySeconds: 2 }

/** "Tables de multiplication" — pick one or several specific tables (`tablesOnly`). */
export function createTablesPreset(tables: number[]): SessionConfig {
  return {
    id: `themed-tables-${tables.join('-')}`,
    name: tables.length === 1 ? `Table de ${tables[0]}` : `Tables : ${tables.join(', ')}`,
    source: 'preset',
    operations: ['multiplication', 'division'],
    numberTypes: {
      integer: { enabled: true, min: 1, max: 12 },
      decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
      fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
      allowNegative: false,
    },
    difficulty: {
      operandsCount: 2,
      forceCarry: null,
      tablesOnly: tables,
      divisionExactOnly: true,
    },
    session: { mode: 'fixedCount', questionCount: 20 },
    answer: DEFAULT_ANSWER,
    correction: { mode: 'immediate' },
    timing: DEFAULT_TIMING,
  }
}

const multiplicationTables: SessionConfig = createTablesPreset([2, 3, 4, 5, 6, 7, 8, 9])

const firstSteps: SessionConfig = {
  id: 'themed-premiers-pas',
  name: 'Premiers pas',
  source: 'preset',
  operations: ['addition', 'subtraction'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 20 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 10 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: { responseTimeSeconds: null, correctionDisplaySeconds: 3 },
  showHints: true,
}

const quickChrono: SessionConfig = {
  id: 'themed-chrono',
  name: 'Calcul rapide / Chrono',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: {
    operandsCount: 2,
    forceCarry: null,
    tablesOnly: null,
    divisionExactOnly: true,
  },
  session: { mode: 'totalTime', totalTimeSeconds: 60 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const fractionsAndDecimals: SessionConfig = {
  id: 'themed-fractions-decimals',
  name: 'Fractions & décimaux',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: false, min: 1, max: 100 },
    decimal: { enabled: true, decimals: 2, min: 0, max: 100 },
    fraction: { enabled: true, numeratorMax: 9, denominators: [2, 3, 4, 5, 6, 8, 10], simplifyResult: true, allowImproper: true },
    allowNegative: false,
  },
  difficulty: {
    operandsCount: 2,
    forceCarry: null,
    tablesOnly: null,
    divisionExactOnly: false,
  },
  session: { mode: 'fixedCount', questionCount: 20 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const middleSchoolMix: SessionConfig = {
  id: 'themed-mix-college',
  name: 'Mix Collège',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division', 'orderOfOperations', 'power'],
  numberTypes: {
    integer: { enabled: true, min: -1000, max: 1000 },
    decimal: { enabled: false, decimals: 2, min: -1000, max: 1000 },
    fraction: { enabled: false, numeratorMax: 9, denominators: [2, 3, 4, 5], simplifyResult: true, allowImproper: true },
    allowNegative: true,
  },
  difficulty: {
    operandsCount: 3,
    forceCarry: null,
    tablesOnly: null,
    divisionExactOnly: false,
    maxPowerExponent: 3,
  },
  session: { mode: 'fixedCount', questionCount: 20 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const additionSubtraction: SessionConfig = {
  id: 'themed-addition-subtraction',
  name: 'Additions & soustractions',
  source: 'preset',
  operations: ['addition', 'subtraction'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 20 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const multiplicationDivision: SessionConfig = {
  id: 'themed-multiplication-division',
  name: 'Multiplications & divisions',
  source: 'preset',
  operations: ['multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 20 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const survival: SessionConfig = {
  id: 'themed-survival',
  name: 'Survie',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'survival' },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const mcqFlash: SessionConfig = {
  id: 'themed-mcq',
  name: 'QCM éclair',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 50 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: { inputMode: 'mcq', mcqChoicesCount: 4 },
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const percentages: SessionConfig = {
  id: 'themed-percentage',
  name: 'Pourcentages',
  source: 'preset',
  operations: ['percentage'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 200 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const orderOfOperations: SessionConfig = {
  id: 'themed-order-of-operations',
  name: 'Priorités opératoires',
  source: 'preset',
  operations: ['orderOfOperations'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 20 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 3, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const powerAndSquareRoot: SessionConfig = {
  id: 'themed-power-sqrt',
  name: 'Puissances & racines',
  source: 'preset',
  operations: ['power', 'squareRoot'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 20 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true, maxPowerExponent: 3 },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const rounding: SessionConfig = {
  id: 'themed-rounding',
  name: 'Arrondis',
  source: 'preset',
  operations: ['rounding'],
  numberTypes: {
    integer: { enabled: false, min: 1, max: 100 },
    decimal: { enabled: true, decimals: 1, min: 0, max: 200 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const negativeNumbers: SessionConfig = {
  id: 'themed-negative-numbers',
  name: 'Nombres relatifs',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: -100, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: true,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 20 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const trueFalse: SessionConfig = {
  id: 'themed-true-false',
  name: 'Vrai ou faux',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: { inputMode: 'trueFalse' },
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const bigNumbers: SessionConfig = {
  id: 'themed-big-numbers',
  name: 'Grands nombres',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 100, max: 9999 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'fixedCount', questionCount: 15 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

const chronoTwoMinutes: SessionConfig = {
  id: 'themed-chrono-2min',
  name: 'Chrono 2 minutes',
  source: 'preset',
  operations: ['addition', 'subtraction', 'multiplication', 'division'],
  numberTypes: {
    integer: { enabled: true, min: 1, max: 100 },
    decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
    fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
    allowNegative: false,
  },
  difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  session: { mode: 'totalTime', totalTimeSeconds: 120 },
  answer: DEFAULT_ANSWER,
  correction: { mode: 'immediate' },
  timing: DEFAULT_TIMING,
}

// Ordered from simplest to most advanced, so /modes reads as a difficulty ramp.
export const themedPresets: SessionConfig[] = [
  firstSteps,
  additionSubtraction,
  multiplicationTables,
  multiplicationDivision,
  trueFalse,
  mcqFlash,
  quickChrono,
  chronoTwoMinutes,
  survival,
  percentages,
  rounding,
  orderOfOperations,
  bigNumbers,
  fractionsAndDecimals,
  negativeNumbers,
  powerAndSquareRoot,
  middleSchoolMix,
]
