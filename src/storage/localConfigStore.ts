import type { SessionConfig } from '../engine/types'

const STORAGE_KEY = 'calcul-mental:configs'
// Sidecar map (id -> ISO date), kept separate so the main storage format stays
// exactly `SessionConfig[]` as specified.
const CREATED_AT_KEY = 'calcul-mental:configs-created-at'

function readAll(): SessionConfig[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(configs: SessionConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
}

function readCreatedAtMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CREATED_AT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeCreatedAtMap(map: Record<string, string>): void {
  localStorage.setItem(CREATED_AT_KEY, JSON.stringify(map))
}

export function getCreatedAt(id: string): string | undefined {
  return readCreatedAtMap()[id]
}

export function getAllConfigs(): SessionConfig[] {
  return readAll()
}

export function getConfigById(id: string): SessionConfig | undefined {
  return readAll().find((config) => config.id === id)
}

export function saveConfig(config: SessionConfig): void {
  const configs = readAll()
  const index = configs.findIndex((existing) => existing.id === config.id)
  if (index >= 0) {
    configs[index] = config
  } else {
    configs.push(config)
    const createdAtMap = readCreatedAtMap()
    if (!createdAtMap[config.id]) {
      createdAtMap[config.id] = new Date().toISOString()
      writeCreatedAtMap(createdAtMap)
    }
  }
  writeAll(configs)
}

export function deleteConfig(id: string): void {
  writeAll(readAll().filter((config) => config.id !== id))
  const createdAtMap = readCreatedAtMap()
  delete createdAtMap[id]
  writeCreatedAtMap(createdAtMap)
}

export function duplicateConfig(id: string): SessionConfig | undefined {
  const original = getConfigById(id)
  if (!original) {
    return undefined
  }
  const copy: SessionConfig = { ...original, id: crypto.randomUUID(), name: `${original.name} (copie)`, source: 'custom' }
  saveConfig(copy)
  return copy
}
