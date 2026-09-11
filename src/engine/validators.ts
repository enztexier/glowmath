import type { GeneratedQuestion, SessionConfig } from './types'
import { isFraction } from './types'
import { fractionsEqual, simplifyFraction } from './fractionUtils'

const FRACTION_PATTERN = /^\s*(-?\d+)\s*\/\s*(-?\d+)\s*$/

/** Accepts both "," and "." as decimal separators. Returns null if unparsable. */
export function parseUserNumber(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (normalized === '' || Number.isNaN(Number(normalized))) {
    return null
  }
  return Number(normalized)
}

export function parseUserFraction(input: string): { numerator: number; denominator: number } | null {
  const match = FRACTION_PATTERN.exec(input.trim())
  if (!match) {
    return null
  }
  const denominator = Number(match[2])
  if (denominator === 0) {
    return null
  }
  return { numerator: Number(match[1]), denominator }
}

/**
 * Strict numeric comparison. Values are rounded to `decimals` places before
 * comparing to absorb floating point representation error (e.g. 0.1 + 0.2),
 * not to introduce answer tolerance — the spec calls for zero tolerance.
 */
export function validateNumericAnswer(userInput: string, correctAnswer: number, decimals = 6): boolean {
  const parsed = parseUserNumber(userInput)
  if (parsed === null) {
    return false
  }
  return roundTo(parsed, decimals) === roundTo(correctAnswer, decimals)
}

export function validateFractionAnswer(
  userInput: string,
  correctAnswer: { numerator: number; denominator: number },
  requireSimplified: boolean,
): boolean {
  const parsed = parseUserFraction(userInput)
  if (parsed === null) {
    return false
  }
  if (!fractionsEqual(parsed, correctAnswer)) {
    return false
  }
  if (requireSimplified) {
    const simplified = simplifyFraction(parsed)
    return simplified.numerator === parsed.numerator && simplified.denominator === parsed.denominator
  }
  return true
}

/** Top-level dispatcher used by the session runtime to grade a raw user input. */
export function validateAnswer(
  question: GeneratedQuestion,
  userInput: string,
  config: SessionConfig,
): boolean {
  if (isFraction(question.correctAnswer)) {
    const requireSimplified = config.numberTypes.fraction.simplifyResult
    return validateFractionAnswer(userInput, question.correctAnswer, requireSimplified)
  }
  return validateNumericAnswer(userInput, question.correctAnswer)
}

export function validateTrueFalseAnswer(userAnswer: boolean, statementIsTrue: boolean): boolean {
  return userAnswer === statementIsTrue
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}
