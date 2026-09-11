import type { GeneratedQuestion } from './types'
import { isFraction } from './types'

function distanceToNextTen(n: number): number {
  return (10 - (n % 10)) % 10
}

function additionHint(a: number, b: number): string {
  const da = distanceToNextTen(a)
  const db = distanceToNextTen(b)

  if (da === 0 || db === 0) {
    const round = da === 0 ? a : b
    const other = da === 0 ? b : a
    return `${round} est déjà un nombre rond : ajoute directement ${other}.`
  }

  const bridgeOnA = da <= db
  const bridge = bridgeOnA ? a : b
  const other = bridgeOnA ? b : a
  const dist = Math.min(da, db)
  const target = bridge + dist

  if (dist <= other) {
    const rest = other - dist
    return `${bridge} est à ${dist} de ${target}. Emprunte ${dist} à ${other} (il en reste ${rest}), puis fais ${target} + ${rest}.`
  }

  return `Sépare les dizaines et les unités de chaque nombre, additionne-les, puis regroupe le tout.`
}

function subtractionHint(a: number, b: number): string {
  const nextTenAboveB = b + distanceToNextTen(b)

  if (b % 10 !== 0 && nextTenAboveB <= a) {
    const step1 = nextTenAboveB - b
    const step2 = a - nextTenAboveB
    if (step2 === 0) {
      return `Avance de ${b} à ${nextTenAboveB} : ça fait +${step1}. Voilà la réponse.`
    }
    return `Avance de ${b} à ${nextTenAboveB} (+${step1}), puis de ${nextTenAboveB} à ${a} (+${step2}). Additionne les deux sauts : ${step1} + ${step2}.`
  }

  return `Compte directement l'écart entre ${b} et ${a}, pas à pas.`
}

/**
 * Live "how do I calculate this" tip shown alongside the question, before the
 * user answers — only for the simple integer addition/subtraction case used by
 * the "Premiers pas" onboarding mode. Returns null for anything else.
 */
export function getMentalMathHint(question: Pick<GeneratedQuestion, 'operation' | 'operands'>): string | null {
  const { operation, operands } = question
  if (operation !== 'addition' && operation !== 'subtraction') return null
  if (operands.length !== 2) return null

  const [rawA, rawB] = operands
  if (isFraction(rawA) || isFraction(rawB)) return null
  const a = rawA as number
  const b = rawB as number
  if (!Number.isInteger(a) || !Number.isInteger(b)) return null

  return operation === 'addition' ? additionHint(a, b) : subtractionHint(a, b)
}
