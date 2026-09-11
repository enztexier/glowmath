import type { Operation, SessionConfig } from '../types'

type IntegerType = SessionConfig['numberTypes']['integer']
type DecimalType = SessionConfig['numberTypes']['decimal']
type FractionType = SessionConfig['numberTypes']['fraction']

function integerType(min: number, max: number): IntegerType {
  return { enabled: true, min, max }
}

function noDecimal(): DecimalType {
  return { enabled: false, decimals: 1, min: 0, max: 100 }
}

function decimalType(decimals: number, min: number, max: number): DecimalType {
  return { enabled: true, decimals, min, max }
}

function noFraction(): FractionType {
  return { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false }
}

function fractionType(
  numeratorMax: number,
  denominators: number[],
  options: { simplifyResult?: boolean; allowImproper?: boolean } = {},
): FractionType {
  return {
    enabled: true,
    numeratorMax,
    denominators,
    simplifyResult: options.simplifyResult ?? true,
    allowImproper: options.allowImproper ?? false,
  }
}

const DEFAULT_SESSION: SessionConfig['session'] = { mode: 'fixedCount', questionCount: 20 }
const DEFAULT_ANSWER: SessionConfig['answer'] = { inputMode: 'keyboard' }
const DEFAULT_CORRECTION: SessionConfig['correction'] = { mode: 'immediate' }
const DEFAULT_TIMING: SessionConfig['timing'] = { responseTimeSeconds: null, correctionDisplaySeconds: 2 }

interface SchoolPresetSpec {
  id: string
  name: string
  operations: Operation[]
  numberTypes: SessionConfig['numberTypes']
  operandsCount: 2 | 3 | 4
  divisionExactOnly: boolean
  maxPowerExponent?: number
}

function buildSchoolPreset(spec: SchoolPresetSpec): SessionConfig {
  return {
    id: spec.id,
    name: spec.name,
    source: 'preset',
    operations: spec.operations,
    numberTypes: spec.numberTypes,
    difficulty: {
      operandsCount: spec.operandsCount,
      forceCarry: null,
      tablesOnly: null,
      divisionExactOnly: spec.divisionExactOnly,
      maxPowerExponent: spec.maxPowerExponent,
    },
    session: DEFAULT_SESSION,
    answer: DEFAULT_ANSWER,
    correction: DEFAULT_CORRECTION,
    timing: DEFAULT_TIMING,
  }
}

export const schoolPresets: SessionConfig[] = [
  buildSchoolPreset({
    id: 'school-cp',
    name: 'CP',
    operations: ['addition', 'subtraction'],
    numberTypes: {
      integer: integerType(1, 20),
      decimal: noDecimal(),
      fraction: noFraction(),
      allowNegative: false,
    },
    operandsCount: 2,
    divisionExactOnly: false,
  }),
  buildSchoolPreset({
    id: 'school-ce1',
    name: 'CE1',
    operations: ['addition', 'subtraction', 'multiplication'],
    numberTypes: {
      integer: integerType(1, 100),
      decimal: noDecimal(),
      fraction: noFraction(),
      allowNegative: false,
    },
    operandsCount: 2,
    divisionExactOnly: false,
  }),
  buildSchoolPreset({
    id: 'school-ce2',
    name: 'CE2',
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    numberTypes: {
      integer: integerType(1, 100),
      decimal: noDecimal(),
      fraction: noFraction(),
      allowNegative: false,
    },
    operandsCount: 2,
    divisionExactOnly: true,
  }),
  buildSchoolPreset({
    id: 'school-cm1',
    name: 'CM1',
    operations: ['addition', 'subtraction', 'multiplication', 'division'],
    numberTypes: {
      integer: integerType(1, 1000),
      decimal: decimalType(1, 0, 1000),
      fraction: fractionType(3, [2, 3, 4]),
      allowNegative: false,
    },
    operandsCount: 3,
    divisionExactOnly: false,
  }),
  buildSchoolPreset({
    id: 'school-cm2',
    name: 'CM2',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'orderOfOperations'],
    numberTypes: {
      integer: integerType(1, 1000),
      decimal: decimalType(2, 0, 1000),
      fraction: fractionType(4, [2, 3, 4, 5, 10]),
      allowNegative: false,
    },
    operandsCount: 3,
    divisionExactOnly: false,
  }),
  buildSchoolPreset({
    id: 'school-6e-5e',
    name: '6e–5e',
    operations: ['addition', 'subtraction', 'multiplication', 'division', 'orderOfOperations'],
    numberTypes: {
      integer: integerType(-1000, 1000),
      decimal: decimalType(2, -1000, 1000),
      fraction: fractionType(9, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], { allowImproper: true }),
      allowNegative: true,
    },
    operandsCount: 3,
    divisionExactOnly: false,
  }),
  buildSchoolPreset({
    id: 'school-4e-3e',
    name: '4e–3e',
    operations: [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'power',
      'squareRoot',
      'percentage',
      'orderOfOperations',
    ],
    numberTypes: {
      integer: integerType(-10000, 10000),
      decimal: decimalType(3, -10000, 10000),
      fraction: fractionType(12, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12], { allowImproper: true }),
      allowNegative: true,
    },
    operandsCount: 4,
    divisionExactOnly: false,
    maxPowerExponent: 3,
  }),
  buildSchoolPreset({
    id: 'school-lycee',
    name: 'Lycée',
    operations: [
      'addition',
      'subtraction',
      'multiplication',
      'division',
      'power',
      'squareRoot',
      'percentage',
      'orderOfOperations',
      'rounding',
    ],
    numberTypes: {
      integer: integerType(-100000, 100000),
      decimal: decimalType(3, -10000, 10000),
      fraction: fractionType(20, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 16], { allowImproper: true }),
      allowNegative: true,
    },
    operandsCount: 4,
    divisionExactOnly: false,
    maxPowerExponent: 4,
  }),
]
