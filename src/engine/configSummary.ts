import type { Operation, SessionConfig } from './types'

const OPERATION_LABELS: Record<Operation, string> = {
  addition: 'Addition',
  subtraction: 'Soustraction',
  multiplication: 'Multiplication',
  division: 'Division',
  power: 'Puissances',
  squareRoot: 'Racines carrées',
  percentage: 'Pourcentages',
  orderOfOperations: 'Priorités opératoires',
  rounding: 'Arrondis',
}

export function operationLabel(operation: Operation): string {
  return OPERATION_LABELS[operation]
}

export function summarizeConfig(config: SessionConfig): string {
  const parts: string[] = []

  parts.push(config.operations.length > 0 ? config.operations.map(operationLabel).join(', ') : 'Aucune opération')

  const numberTypeLabels: string[] = []
  if (config.numberTypes.integer.enabled) {
    numberTypeLabels.push(`Entiers ${config.numberTypes.integer.min}-${config.numberTypes.integer.max}`)
  }
  if (config.numberTypes.decimal.enabled) {
    numberTypeLabels.push(`Décimaux (${config.numberTypes.decimal.decimals} déc.)`)
  }
  if (config.numberTypes.fraction.enabled) {
    numberTypeLabels.push('Fractions')
  }
  if (config.numberTypes.allowNegative) {
    numberTypeLabels.push('Relatifs')
  }
  if (numberTypeLabels.length > 0) {
    parts.push(numberTypeLabels.join(' · '))
  }

  if (config.session.mode === 'fixedCount') {
    parts.push(`${config.session.questionCount ?? 20} questions`)
  } else if (config.session.mode === 'totalTime') {
    parts.push(`${config.session.totalTimeSeconds ?? 60} s chrono`)
  } else if (config.session.mode === 'survival') {
    parts.push('Mode survie')
  } else {
    parts.push('Entraînement libre')
  }

  return parts.join(' · ')
}
