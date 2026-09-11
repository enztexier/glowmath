import type { SessionConfig } from '../types'

export type SimpleDifficulty = 'easy' | 'medium' | 'hard'

type DifficultyPreset = Pick<SessionConfig, 'numberTypes' | 'difficulty'>

export const difficultyPresets: Record<SimpleDifficulty, DifficultyPreset> = {
  easy: {
    numberTypes: {
      integer: { enabled: true, min: 1, max: 20 },
      decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
      fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
      allowNegative: false,
    },
    difficulty: { operandsCount: 2, forceCarry: false, tablesOnly: null, divisionExactOnly: true },
  },
  medium: {
    numberTypes: {
      integer: { enabled: true, min: 1, max: 100 },
      decimal: { enabled: false, decimals: 1, min: 0, max: 100 },
      fraction: { enabled: false, numeratorMax: 1, denominators: [2], simplifyResult: true, allowImproper: false },
      allowNegative: false,
    },
    difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
  },
  hard: {
    numberTypes: {
      integer: { enabled: true, min: 1, max: 1000 },
      decimal: { enabled: true, decimals: 2, min: 1, max: 1000 },
      fraction: { enabled: false, numeratorMax: 5, denominators: [2, 3, 4, 5], simplifyResult: true, allowImproper: false },
      allowNegative: false,
    },
    difficulty: { operandsCount: 3, forceCarry: true, tablesOnly: null, divisionExactOnly: false },
  },
}

export const difficultyLabels: Record<SimpleDifficulty, string> = {
  easy: 'Facile',
  medium: 'Moyen',
  hard: 'Difficile',
}
