import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import type { Operation, SessionConfig } from '../engine/types'
import { isFraction } from '../engine/types'
import { findPresetById } from '../engine/presets'
import { getConfigById } from '../storage/localConfigStore'
import { addResult } from '../storage/localStatsStore'
import { validateAnswer } from '../engine/validators'
import { getMentalMathHint } from '../engine/mentalMathHints'
import { useSessionRuntime } from './useSessionRuntime'
import type { SessionSummary } from './useSessionRuntime'
import { usePageMeta } from '../hooks/usePageMeta'
import { sanitizeNumericAnswer } from '../lib/sanitizeInput'
import './SessionPage.css'

function resolveConfig(state: unknown, searchParams: URLSearchParams): SessionConfig | undefined {
  const stateConfig = (state as { config?: SessionConfig } | null)?.config
  if (stateConfig) return stateConfig

  const presetId = searchParams.get('preset')
  if (presetId) {
    const preset = findPresetById(presetId)
    if (preset) return preset
  }

  const configId = searchParams.get('configId')
  if (configId) {
    return getConfigById(configId)
  }

  return undefined
}

function formatChrono(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds))
  const minutes = Math.floor(total / 60)
  const secs = total % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function correctionLabel(mode: SessionConfig['correction']['mode']): string {
  const labels: Record<SessionConfig['correction']['mode'], string> = {
    immediate: 'immédiate',
    delayed: 'différée',
    onDemand: 'à la demande',
    endOfSeries: 'en fin de série',
    none: 'désactivée',
  }
  return labels[mode]
}

export default function SessionPage() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const config = useMemo(() => resolveConfig(location.state, searchParams), [location.state, searchParams])

  usePageMeta({ title: config ? 'Session en cours' : 'Configuration introuvable', noindex: true })

  if (!config) {
    return (
      <div className="session-missing">
        <p>Configuration introuvable.</p>
        <Link to="/modes">Choisir un mode</Link>
      </div>
    )
  }

  return <SessionRunner config={config} />
}

export function SessionRunner({ config }: { config: SessionConfig }) {
  const navigate = useNavigate()
  const [confirmQuit, setConfirmQuit] = useState(false)

  function handleFinish(summary: SessionSummary) {
    const breakdown: Partial<Record<Operation, { correct: number; total: number }>> = {}
    for (const record of summary.answers) {
      const key = record.question.operation
      const bucket = breakdown[key] ?? { correct: 0, total: 0 }
      bucket.total += 1
      if (record.isCorrect) bucket.correct += 1
      breakdown[key] = bucket
    }
    if (config.source === 'custom') {
      addResult({
        configId: config.id,
        configName: config.name,
        date: new Date().toISOString(),
        totalQuestions: summary.totalQuestions,
        correctAnswers: summary.correctAnswers,
        averageTimeSeconds: summary.averageTimeSeconds,
        breakdownByOperation: breakdown,
      })
    }
    navigate('/resultats', { state: { summary, config } })
  }

  const runtime = useSessionRuntime(config, handleFinish)

  function handleQuit() {
    if (runtime.answers.length > 0 && !confirmQuit) {
      setConfirmQuit(true)
      return
    }
    navigate('/')
  }

  function handleSubmitKeyboard() {
    if (!runtime.question) return
    const isCorrect = validateAnswer(runtime.question, runtime.inputValue, config)
    runtime.commitAnswer(runtime.inputValue, isCorrect)
  }

  function handleChoice(choice: string) {
    if (!runtime.question) return
    runtime.commitAnswer(choice, choice === runtime.question.correctAnswerDisplay)
  }

  function handleTrueFalse(userSaysTrue: boolean) {
    if (!runtime.trueFalseStatement) return
    runtime.commitAnswer(userSaysTrue ? 'Vrai' : 'Faux', userSaysTrue === runtime.trueFalseStatement.isTrue)
  }

  function handleKnewOrNot(knew: boolean) {
    runtime.commitAnswer(knew ? 'Je savais' : 'Je ne savais pas', knew)
  }

  function appendChar(char: string) {
    runtime.setInputValue((current) => current + char)
  }

  function backspace() {
    runtime.setInputValue((current) => current.slice(0, -1))
  }

  function toggleSign() {
    runtime.setInputValue((current) => (current.startsWith('-') ? current.slice(1) : `-${current}`))
  }

  if (!runtime.question) {
    return null
  }

  const isAnswering = runtime.phase === 'answering'
  const isTotalTimeMode = config.session.mode === 'totalTime'
  const showCorrection = runtime.phase === 'revealed' && runtime.revealVisible
  const showOnDemandPrompt = runtime.phase === 'revealed' && !runtime.revealVisible && config.correction.mode === 'onDemand'
  const showOnDemandNext = showCorrection && config.correction.mode === 'onDemand'
  const isFractionAnswer = isFraction(runtime.question.correctAnswer)
  const isPassiveReveal = config.answer.inputMode === 'knewOrNot' && config.timing.responseTimeSeconds != null
  const hint = config.showHints ? getMentalMathHint(runtime.question) : null

  const progressLabel =
    runtime.totalQuestions != null
      ? `${runtime.questionNumber} / ${runtime.totalQuestions}`
      : config.session.mode === 'totalTime'
        ? `${Math.max(0, Math.ceil(runtime.remainingSessionTime ?? 0))}s`
        : `${runtime.answers.filter((a) => a.isCorrect).length} bonnes réponses`

  const progressFillPercent =
    runtime.totalQuestions != null
      ? Math.min(100, (runtime.questionNumber / runtime.totalQuestions) * 100)
      : config.session.mode === 'totalTime'
        ? Math.min(100, ((runtime.remainingSessionTime ?? 0) / (config.session.totalTimeSeconds ?? 60)) * 100)
        : 100

  return (
    <div className="session-page">
      <div className="top-bar">
        <button type="button" className="quit-btn" aria-label="Quitter" onClick={handleQuit}>
          ✕
        </button>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressFillPercent}%` }} />
        </div>
        <div className="progress-label">{progressLabel}</div>
      </div>

      {isAnswering && runtime.remainingResponseTime != null && !isPassiveReveal && (
        <div className="timer-wrap">
          <div className="timer-ring">{Math.max(0, Math.ceil(runtime.remainingResponseTime))}s</div>
        </div>
      )}

      {isTotalTimeMode && runtime.remainingSessionTime != null && (
        <div className={`chrono-badge${runtime.remainingSessionTime <= 10 ? ' low' : ''}`}>
          <span className="chrono-icon" aria-hidden="true">
            ⏱
          </span>
          {formatChrono(runtime.remainingSessionTime)}
        </div>
      )}

      <div className="center">
        {config.answer.inputMode === 'keyboard' ? (
          <div className="question">
            {runtime.question.displayText.slice(0, -1)}
            {isAnswering ? (
              <input
                className={`answer-inline${runtime.inputValue ? ' filled' : ''}`}
                value={runtime.inputValue}
                onChange={(e) => runtime.setInputValue(sanitizeNumericAnswer(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmitKeyboard()
                }}
                inputMode="decimal"
                aria-label="Ta réponse"
                autoFocus
              />
            ) : showCorrection ? (
              <span className={`answer-inline-slot ${runtime.lastAnswer?.isCorrect ? 'correct' : 'incorrect'}`}>
                {runtime.question.correctAnswerDisplay}
              </span>
            ) : (
              <span className="answer-inline-slot neutral">{runtime.inputValue || '?'}</span>
            )}
          </div>
        ) : (
          <div className="question">
            {config.answer.inputMode === 'trueFalse' && runtime.trueFalseStatement ? (
              runtime.trueFalseStatement.displayText
            ) : (
              <>
                {runtime.question.displayText.slice(0, -1)}
                {showCorrection ? (
                  <span
                    className={`answer-inline-slot ${isPassiveReveal ? 'neutral' : runtime.lastAnswer?.isCorrect ? 'correct' : 'incorrect'}`}
                  >
                    {runtime.question.correctAnswerDisplay}
                  </span>
                ) : (
                  <span className="answer-inline-slot neutral">?</span>
                )}
              </>
            )}
          </div>
        )}

        {isAnswering && hint && (
          <div className="question-hint" aria-live="polite">
            <span className="question-hint-icon" aria-hidden="true">
              💡
            </span>
            {hint}
          </div>
        )}

        {showCorrection && config.answer.inputMode !== 'keyboard' && !isPassiveReveal && (
          <div className={`correction-banner ${runtime.lastAnswer?.isCorrect ? 'correct' : 'incorrect'}`} aria-live="polite">
            <span aria-hidden="true">{runtime.lastAnswer?.isCorrect ? '✓' : '✗'}</span>
            {runtime.lastAnswer?.isCorrect
              ? 'Bonne réponse !'
              : config.answer.inputMode === 'trueFalse'
                ? `Réponse : ${runtime.question.correctAnswerDisplay}`
                : 'Mauvaise réponse'}
          </div>
        )}

        {showOnDemandPrompt && (
          <button type="button" className="btn secondary" onClick={runtime.revealOnDemand}>
            Voir la réponse
          </button>
        )}

        {showOnDemandNext && (
          <button type="button" className="btn primary" onClick={runtime.advanceAfterAnswer}>
            Suivant →
          </button>
        )}

        {isAnswering && config.answer.inputMode === 'mcq' && runtime.question.choices && (
          <div className="mcq-choices">
            {runtime.question.choices.map((choice) => (
              <button key={choice} type="button" className="mcq-choice" onClick={() => handleChoice(choice)}>
                {choice}
              </button>
            ))}
          </div>
        )}

        {isAnswering && config.answer.inputMode === 'trueFalse' && (
          <div className="binary-choices">
            <button type="button" className="btn secondary" onClick={() => handleTrueFalse(true)}>
              Vrai
            </button>
            <button type="button" className="btn secondary" onClick={() => handleTrueFalse(false)}>
              Faux
            </button>
          </div>
        )}

        {isAnswering && config.answer.inputMode === 'knewOrNot' && config.timing.responseTimeSeconds == null && (
          <div className="binary-choices">
            <button type="button" className="btn secondary" onClick={() => handleKnewOrNot(true)}>
              Je savais
            </button>
            <button type="button" className="btn secondary" onClick={() => handleKnewOrNot(false)}>
              Je ne savais pas
            </button>
          </div>
        )}
      </div>

      {isAnswering && config.answer.inputMode === 'keyboard' && (
        <>
          <div className="keypad-utility">
            <button type="button" className="key action" onClick={() => appendChar(isFractionAnswer ? '/' : ',')}>
              {isFractionAnswer ? '/' : ','}
            </button>
            <button type="button" className="key action" onClick={toggleSign}>
              ±
            </button>
          </div>
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} type="button" className="key" onClick={() => appendChar(String(n))}>
                {n}
              </button>
            ))}
            <button type="button" className="key action" onClick={backspace}>
              ←
            </button>
            <button type="button" className="key" onClick={() => appendChar('0')}>
              0
            </button>
            <button type="button" className="key validate" onClick={handleSubmitKeyboard}>
              ✓
            </button>
          </div>
        </>
      )}

      <p className="footer-hint">correction {correctionLabel(config.correction.mode)}</p>

      {confirmQuit && (
        <div className="quit-confirm-overlay">
          <div className="quit-confirm-box">
            <p>Quitter la série en cours ? Ta progression ne sera pas enregistrée.</p>
            <div className="quit-confirm-actions">
              <button type="button" className="btn secondary" onClick={() => setConfirmQuit(false)}>
                Annuler
              </button>
              <button type="button" className="btn primary" onClick={() => navigate('/')}>
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
