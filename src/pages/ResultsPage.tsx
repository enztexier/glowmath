import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Operation, SessionConfig } from '../engine/types'
import type { SessionSummary } from './useSessionRuntime'
import { operationLabel } from '../engine/configSummary'
import { usePageMeta } from '../hooks/usePageMeta'
import './ResultsPage.css'

interface ResultsState {
  summary: SessionSummary
  config: SessionConfig
}

function formatAverage(seconds: number): string {
  return `${seconds.toFixed(1).replace('.', ',')} secondes`
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.round(totalSeconds % 60)
  if (minutes === 0) return `${seconds}s`
  return `${minutes}min ${seconds}s`
}

export default function ResultsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ResultsState | null

  usePageMeta({ title: 'Résultats', noindex: true })

  if (!state) {
    return (
      <div className="results-missing">
        <p>Aucun résultat à afficher.</p>
        <Link to="/">Retour à l'accueil</Link>
      </div>
    )
  }

  return <ResultsView state={state} navigate={navigate} />
}

function ResultsView({
  state,
  navigate,
}: {
  state: ResultsState
  navigate: ReturnType<typeof useNavigate>
}) {
  const { summary, config } = state

  const percent = summary.totalQuestions > 0 ? Math.round((summary.correctAnswers / summary.totalQuestions) * 100) : 0
  const totalTimeSeconds = summary.answers.reduce((sum, a) => sum + a.responseTimeSeconds, 0)

  const breakdown = new Map<Operation, { correct: number; total: number }>()
  for (const record of summary.answers) {
    const key = record.question.operation
    const bucket = breakdown.get(key) ?? { correct: 0, total: 0 }
    bucket.total += 1
    if (record.isCorrect) bucket.correct += 1
    breakdown.set(key, bucket)
  }

  function handleRelaunch() {
    navigate('/session', { state: { config } })
  }

  return (
    <div className="results-wrap">
      <div className="score-card">
        <div className="label">Série terminée</div>
        <div className="score">
          {summary.correctAnswers} / {summary.totalQuestions}
        </div>
        <div className="sub">Temps moyen par question : {formatAverage(summary.averageTimeSeconds)}</div>
      </div>

      <div className="stats-row">
        <div className="stat-box">
          <div className="num" style={{ color: 'var(--color-correct)' }}>
            {percent}%
          </div>
          <div className="label">de réussite</div>
        </div>
        <div className="stat-box">
          <div className="num">{formatDuration(totalTimeSeconds)}</div>
          <div className="label">temps total</div>
        </div>
      </div>

      {breakdown.size > 1 && (
        <div className="breakdown">
          <h3>Détail par opération</h3>
          {[...breakdown.entries()].map(([operation, stats]) => {
            const ratio = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0
            return (
              <div className="op-row" key={operation}>
                <div className="op-name">{operationLabel(operation)}</div>
                <div className="op-bar-track">
                  <div className={`op-bar-fill${ratio < 70 ? ' mid' : ''}`} style={{ width: `${ratio}%` }} />
                </div>
                <div className="op-score">
                  {stats.correct}/{stats.total}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {config.correction.mode === 'endOfSeries' && (
        <div className="detail-list">
          <h3>Détail des réponses</h3>
          {summary.answers.map((record, index) => (
            <div key={record.question.id} className={`detail-row${record.isCorrect ? ' correct' : ' incorrect'}`}>
              <span aria-hidden="true">{record.isCorrect ? '✓' : '✗'}</span>
              <span className="detail-question">
                {index + 1}. {record.question.displayText}
              </span>
              <span className="detail-answer">
                Toi : {record.userAnswerDisplay || '—'}
                {!record.isCorrect && ` · Correct : ${record.question.correctAnswerDisplay}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="actions">
        <Link to="/" className="btn secondary">
          Retour à l'accueil
        </Link>
        <button type="button" className="btn primary" onClick={handleRelaunch}>
          Relancer →
        </button>
      </div>
    </div>
  )
}
