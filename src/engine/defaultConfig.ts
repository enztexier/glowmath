import type { SessionConfig } from './types'

export function createDefaultConfig(): SessionConfig {
  return {
    id: crypto.randomUUID(),
    name: 'Ma configuration',
    source: 'custom',
    operations: ['addition', 'subtraction'],
    numberTypes: {
      integer: { enabled: true, min: 1, max: 100 },
      decimal: { enabled: false, decimals: 2, min: 0, max: 100 },
      fraction: { enabled: false, numeratorMax: 5, denominators: [2, 3, 4, 5, 10], simplifyResult: true, allowImproper: false },
      allowNegative: false,
    },
    difficulty: { operandsCount: 2, forceCarry: null, tablesOnly: null, divisionExactOnly: true },
    session: { mode: 'fixedCount', questionCount: 20 },
    answer: { inputMode: 'keyboard' },
    correction: { mode: 'immediate' },
    timing: { responseTimeSeconds: null, correctionDisplaySeconds: 2 },
  }
}
