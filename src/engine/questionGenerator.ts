import type { Fraction, GeneratedQuestion, NumberTypeKind, Operation, SessionConfig } from './types'
import { isFraction } from './types'
import {
  addFractions,
  divFractions,
  formatFraction,
  makeFraction,
  mulFractions,
  simplifyFraction,
  subFractions,
} from './fractionUtils'

interface RawQuestion {
  operands: (number | Fraction)[]
  correctAnswer: number | Fraction
  displayText: string
  correctAnswerDisplay: string
}

const OPERATION_SUPPORTED_KINDS: Record<Operation, NumberTypeKind[]> = {
  addition: ['integer', 'decimal', 'fraction'],
  subtraction: ['integer', 'decimal', 'fraction'],
  multiplication: ['integer', 'decimal', 'fraction'],
  division: ['integer', 'decimal', 'fraction'],
  power: ['integer'],
  squareRoot: ['integer'],
  percentage: ['integer', 'decimal'],
  orderOfOperations: ['integer'],
  rounding: ['decimal'],
}

// ---------------------------------------------------------------------------
// Generic random helpers
// ---------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  const lo = Math.ceil(Math.min(min, max))
  const hi = Math.floor(Math.max(min, max))
  return lo + Math.floor(Math.random() * (hi - lo + 1))
}

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function generateNumberInRange(min: number, max: number, decimals: number, allowNegative: boolean): number {
  const effectiveMin = allowNegative ? min : Math.max(min, 0)
  const effectiveMax = Math.max(max, effectiveMin)
  if (decimals === 0) {
    return randomInt(effectiveMin, effectiveMax)
  }
  const factor = 10 ** decimals
  return randomInt(Math.round(effectiveMin * factor), Math.round(effectiveMax * factor)) / factor
}

function formatNumber(value: number, kind: 'integer' | 'decimal', decimals: number): string {
  if (kind === 'decimal') {
    return value.toFixed(decimals).replace('.', ',')
  }
  return String(Math.round(value))
}

function pickNumberType(config: SessionConfig, operation: Operation): NumberTypeKind {
  const supported = OPERATION_SUPPORTED_KINDS[operation]
  const enabled = supported.filter((kind) => config.numberTypes[kind].enabled)
  if (enabled.length === 0) {
    return supported[0]
  }
  return pickRandom(enabled)
}

// ---------------------------------------------------------------------------
// Carry / borrow constraint helpers (addition & subtraction)
// ---------------------------------------------------------------------------

function additionHasCarry(a: number, b: number): boolean {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (x > 0 || y > 0) {
    if ((x % 10) + (y % 10) >= 10) {
      return true
    }
    x = Math.floor(x / 10)
    y = Math.floor(y / 10)
  }
  return false
}

function subtractionHasBorrow(a: number, b: number): boolean {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (x > 0 || y > 0) {
    if (x % 10 < y % 10) {
      return true
    }
    x = Math.floor(x / 10)
    y = Math.floor(y / 10)
  }
  return false
}

function satisfiesCarryConstraint(
  operands: number[],
  operation: 'addition' | 'subtraction',
  forceCarry: boolean | null,
  decimals: number,
): boolean {
  if (forceCarry === null) {
    return true
  }
  const factor = 10 ** decimals
  const scaled = operands.map((value) => Math.round(value * factor))
  let hasEvent = false
  let acc = scaled[0]
  for (let i = 1; i < scaled.length; i++) {
    const event = operation === 'addition' ? additionHasCarry(acc, scaled[i]) : subtractionHasBorrow(acc, scaled[i])
    hasEvent = hasEvent || event
    acc = operation === 'addition' ? acc + scaled[i] : acc - scaled[i]
  }
  return forceCarry ? hasEvent : !hasEvent
}

// ---------------------------------------------------------------------------
// Fraction helpers
// ---------------------------------------------------------------------------

function generateRandomFraction(config: SessionConfig): Fraction {
  const pool = config.numberTypes.fraction.denominators.length > 0 ? config.numberTypes.fraction.denominators : [2, 3, 4, 5, 10]
  const denominator = pickRandom(pool)
  const maxNumerator = config.numberTypes.fraction.allowImproper
    ? Math.max(1, config.numberTypes.fraction.numeratorMax)
    : Math.max(1, denominator - 1)
  let numerator = randomInt(1, maxNumerator)
  if (config.numberTypes.allowNegative && Math.random() < 0.5) {
    numerator = -numerator
  }
  return makeFraction(numerator, denominator)
}

// ---------------------------------------------------------------------------
// Addition / subtraction
// ---------------------------------------------------------------------------

function generateAdditionSubtractionFraction(config: SessionConfig, operation: 'addition' | 'subtraction'): RawQuestion {
  const allowNegative = config.numberTypes.allowNegative
  const operandsCount = config.difficulty.operandsCount
  let fractions: Fraction[] = []
  let result: Fraction = makeFraction(0, 1)
  let attempts = 0

  do {
    fractions = Array.from({ length: operandsCount }, () => generateRandomFraction(config))
    result = fractions.reduce((acc, current, index) =>
      index === 0 ? current : operation === 'addition' ? addFractions(acc, current) : subFractions(acc, current),
    )
    attempts++
  } while (attempts < 200 && !allowNegative && result.numerator < 0)

  if (!allowNegative && result.numerator < 0) {
    result = makeFraction(Math.abs(result.numerator), result.denominator)
  }

  const finalFraction = config.numberTypes.fraction.simplifyResult ? simplifyFraction(result) : result
  const operator = operation === 'addition' ? '+' : '-'
  const displayText = `${fractions.map(formatFraction).join(` ${operator} `)} = ?`

  return {
    operands: fractions,
    correctAnswer: finalFraction,
    displayText,
    correctAnswerDisplay: formatFraction(finalFraction),
  }
}

function generateAdditionSubtractionNumeric(
  config: SessionConfig,
  operation: 'addition' | 'subtraction',
  kind: 'integer' | 'decimal',
): RawQuestion {
  const allowNegative = config.numberTypes.allowNegative
  const decimals = kind === 'decimal' ? config.numberTypes.decimal.decimals : 0
  const range = kind === 'decimal' ? config.numberTypes.decimal : config.numberTypes.integer
  const operandsCount = config.difficulty.operandsCount

  let operands: number[] = []
  let result = 0
  let attempts = 0

  do {
    operands = Array.from({ length: operandsCount }, () => generateNumberInRange(range.min, range.max, decimals, allowNegative))
    result = operands.reduce(
      (acc, value, index) => (index === 0 ? value : roundTo(operation === 'addition' ? acc + value : acc - value, decimals)),
      0,
    )
    attempts++
  } while (
    attempts < 200 &&
    ((!allowNegative && result < 0) || !satisfiesCarryConstraint(operands, operation, config.difficulty.forceCarry, decimals))
  )

  if (!allowNegative && result < 0 && operation === 'subtraction') {
    operands.sort((a, b) => b - a)
    result = operands.reduce((acc, value, index) => (index === 0 ? value : roundTo(acc - value, decimals)), 0)
  }

  const operator = operation === 'addition' ? '+' : '-'
  const displayText = `${operands.map((value) => formatNumber(value, kind, decimals)).join(` ${operator} `)} = ?`

  return {
    operands,
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: formatNumber(result, kind, decimals),
  }
}

function generateAdditionOrSubtraction(config: SessionConfig, operation: 'addition' | 'subtraction'): RawQuestion {
  const kind = pickNumberType(config, operation)
  if (kind === 'fraction') {
    return generateAdditionSubtractionFraction(config, operation)
  }
  return generateAdditionSubtractionNumeric(config, operation, kind)
}

// ---------------------------------------------------------------------------
// Multiplication / division
// ---------------------------------------------------------------------------

function generateMultiplicationDivisionFraction(config: SessionConfig, operation: 'multiplication' | 'division'): RawQuestion {
  const a = generateRandomFraction(config)
  let b = generateRandomFraction(config)
  if (operation === 'division') {
    let guard = 0
    while (b.numerator === 0 && guard < 20) {
      b = generateRandomFraction(config)
      guard++
    }
  }

  let result = operation === 'multiplication' ? mulFractions(a, b) : divFractions(a, b)
  if (!config.numberTypes.allowNegative && result.numerator < 0) {
    result = makeFraction(Math.abs(result.numerator), result.denominator)
  }
  const finalFraction = config.numberTypes.fraction.simplifyResult ? simplifyFraction(result) : result
  const operator = operation === 'multiplication' ? '×' : '÷'
  const displayText = `${formatFraction(a)} ${operator} ${formatFraction(b)} = ?`

  return {
    operands: [a, b],
    correctAnswer: finalFraction,
    displayText,
    correctAnswerDisplay: formatFraction(finalFraction),
  }
}

function generateMultiplicationNumeric(config: SessionConfig, kind: 'integer' | 'decimal'): RawQuestion {
  const decimals = kind === 'decimal' ? config.numberTypes.decimal.decimals : 0
  const range = kind === 'decimal' ? config.numberTypes.decimal : config.numberTypes.integer
  const allowNegative = config.numberTypes.allowNegative
  const tablesOnly = config.difficulty.tablesOnly

  let a: number
  let b: number
  if (kind === 'integer' && tablesOnly && tablesOnly.length > 0) {
    a = pickRandom(tablesOnly)
    b = generateNumberInRange(0, Math.max(range.max, 10), 0, false)
    if (Math.random() < 0.5) {
      ;[a, b] = [b, a]
    }
  } else {
    a = generateNumberInRange(range.min, range.max, decimals, allowNegative)
    b = generateNumberInRange(range.min, range.max, decimals, allowNegative)
  }

  const result = roundTo(a * b, decimals)
  const displayText = `${formatNumber(a, kind, decimals)} × ${formatNumber(b, kind, decimals)} = ?`

  return {
    operands: [a, b],
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: formatNumber(result, kind, decimals),
  }
}

function generateDivisionNumeric(config: SessionConfig, kind: 'integer' | 'decimal'): RawQuestion {
  const range = kind === 'decimal' ? config.numberTypes.decimal : config.numberTypes.integer
  const decimals = kind === 'decimal' ? config.numberTypes.decimal.decimals : 0
  const allowNegative = config.numberTypes.allowNegative
  const tablesOnly = config.difficulty.tablesOnly

  const wantsExactOrTable = kind === 'integer' && (config.difficulty.divisionExactOnly || (tablesOnly && tablesOnly.length > 0))

  if (wantsExactOrTable) {
    const divisor = tablesOnly && tablesOnly.length > 0 ? pickRandom(tablesOnly) || 1 : generateNumberInRange(1, Math.max(range.max, 2), 0, false) || 1
    const quotient = generateNumberInRange(1, Math.max(range.max, 2), 0, false)
    const dividend = divisor * quotient
    const displayText = `${dividend} ÷ ${divisor} = ?`
    return {
      operands: [dividend, divisor],
      correctAnswer: quotient,
      displayText,
      correctAnswerDisplay: String(quotient),
    }
  }

  const dividend = generateNumberInRange(range.min, range.max, decimals, allowNegative)
  let divisor = generateNumberInRange(1, Math.max(range.max, 10), 0, false)
  if (allowNegative && Math.random() < 0.5) {
    divisor = -divisor
  }
  if (divisor === 0) {
    divisor = 1
  }
  const outputDecimals = kind === 'decimal' ? decimals : 2
  const result = roundTo(dividend / divisor, outputDecimals)
  const displayText = `${formatNumber(dividend, kind, decimals)} ÷ ${formatNumber(divisor, kind, decimals)} = ?`

  return {
    operands: [dividend, divisor],
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: formatNumber(result, 'decimal', outputDecimals),
  }
}

function generateMultiplicationOrDivision(config: SessionConfig, operation: 'multiplication' | 'division'): RawQuestion {
  const kind = pickNumberType(config, operation)
  if (kind === 'fraction') {
    return generateMultiplicationDivisionFraction(config, operation)
  }
  return operation === 'multiplication' ? generateMultiplicationNumeric(config, kind) : generateDivisionNumeric(config, kind)
}

// ---------------------------------------------------------------------------
// Power / square root / percentage
// ---------------------------------------------------------------------------

function generatePower(config: SessionConfig): RawQuestion {
  const maxExponent = Math.max(2, config.difficulty.maxPowerExponent ?? 3)
  const exponent = randomInt(2, maxExponent)
  const baseCeiling = exponent >= 4 ? 6 : exponent === 3 ? 12 : Math.min(Math.max(config.numberTypes.integer.max, 2), 20)
  const allowNegative = config.numberTypes.allowNegative

  let base = generateNumberInRange(2, Math.max(baseCeiling, 2), 0, false)
  if (allowNegative && Math.random() < 0.5) {
    base = -base
  }

  const result = base ** exponent
  const exponentGlyph = exponent === 2 ? '²' : exponent === 3 ? '³' : `^${exponent}`
  const displayBase = base < 0 ? `(${base})` : `${base}`
  const displayText = `${displayBase}${exponentGlyph} = ?`

  return {
    operands: [base, exponent],
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: String(result),
  }
}

function generateSquareRoot(config: SessionConfig): RawQuestion {
  const ceiling = Math.min(Math.max(config.numberTypes.integer.max, 2), 30)
  const root = generateNumberInRange(1, ceiling, 0, false)
  const value = root * root
  return {
    operands: [value],
    correctAnswer: root,
    displayText: `√${value} = ?`,
    correctAnswerDisplay: String(root),
  }
}

const COMMON_PERCENTAGES = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90]

function generatePercentage(config: SessionConfig): RawQuestion {
  const percent = pickRandom(COMMON_PERCENTAGES)
  const kind = pickNumberType(config, 'percentage') as 'integer' | 'decimal'
  const decimals = kind === 'decimal' ? config.numberTypes.decimal.decimals : 0
  const range = kind === 'decimal' ? config.numberTypes.decimal : config.numberTypes.integer
  const base = generateNumberInRange(Math.max(range.min, 1), Math.max(range.max, 10), decimals, false)
  const result = roundTo((base * percent) / 100, 2)
  const displayText = `${percent}% de ${formatNumber(base, kind, decimals)} = ?`

  return {
    operands: [base, percent],
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: formatNumber(result, 'decimal', 2),
  }
}

// ---------------------------------------------------------------------------
// Order of operations
// ---------------------------------------------------------------------------

interface OrderTemplate {
  operands: number[]
  displayText: string
  result: number
}

function buildOrderTemplate(maxOperand: number, allowNegative: boolean): OrderTemplate {
  const rnd = (min: number, max: number) => generateNumberInRange(min, max, 0, allowNegative)
  const rndPos = (min: number, max: number) => generateNumberInRange(min, max, 0, false)
  const kind = pickRandom([
    'addMul',
    'subMul',
    'mulAdd',
    'mulSub',
    'addDiv',
    'subDiv',
    'divAdd',
    'divSub',
    'parenAddMul',
    'parenSubMul',
    'mulParenAdd',
    'mulParenSub',
    'parenAddDiv',
  ] as const)

  switch (kind) {
    case 'addMul': {
      const b = rndPos(2, 12)
      const c = rndPos(2, 12)
      const a = rnd(1, maxOperand)
      return { operands: [a, b, c], displayText: `${a} + ${b} × ${c}`, result: a + b * c }
    }
    case 'subMul': {
      const b = rndPos(2, 12)
      const c = rndPos(2, 12)
      const a = rnd(Math.max(1, b * c), maxOperand + b * c)
      return { operands: [a, b, c], displayText: `${a} - ${b} × ${c}`, result: a - b * c }
    }
    case 'mulAdd': {
      const a = rndPos(2, 12)
      const b = rndPos(2, 12)
      const c = rnd(1, maxOperand)
      return { operands: [a, b, c], displayText: `${a} × ${b} + ${c}`, result: a * b + c }
    }
    case 'mulSub': {
      const a = rndPos(2, 12)
      const b = rndPos(2, 12)
      const c = rnd(1, Math.max(1, a * b))
      return { operands: [a, b, c], displayText: `${a} × ${b} - ${c}`, result: a * b - c }
    }
    case 'addDiv': {
      const c = rndPos(2, 10)
      const q = rndPos(1, maxOperand)
      const b = c * q
      const a = rnd(1, maxOperand)
      return { operands: [a, b, c], displayText: `${a} + ${b} ÷ ${c}`, result: a + q }
    }
    case 'subDiv': {
      const c = rndPos(2, 10)
      const q = rndPos(1, maxOperand)
      const b = c * q
      const a = rnd(q, maxOperand + q)
      return { operands: [a, b, c], displayText: `${a} - ${b} ÷ ${c}`, result: a - q }
    }
    case 'divAdd': {
      const b = rndPos(2, 10)
      const q = rndPos(1, maxOperand)
      const a = b * q
      const c = rnd(1, maxOperand)
      return { operands: [a, b, c], displayText: `${a} ÷ ${b} + ${c}`, result: q + c }
    }
    case 'divSub': {
      const b = rndPos(2, 10)
      const q = rndPos(1, maxOperand)
      const a = b * q
      const c = rnd(0, q)
      return { operands: [a, b, c], displayText: `${a} ÷ ${b} - ${c}`, result: q - c }
    }
    case 'parenAddMul': {
      const a = rnd(1, maxOperand)
      const b = rnd(1, maxOperand)
      const c = rndPos(2, 12)
      return { operands: [a, b, c], displayText: `(${a} + ${b}) × ${c}`, result: (a + b) * c }
    }
    case 'parenSubMul': {
      const b = rnd(1, maxOperand)
      const a = rnd(b, maxOperand + b)
      const c = rndPos(2, 12)
      return { operands: [a, b, c], displayText: `(${a} - ${b}) × ${c}`, result: (a - b) * c }
    }
    case 'mulParenAdd': {
      const a = rndPos(2, 12)
      const b = rnd(1, maxOperand)
      const c = rnd(1, maxOperand)
      return { operands: [a, b, c], displayText: `${a} × (${b} + ${c})`, result: a * (b + c) }
    }
    case 'mulParenSub': {
      const a = rndPos(2, 12)
      const c = rnd(1, maxOperand)
      const b = rnd(c, maxOperand + c)
      return { operands: [a, b, c], displayText: `${a} × (${b} - ${c})`, result: a * (b - c) }
    }
    case 'parenAddDiv': {
      const c = rndPos(2, 10)
      const q = rndPos(1, maxOperand)
      const sum = c * q
      const a = rndPos(0, sum)
      const b = sum - a
      return { operands: [a, b, c], displayText: `(${a} + ${b}) ÷ ${c}`, result: q }
    }
  }
}

function generateOrderOfOperations(config: SessionConfig): RawQuestion {
  const range = config.numberTypes.integer
  const maxOperand = Math.max(range.max, 10)
  const allowNegative = config.numberTypes.allowNegative
  const base = buildOrderTemplate(maxOperand, allowNegative)

  let operands = base.operands
  let displayText = base.displayText
  let result = base.result

  if (config.difficulty.operandsCount >= 4) {
    const d = generateNumberInRange(1, maxOperand, 0, false)
    const wantsSubtraction = Math.random() < 0.5
    if (wantsSubtraction && (allowNegative || d <= result)) {
      displayText += ` - ${d}`
      result -= d
    } else {
      displayText += ` + ${d}`
      result += d
    }
    operands = [...operands, d]
  }

  if (!allowNegative && result < 0) {
    result = Math.abs(result)
  }

  return {
    operands,
    correctAnswer: result,
    displayText: `${displayText} = ?`,
    correctAnswerDisplay: String(result),
  }
}

// ---------------------------------------------------------------------------
// Rounding
// ---------------------------------------------------------------------------

function generateRounding(config: SessionConfig): RawQuestion {
  const decimalCfg = config.numberTypes.decimal
  const targetDecimals = decimalCfg.enabled ? decimalCfg.decimals : 0
  const sourceDecimals = targetDecimals + 2
  const min = decimalCfg.enabled ? decimalCfg.min : 0
  const max = decimalCfg.enabled ? decimalCfg.max : 100
  const value = generateNumberInRange(min, max, sourceDecimals, config.numberTypes.allowNegative)
  const result = roundTo(value, targetDecimals)
  const placeLabel = targetDecimals === 0 ? "l'unité" : `${targetDecimals} décimale${targetDecimals > 1 ? 's' : ''}`
  const displayText = `Arrondis ${formatNumber(value, 'decimal', sourceDecimals)} à ${placeLabel} : ?`

  return {
    operands: [value],
    correctAnswer: result,
    displayText,
    correctAnswerDisplay: targetDecimals === 0 ? formatNumber(result, 'integer', 0) : formatNumber(result, 'decimal', targetDecimals),
  }
}

// ---------------------------------------------------------------------------
// MCQ distractors
// ---------------------------------------------------------------------------

function generateNumericDistractors(correct: number, correctDisplay: string, count: number): string[] {
  const decimals = correctDisplay.includes(',') ? correctDisplay.split(',')[1].length : 0
  const unit = decimals > 0 ? 1 / 10 ** decimals : 1
  const offsets = [1, -1, 2, -2, 5, -5, 10, -10, 11, -11, 20, -20]
  const seen = new Set<number>([roundTo(correct, decimals)])
  const results: string[] = []

  for (const offsetUnits of offsets) {
    if (results.length >= count) break
    const candidate = roundTo(correct + offsetUnits * unit, decimals)
    if (seen.has(candidate)) continue
    seen.add(candidate)
    results.push(formatNumber(candidate, decimals > 0 ? 'decimal' : 'integer', decimals))
  }

  let fallback = 30
  while (results.length < count) {
    const candidate = roundTo(correct + fallback * unit, decimals)
    if (!seen.has(candidate)) {
      seen.add(candidate)
      results.push(formatNumber(candidate, decimals > 0 ? 'decimal' : 'integer', decimals))
    }
    fallback++
  }

  return results
}

function generateFractionDistractors(correct: Fraction, count: number, denominatorPool: number[]): string[] {
  const seen = new Set<string>([formatFraction(simplifyFraction(correct))])
  const results: string[] = []

  const candidates: Fraction[] = [
    makeFraction(correct.numerator + 1, correct.denominator),
    makeFraction(correct.numerator - 1, correct.denominator),
    makeFraction(correct.numerator, correct.denominator + 1),
    makeFraction(correct.numerator + 1, pickRandom(denominatorPool)),
    makeFraction(correct.numerator - 1, pickRandom(denominatorPool)),
    correct.numerator !== 0 ? makeFraction(correct.denominator, correct.numerator) : makeFraction(1, correct.denominator + 1),
  ]

  for (const candidate of candidates) {
    if (results.length >= count) break
    if (candidate.denominator === 0) continue
    const key = formatFraction(simplifyFraction(candidate))
    if (seen.has(key)) continue
    seen.add(key)
    results.push(formatFraction(candidate))
  }

  let extra = 2
  while (results.length < count) {
    const candidate = makeFraction(correct.numerator + extra, correct.denominator)
    const key = formatFraction(simplifyFraction(candidate))
    if (!seen.has(key)) {
      seen.add(key)
      results.push(formatFraction(candidate))
    }
    extra++
  }

  return results
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const OPERATION_GENERATORS: Record<Operation, (config: SessionConfig) => RawQuestion> = {
  addition: (config) => generateAdditionOrSubtraction(config, 'addition'),
  subtraction: (config) => generateAdditionOrSubtraction(config, 'subtraction'),
  multiplication: (config) => generateMultiplicationOrDivision(config, 'multiplication'),
  division: (config) => generateMultiplicationOrDivision(config, 'division'),
  power: generatePower,
  squareRoot: generateSquareRoot,
  percentage: generatePercentage,
  orderOfOperations: generateOrderOfOperations,
  rounding: generateRounding,
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `q-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const MAX_DEDUPE_ATTEMPTS = 30

export function generateQuestion(config: SessionConfig, avoidDisplayTexts?: ReadonlySet<string>): GeneratedQuestion {
  if (config.operations.length === 0) {
    throw new Error('SessionConfig must include at least one operation')
  }

  let operation: Operation
  let raw: RawQuestion
  let attempts = 0
  do {
    operation = pickRandom(config.operations)
    raw = OPERATION_GENERATORS[operation](config)
    attempts++
  } while (avoidDisplayTexts?.has(raw.displayText) && attempts < MAX_DEDUPE_ATTEMPTS)

  const question: GeneratedQuestion = {
    id: generateId(),
    displayText: raw.displayText,
    operands: raw.operands,
    operation,
    correctAnswer: raw.correctAnswer,
    correctAnswerDisplay: raw.correctAnswerDisplay,
  }

  if (config.answer.inputMode === 'mcq') {
    const count = config.answer.mcqChoicesCount ?? 4
    const distractors = isFraction(raw.correctAnswer)
      ? generateFractionDistractors(raw.correctAnswer, count - 1, fractionDenominatorPool(raw.correctAnswer, config))
      : generateNumericDistractors(raw.correctAnswer, raw.correctAnswerDisplay, count - 1)
    question.choices = shuffle([raw.correctAnswerDisplay, ...distractors])
  }

  return question
}

export function generateQuestions(config: SessionConfig, count: number): GeneratedQuestion[] {
  const seen = new Set<string>()
  const questions: GeneratedQuestion[] = []
  for (let i = 0; i < count; i++) {
    const question = generateQuestion(config, seen)
    seen.add(question.displayText)
    questions.push(question)
  }
  return questions
}

function fractionDenominatorPool(correct: Fraction, config: SessionConfig): number[] {
  return config.numberTypes.fraction.denominators.length > 0 ? config.numberTypes.fraction.denominators : [correct.denominator]
}

/**
 * Turns a generated question into a (possibly false) equality statement for the
 * `trueFalse` answer mode, e.g. "12 + 7 = 18" instead of "12 + 7 = ?".
 */
export function toTrueFalseStatement(question: GeneratedQuestion): { displayText: string; isTrue: boolean } {
  const isTrue = Math.random() < 0.5
  if (isTrue) {
    return { displayText: question.displayText.replace('?', question.correctAnswerDisplay), isTrue: true }
  }
  const wrongDisplay = isFraction(question.correctAnswer)
    ? generateFractionDistractors(question.correctAnswer, 1, [question.correctAnswer.denominator])[0]
    : generateNumericDistractors(question.correctAnswer, question.correctAnswerDisplay, 1)[0]
  return { displayText: question.displayText.replace('?', wrongDisplay), isTrue: false }
}
