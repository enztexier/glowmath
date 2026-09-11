import type { Operation } from '../engine/types'

const STORAGE_KEY = 'calcul-mental:sessions-history'

export interface SessionResult {
  configId: string
  configName: string
  date: string
  totalQuestions: number
  correctAnswers: number
  averageTimeSeconds: number
  breakdownByOperation: Partial<Record<Operation, { correct: number; total: number }>>
}

function readAll(): SessionResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(results: SessionResult[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
}

export function getHistory(): SessionResult[] {
  return readAll()
}

export function addResult(result: SessionResult): void {
  writeAll([...readAll(), result])
}

export function exportHistoryJson(): string {
  return JSON.stringify(readAll(), null, 2)
}

export function importHistoryJson(json: string): void {
  const parsed = JSON.parse(json)
  if (Array.isArray(parsed)) {
    writeAll(parsed)
  }
}
