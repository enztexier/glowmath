import type { Fraction } from './types'

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    ;[x, y] = [y, x % y]
  }
  return x === 0 ? 1 : x
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b)
}

export function makeFraction(numerator: number, denominator: number): Fraction {
  if (denominator === 0) {
    throw new Error('Fraction denominator cannot be zero')
  }
  if (denominator < 0) {
    return { numerator: -numerator, denominator: -denominator }
  }
  return { numerator, denominator }
}

export function simplifyFraction(f: Fraction): Fraction {
  const divisor = gcd(f.numerator, f.denominator)
  return makeFraction(f.numerator / divisor, f.denominator / divisor)
}

export function fractionToNumber(f: Fraction): number {
  return f.numerator / f.denominator
}

export function addFractions(a: Fraction, b: Fraction): Fraction {
  const denominator = lcm(a.denominator, b.denominator)
  const numerator =
    a.numerator * (denominator / a.denominator) + b.numerator * (denominator / b.denominator)
  return makeFraction(numerator, denominator)
}

export function subFractions(a: Fraction, b: Fraction): Fraction {
  const denominator = lcm(a.denominator, b.denominator)
  const numerator =
    a.numerator * (denominator / a.denominator) - b.numerator * (denominator / b.denominator)
  return makeFraction(numerator, denominator)
}

export function mulFractions(a: Fraction, b: Fraction): Fraction {
  return makeFraction(a.numerator * b.numerator, a.denominator * b.denominator)
}

export function divFractions(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === 0) {
    throw new Error('Cannot divide by a zero fraction')
  }
  return makeFraction(a.numerator * b.denominator, a.denominator * b.numerator)
}

export function fractionsEqual(a: Fraction, b: Fraction): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator
}

export function isProperFraction(f: Fraction): boolean {
  return Math.abs(f.numerator) < Math.abs(f.denominator)
}

export function formatFraction(f: Fraction): string {
  const negative = (f.numerator < 0) !== (f.denominator < 0)
  const numerator = Math.abs(f.numerator)
  const denominator = Math.abs(f.denominator)
  return `${negative ? '-' : ''}${numerator}/${denominator}`
}
