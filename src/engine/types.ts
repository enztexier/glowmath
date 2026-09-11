export type Operation =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'power'
  | 'squareRoot'
  | 'percentage'
  | 'orderOfOperations'
  | 'rounding'

export interface Fraction {
  numerator: number
  denominator: number
}

export type NumberTypeKind = 'integer' | 'decimal' | 'fraction'

export interface SessionConfig {
  id: string
  name: string
  source: 'preset' | 'custom'

  operations: Operation[]

  numberTypes: {
    integer: { enabled: boolean; min: number; max: number }
    decimal: { enabled: boolean; decimals: number; min: number; max: number }
    fraction: {
      enabled: boolean
      numeratorMax: number
      denominators: number[]
      simplifyResult: boolean
      allowImproper: boolean
    }
    allowNegative: boolean
  }

  difficulty: {
    operandsCount: 2 | 3 | 4
    forceCarry: boolean | null
    tablesOnly: number[] | null
    divisionExactOnly: boolean
    maxPowerExponent?: number
  }

  session: {
    mode: 'fixedCount' | 'totalTime' | 'survival' | 'training'
    questionCount?: number
    totalTimeSeconds?: number
  }

  answer: {
    inputMode: 'keyboard' | 'mcq' | 'trueFalse' | 'knewOrNot'
    mcqChoicesCount?: number
  }

  correction: {
    mode: 'immediate' | 'delayed' | 'onDemand' | 'endOfSeries' | 'none'
    delaySeconds?: number
  }

  timing: {
    responseTimeSeconds: number | null
    correctionDisplaySeconds: number
  }
}

export interface GeneratedQuestion {
  id: string
  displayText: string
  operands: (number | Fraction)[]
  operation: Operation
  correctAnswer: number | Fraction
  correctAnswerDisplay: string
  choices?: string[]
}

export function isFraction(value: number | Fraction): value is Fraction {
  return typeof value === 'object' && value !== null && 'numerator' in value
}
