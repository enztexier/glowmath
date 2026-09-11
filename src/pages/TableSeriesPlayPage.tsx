import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { sanitizeNumericAnswer } from '../lib/sanitizeInput'
import './TableSeriesPlayPage.css'

interface SeriesSettings {
  operation: 'multiplication' | 'division'
  n: number
  random: boolean
  infinite: boolean
  revealAfterSeconds: number
  manualEntry: boolean
}

interface Fact {
  k: number
  prompt: string
  answer: number
}

const ADVANCE_DELAY_MS = 1600

function buildFacts(operation: 'multiplication' | 'division', n: number): Fact[] {
  return Array.from({ length: 10 }, (_, i) => i + 1).map((k) =>
    operation === 'multiplication'
      ? { k, prompt: `${n} × ${k}`, answer: n * k }
      : { k, prompt: `${n * k} ÷ ${n}`, answer: k },
  )
}

function shuffle<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function TableSeriesPlayPage() {
  const location = useLocation()
  const settings = location.state as SeriesSettings | null

  usePageMeta({ title: 'Série en cours', noindex: true })

  const [order, setOrder] = useState<Fact[]>(() =>
    settings ? (settings.random ? shuffle(buildFacts(settings.operation, settings.n)) : buildFacts(settings.operation, settings.n)) : [],
  )
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'asking' | 'revealed' | 'done'>('asking')
  const [inputValue, setInputValue] = useState('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [seenCount, setSeenCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(settings?.revealAfterSeconds ?? 5)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const advanceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  const current = order[index]

  useEffect(() => {
    if (!settings || phase !== 'asking') return
    if (settings.manualEntry) {
      inputRef.current?.focus()
      return
    }
    setSecondsLeft(settings.revealAfterSeconds)
    timeoutRef.current = setTimeout(() => reveal(false), settings.revealAfterSeconds * 1000)
    intervalRef.current = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, phase])

  useEffect(() => {
    if (phase !== 'revealed') return
    advanceRef.current = setTimeout(() => goNext(), ADVANCE_DELAY_MS)
    return () => clearTimeout(advanceRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  if (!settings || !current) {
    return <Navigate to="/tables" replace />
  }

  function reveal(submitted: boolean) {
    clearTimeout(timeoutRef.current)
    clearInterval(intervalRef.current)
    if (settings!.manualEntry) {
      const correct = submitted && Number(inputValue.replace(',', '.')) === current.answer
      setIsCorrect(correct)
      if (correct) setCorrectCount((c) => c + 1)
    }
    setSeenCount((s) => s + 1)
    setPhase('revealed')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'asking') reveal(true)
  }

  function appendChar(char: string) {
    setInputValue((current) => current + char)
  }

  function backspace() {
    setInputValue((current) => current.slice(0, -1))
  }

  function goNext() {
    clearTimeout(advanceRef.current)
    setInputValue('')
    setIsCorrect(null)
    if (index + 1 < order.length) {
      setIndex((i) => i + 1)
      setPhase('asking')
    } else if (settings!.infinite) {
      setOrder(settings!.random ? shuffle(buildFacts(settings!.operation, settings!.n)) : buildFacts(settings!.operation, settings!.n))
      setIndex(0)
      setPhase('asking')
    } else {
      setPhase('done')
    }
  }

  function restart() {
    setOrder(settings!.random ? shuffle(buildFacts(settings!.operation, settings!.n)) : buildFacts(settings!.operation, settings!.n))
    setIndex(0)
    setSeenCount(0)
    setCorrectCount(0)
    setInputValue('')
    setIsCorrect(null)
    setPhase('asking')
  }

  const tableHref = `/tables/${settings.operation}/${settings.n}`

  if (phase === 'done') {
    return (
      <div className="series-play">
        <div className="series-play-done">
          <h1>Série terminée !</h1>
          {settings.manualEntry && (
            <p className="series-play-score">
              {correctCount} / {order.length} bonnes réponses
            </p>
          )}
          <div className="series-play-done-actions">
            <button type="button" className="series-play-btn secondary" onClick={restart}>
              Recommencer
            </button>
            <Link to={tableHref} className="series-play-btn primary">
              Retour à la table
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const answerSlotClass =
    phase === 'revealed' && settings.manualEntry ? (isCorrect ? 'correct' : 'incorrect') : 'neutral'

  return (
    <div className="series-play">
      <div className="series-play-top">
        <Link to={tableHref} className="series-play-quit" aria-label="Quitter">
          ✕
        </Link>
        <div className="series-play-progress">{settings.infinite ? `${seenCount + 1}` : `${index + 1} / ${order.length}`}</div>
        {!settings.manualEntry && <div className="series-play-timer">{secondsLeft}s</div>}
      </div>

      <div className="series-play-center">
        <form onSubmit={handleSubmit} className="series-play-equation">
          <span>{current.prompt} =</span>
          {phase === 'asking' && settings.manualEntry ? (
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              className="series-play-inline-input"
              value={inputValue}
              onChange={(e) => setInputValue(sanitizeNumericAnswer(e.target.value))}
              aria-label="Ta réponse"
            />
          ) : phase === 'asking' ? (
            <span className="series-play-slot neutral">?</span>
          ) : (
            <span className={`series-play-slot ${answerSlotClass}`}>{current.answer}</span>
          )}
        </form>

        <div className="series-play-footer">
          {phase === 'asking' && settings.manualEntry && (
            <button type="button" className="series-play-btn primary series-desktop-only" onClick={() => reveal(true)}>
              Valider
            </button>
          )}
        </div>

        {phase === 'asking' && settings.manualEntry && (
          <div className="series-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} type="button" className="series-key" onClick={() => appendChar(String(n))}>
                {n}
              </button>
            ))}
            <button type="button" className="series-key action" onClick={backspace}>
              ←
            </button>
            <button type="button" className="series-key" onClick={() => appendChar('0')}>
              0
            </button>
            <button type="button" className="series-key validate" onClick={() => reveal(true)}>
              ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
