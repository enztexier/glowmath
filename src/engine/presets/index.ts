import type { SessionConfig } from '../types'
import { schoolPresets } from './schoolPresets'
import { themedPresets } from './themedPresets'

export { schoolPresets } from './schoolPresets'
export { createTablesPreset, themedPresets } from './themedPresets'
export { difficultyLabels, difficultyPresets } from './difficultyPresets'
export type { SimpleDifficulty } from './difficultyPresets'

export const allPresets: SessionConfig[] = [...schoolPresets, ...themedPresets]

export function findPresetById(id: string): SessionConfig | undefined {
  return allPresets.find((preset) => preset.id === id)
}

export function slugForThemedPresetId(id: string): string {
  return id.replace(/^themed-/, '')
}

export function findThemedPresetBySlug(slug: string): SessionConfig | undefined {
  return themedPresets.find((preset) => slugForThemedPresetId(preset.id) === slug)
}

export function slugForSchoolPresetId(id: string): string {
  return id.replace(/^school-/, '')
}

export function findSchoolPresetBySlug(slug: string): SessionConfig | undefined {
  return schoolPresets.find((preset) => slugForSchoolPresetId(preset.id) === slug)
}
