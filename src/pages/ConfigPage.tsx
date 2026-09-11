import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Operation, SessionConfig } from '../engine/types'
import { createDefaultConfig } from '../engine/defaultConfig'
import { difficultyLabels, difficultyPresets, findPresetById } from '../engine/presets'
import type { SimpleDifficulty } from '../engine/presets'
import { getConfigById, saveConfig } from '../storage/localConfigStore'
import OperationChips from '../components/config/OperationChips'
import AccordionItem from '../components/config/AccordionItem'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import { usePageMeta } from '../hooks/usePageMeta'
import { sanitizeNumberList } from '../lib/sanitizeInput'
import './ConfigPage.css'

const SIMPLE_OPERATIONS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division']
const ALL_OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'division',
  'power',
  'squareRoot',
  'percentage',
  'orderOfOperations',
  'rounding',
]
const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50]

function resolveInitialConfig(searchParams: URLSearchParams): SessionConfig {
  const configId = searchParams.get('configId')
  if (configId) {
    const saved = getConfigById(configId)
    if (saved) return saved
  }
  const presetId = searchParams.get('preset')
  if (presetId) {
    const preset = findPresetById(presetId)
    if (preset) return { ...preset, id: crypto.randomUUID(), source: 'custom' }
  }
  return createDefaultConfig()
}

function parseNumberList(value: string): number[] {
  return value
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
}

function numberTypesStatus(config: SessionConfig): string {
  const labels: string[] = []
  if (config.numberTypes.integer.enabled) labels.push('Entiers')
  if (config.numberTypes.decimal.enabled) labels.push('Décimaux')
  if (config.numberTypes.fraction.enabled) labels.push('Fractions')
  return labels.length > 0 ? labels.join(', ') : 'Aucun'
}

function sessionStatus(config: SessionConfig): string {
  if (config.session.mode === 'fixedCount') return `${config.session.questionCount ?? 20} questions`
  if (config.session.mode === 'totalTime') return `${config.session.totalTimeSeconds ?? 60} s`
  if (config.session.mode === 'survival') return 'Survie'
  return 'Entraînement'
}

function answerStatus(config: SessionConfig): string {
  const labels: Record<SessionConfig['answer']['inputMode'], string> = {
    keyboard: 'Clavier',
    mcq: 'QCM',
    trueFalse: 'Vrai/Faux',
    knewOrNot: 'Je savais',
  }
  return labels[config.answer.inputMode]
}

function correctionStatus(config: SessionConfig): string {
  const labels: Record<SessionConfig['correction']['mode'], string> = {
    immediate: 'Immédiate',
    delayed: 'Différée',
    onDemand: 'À la demande',
    endOfSeries: 'Fin de série',
    none: 'Aucune',
  }
  return labels[config.correction.mode]
}

export default function ConfigPage() {
  usePageMeta({
    title: 'Personnalise ton mode',
    description:
      'Crée ta propre session de calcul mental : opérations, difficulté, nombre de questions, format de réponse — tout est personnalisable.',
  })
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [config, setConfig] = useState<SessionConfig>(() => resolveInitialConfig(searchParams))
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [simpleDifficulty, setSimpleDifficulty] = useState<SimpleDifficulty>('medium')
  const [showSaveField, setShowSaveField] = useState(false)
  const [savedName, setSavedName] = useState('')
  const [saveConfirmation, setSaveConfirmation] = useState(false)

  function toggleOperation(operation: Operation) {
    setConfig((current) => {
      const has = current.operations.includes(operation)
      const operations = has ? current.operations.filter((op) => op !== operation) : [...current.operations, operation]
      return { ...current, operations }
    })
  }

  function applySimpleDifficulty(level: SimpleDifficulty) {
    setSimpleDifficulty(level)
    const preset = difficultyPresets[level]
    setConfig((current) => ({ ...current, numberTypes: preset.numberTypes, difficulty: preset.difficulty }))
  }

  function setQuestionCount(count: number) {
    setConfig((current) => ({ ...current, session: { mode: 'fixedCount', questionCount: count } }))
  }

  function updateNumberType<K extends 'integer' | 'decimal' | 'fraction'>(
    kind: K,
    patch: Partial<SessionConfig['numberTypes'][K]>,
  ) {
    setConfig((current) => ({
      ...current,
      numberTypes: { ...current.numberTypes, [kind]: { ...current.numberTypes[kind], ...patch } },
    }))
  }

  function toggleAllowNegative() {
    setConfig((current) => ({ ...current, numberTypes: { ...current.numberTypes, allowNegative: !current.numberTypes.allowNegative } }))
  }

  function updateDifficulty(patch: Partial<SessionConfig['difficulty']>) {
    setConfig((current) => ({ ...current, difficulty: { ...current.difficulty, ...patch } }))
  }

  function updateSession(patch: Partial<SessionConfig['session']>) {
    setConfig((current) => ({ ...current, session: { ...current.session, ...patch } }))
  }

  function updateAnswer(patch: Partial<SessionConfig['answer']>) {
    setConfig((current) => ({ ...current, answer: { ...current.answer, ...patch } }))
  }

  function updateCorrection(patch: Partial<SessionConfig['correction']>) {
    setConfig((current) => ({ ...current, correction: { ...current.correction, ...patch } }))
  }

  function updateTiming(patch: Partial<SessionConfig['timing']>) {
    setConfig((current) => ({ ...current, timing: { ...current.timing, ...patch } }))
  }

  function handleSaveClick() {
    if (!showSaveField) {
      setSavedName(config.name === 'Ma configuration' ? '' : config.name)
      setShowSaveField(true)
      return
    }
    const name = savedName.trim() || 'Ma configuration'
    const toSave: SessionConfig = { ...config, name, source: 'custom' }
    saveConfig(toSave)
    setConfig(toSave)
    setShowSaveField(false)
    setSaveConfirmation(true)
    window.setTimeout(() => setSaveConfirmation(false), 2500)
  }

  function handleLaunch() {
    navigate('/session', { state: { config } })
  }

  const revealSeconds = config.timing.responseTimeSeconds ?? 5

  return (
    <div className="wrap">
      <div className="config-inner">
        <div className="mode-toggle">
          <div className={`opt${mode === 'simple' ? ' active' : ''}`} onClick={() => setMode('simple')}>
            Simple
          </div>
          <div className={`opt${mode === 'advanced' ? ' active' : ''}`} onClick={() => setMode('advanced')}>
            Avancé
          </div>
        </div>

        {mode === 'simple' ? (
          <div className="panel">
            <div className="config-row column">
              <div className="config-row-title">Opérations</div>
              <OperationChips operations={SIMPLE_OPERATIONS} selected={config.operations} onToggle={toggleOperation} />
            </div>

            <div className="config-row column">
              <div className="config-row-title">Difficulté</div>
              <div className="difficulty-row">
                {(Object.keys(difficultyLabels) as SimpleDifficulty[]).map((level) => (
                  <div
                    key={level}
                    className={`diff-opt${simpleDifficulty === level ? ' selected' : ''}`}
                    onClick={() => applySimpleDifficulty(level)}
                  >
                    {difficultyLabels[level]}
                  </div>
                ))}
              </div>
            </div>

            {config.session.mode !== 'training' && (
              <div className="config-row column">
                <div className="config-row-title">Nombre de questions</div>
                <div className="qcount-row">
                  {QUESTION_COUNT_OPTIONS.map((count) => (
                    <div
                      key={count}
                      className={`qcount-opt${config.session.questionCount === count ? ' selected' : ''}`}
                      onClick={() => setQuestionCount(count)}
                    >
                      {count}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="config-row">
              <div className="config-row-text">
                <div className="config-row-title">Aléatoire</div>
                <div className="config-row-hint">Les questions sont toujours mélangées</div>
              </div>
              <span className="config-row-locked">
                <ToggleSwitch checked onChange={() => {}} label="Aléatoire" />
              </span>
            </div>

            <div className="config-row">
              <div className="config-row-text">
                <div className="config-row-title">À l'infini</div>
                <div className="config-row-hint">La série continue sans limite de questions</div>
              </div>
              <ToggleSwitch
                checked={config.session.mode === 'training'}
                onChange={(v) =>
                  updateSession(v ? { mode: 'training' } : { mode: 'fixedCount', questionCount: config.session.questionCount ?? 20 })
                }
                label="À l'infini"
              />
            </div>

            <div className="config-row">
              <div className="config-row-text">
                <div className="config-row-title">Remplir à la main</div>
                <div className="config-row-hint">Tape la réponse au clavier</div>
              </div>
              <ToggleSwitch
                checked={config.answer.inputMode !== 'knewOrNot'}
                onChange={(v) => {
                  if (v) {
                    updateAnswer({ inputMode: 'keyboard' })
                    updateTiming({ responseTimeSeconds: null })
                    updateCorrection({ mode: 'immediate' })
                  } else {
                    updateAnswer({ inputMode: 'knewOrNot' })
                    updateTiming({ responseTimeSeconds: revealSeconds })
                    updateCorrection({ mode: 'immediate' })
                  }
                }}
                label="Remplir à la main"
              />
            </div>

            <div className="config-row column">
              <div className="config-row-header">
                <div className="config-row-text">
                  <div className="config-row-title">Voir la réponse après</div>
                  <div className="config-row-hint">La réponse s'affiche toute seule, puis la question suivante arrive</div>
                </div>
                <ToggleSwitch
                  checked={config.answer.inputMode === 'knewOrNot'}
                  onChange={(v) => {
                    if (v) {
                      updateAnswer({ inputMode: 'knewOrNot' })
                      updateTiming({ responseTimeSeconds: revealSeconds })
                      updateCorrection({ mode: 'immediate' })
                    } else {
                      updateAnswer({ inputMode: 'keyboard' })
                      updateTiming({ responseTimeSeconds: null })
                      updateCorrection({ mode: 'immediate' })
                    }
                  }}
                  label="Voir la réponse après"
                />
              </div>
              {config.answer.inputMode === 'knewOrNot' && (
                <>
                  <div className="config-row-hint">
                    {revealSeconds} seconde{revealSeconds > 1 ? 's' : ''}
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={revealSeconds}
                    onChange={(e) => updateTiming({ responseTimeSeconds: Number(e.target.value) })}
                    className="config-slider"
                    aria-label="Voir la réponse après combien de secondes"
                  />
                </>
              )}
            </div>
          </div>
        ) : (
        <div className="accordion visible">
          <AccordionItem title="Opérations" status={`${config.operations.length} sélectionnée(s)`}>
            <OperationChips operations={ALL_OPERATIONS} selected={config.operations} onToggle={toggleOperation} />
          </AccordionItem>

          <AccordionItem title="Types de nombres" status={numberTypesStatus(config)}>
            <div className="subrow">
              <span>Entiers</span>
              <ToggleSwitch checked={config.numberTypes.integer.enabled} onChange={(v) => updateNumberType('integer', { enabled: v })} />
            </div>
            {config.numberTypes.integer.enabled && (
              <div className="subfields">
                <label>
                  Min
                  <input
                    type="number"
                    value={config.numberTypes.integer.min}
                    onChange={(e) => updateNumberType('integer', { min: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Max
                  <input
                    type="number"
                    value={config.numberTypes.integer.max}
                    onChange={(e) => updateNumberType('integer', { max: Number(e.target.value) })}
                  />
                </label>
              </div>
            )}

            <div className="subrow">
              <span>Décimaux</span>
              <ToggleSwitch checked={config.numberTypes.decimal.enabled} onChange={(v) => updateNumberType('decimal', { enabled: v })} />
            </div>
            {config.numberTypes.decimal.enabled && (
              <div className="subfields">
                <label>
                  Décimales
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={config.numberTypes.decimal.decimals}
                    onChange={(e) => updateNumberType('decimal', { decimals: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Min
                  <input
                    type="number"
                    value={config.numberTypes.decimal.min}
                    onChange={(e) => updateNumberType('decimal', { min: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Max
                  <input
                    type="number"
                    value={config.numberTypes.decimal.max}
                    onChange={(e) => updateNumberType('decimal', { max: Number(e.target.value) })}
                  />
                </label>
              </div>
            )}

            <div className="subrow">
              <span>Fractions</span>
              <ToggleSwitch checked={config.numberTypes.fraction.enabled} onChange={(v) => updateNumberType('fraction', { enabled: v })} />
            </div>
            {config.numberTypes.fraction.enabled && (
              <div className="subfields">
                <label>
                  Numérateur max
                  <input
                    type="number"
                    value={config.numberTypes.fraction.numeratorMax}
                    onChange={(e) => updateNumberType('fraction', { numeratorMax: Number(e.target.value) })}
                  />
                </label>
                <label>
                  Dénominateurs
                  <input
                    type="text"
                    value={config.numberTypes.fraction.denominators.join(', ')}
                    onChange={(e) =>
                      updateNumberType('fraction', { denominators: parseNumberList(sanitizeNumberList(e.target.value)) })
                    }
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.numberTypes.fraction.simplifyResult}
                    onChange={(e) => updateNumberType('fraction', { simplifyResult: e.target.checked })}
                  />
                  Simplifier le résultat
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.numberTypes.fraction.allowImproper}
                    onChange={(e) => updateNumberType('fraction', { allowImproper: e.target.checked })}
                  />
                  Autoriser les fractions impropres
                </label>
              </div>
            )}

            <div className="subrow">
              <span>Nombres négatifs</span>
              <ToggleSwitch checked={config.numberTypes.allowNegative} onChange={toggleAllowNegative} />
            </div>
          </AccordionItem>

          <AccordionItem title="Difficulté" status={`${config.difficulty.operandsCount} opérandes`}>
            <div className="field-row">
              <span>Nombre d'opérandes</span>
              <select
                value={config.difficulty.operandsCount}
                onChange={(e) => updateDifficulty({ operandsCount: Number(e.target.value) as 2 | 3 | 4 })}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div className="field-row">
              <span>Retenue / emprunt</span>
              <select
                value={config.difficulty.forceCarry === null ? 'indifferent' : config.difficulty.forceCarry ? 'always' : 'never'}
                onChange={(e) =>
                  updateDifficulty({ forceCarry: e.target.value === 'indifferent' ? null : e.target.value === 'always' })
                }
              >
                <option value="indifferent">Indifférent</option>
                <option value="always">Toujours</option>
                <option value="never">Jamais</option>
              </select>
            </div>
            <div className="field-row">
              <span>Tables spécifiques</span>
              <input
                type="text"
                placeholder="ex : 7, 8"
                value={config.difficulty.tablesOnly?.join(', ') ?? ''}
                onChange={(e) => {
                  const cleaned = sanitizeNumberList(e.target.value)
                  updateDifficulty({ tablesOnly: cleaned.trim() === '' ? null : parseNumberList(cleaned) })
                }}
              />
            </div>
            <div className="subrow">
              <span>Division exacte uniquement</span>
              <ToggleSwitch checked={config.difficulty.divisionExactOnly} onChange={(v) => updateDifficulty({ divisionExactOnly: v })} />
            </div>
            <div className="field-row">
              <span>Exposant max (puissances)</span>
              <input
                type="number"
                min={2}
                max={6}
                value={config.difficulty.maxPowerExponent ?? 3}
                onChange={(e) => updateDifficulty({ maxPowerExponent: Number(e.target.value) })}
              />
            </div>
          </AccordionItem>

          <AccordionItem title="Format de session" status={sessionStatus(config)}>
            <div className="field-row">
              <span>Mode</span>
              <select
                value={config.session.mode}
                onChange={(e) => {
                  const nextMode = e.target.value as SessionConfig['session']['mode']
                  if (nextMode === 'fixedCount') updateSession({ mode: nextMode, questionCount: config.session.questionCount ?? 20 })
                  else if (nextMode === 'totalTime') updateSession({ mode: nextMode, totalTimeSeconds: config.session.totalTimeSeconds ?? 60 })
                  else updateSession({ mode: nextMode })
                }}
              >
                <option value="fixedCount">Nombre fixe de questions</option>
                <option value="totalTime">Chrono</option>
                <option value="survival">Survie</option>
                <option value="training">Entraînement libre</option>
              </select>
            </div>
            {config.session.mode === 'fixedCount' && (
              <div className="field-row">
                <span>Nombre de questions</span>
                <input
                  type="number"
                  min={1}
                  value={config.session.questionCount ?? 20}
                  onChange={(e) => updateSession({ questionCount: Number(e.target.value) })}
                />
              </div>
            )}
            {config.session.mode === 'totalTime' && (
              <div className="field-row">
                <span>Durée (secondes)</span>
                <input
                  type="number"
                  min={10}
                  value={config.session.totalTimeSeconds ?? 60}
                  onChange={(e) => updateSession({ totalTimeSeconds: Number(e.target.value) })}
                />
              </div>
            )}
          </AccordionItem>

          <AccordionItem title="Réponse" status={answerStatus(config)}>
            <div className="field-row">
              <span>Saisie</span>
              <select
                value={config.answer.inputMode}
                onChange={(e) => updateAnswer({ inputMode: e.target.value as SessionConfig['answer']['inputMode'] })}
              >
                <option value="keyboard">Clavier</option>
                <option value="mcq">QCM</option>
                <option value="trueFalse">Vrai / Faux</option>
                <option value="knewOrNot">Je savais / Je ne savais pas</option>
              </select>
            </div>
            {config.answer.inputMode === 'mcq' && (
              <div className="field-row">
                <span>Nombre de choix</span>
                <input
                  type="number"
                  min={2}
                  max={6}
                  value={config.answer.mcqChoicesCount ?? 4}
                  onChange={(e) => updateAnswer({ mcqChoicesCount: Number(e.target.value) })}
                />
              </div>
            )}
          </AccordionItem>

          <AccordionItem title="Correction & chronométrage" status={correctionStatus(config)}>
            <div className="field-row">
              <span>Correction</span>
              <select
                value={config.correction.mode}
                onChange={(e) => updateCorrection({ mode: e.target.value as SessionConfig['correction']['mode'] })}
              >
                <option value="immediate">Immédiate</option>
                <option value="delayed">Différée</option>
                <option value="onDemand">À la demande</option>
                <option value="endOfSeries">Fin de série</option>
                <option value="none">Aucune</option>
              </select>
            </div>
            {config.correction.mode === 'delayed' && (
              <div className="field-row">
                <span>Délai (secondes)</span>
                <input
                  type="number"
                  min={1}
                  value={config.correction.delaySeconds ?? 3}
                  onChange={(e) => updateCorrection({ delaySeconds: Number(e.target.value) })}
                />
              </div>
            )}
            <div className="field-row">
              <span>Temps de réponse (secondes)</span>
              <input
                type="number"
                min={0}
                placeholder="Illimité"
                value={config.timing.responseTimeSeconds ?? ''}
                onChange={(e) => updateTiming({ responseTimeSeconds: e.target.value === '' ? null : Number(e.target.value) })}
              />
            </div>
            <div className="field-row">
              <span>Affichage correction (secondes)</span>
              <input
                type="number"
                min={1}
                value={config.timing.correctionDisplaySeconds}
                onChange={(e) => updateTiming({ correctionDisplaySeconds: Number(e.target.value) })}
              />
            </div>
          </AccordionItem>
        </div>
      )}

      <div className="actions-row">
        {showSaveField && (
          <input
            type="text"
            className="save-name-input"
            placeholder="Nom de la configuration"
            value={savedName}
            onChange={(e) => setSavedName(e.target.value)}
          />
        )}
        <button type="button" className="btn secondary" onClick={handleSaveClick}>
          {showSaveField ? 'Confirmer' : 'Enregistrer'}
        </button>
        <button type="button" className="btn primary" onClick={handleLaunch}>
          Lancer la série →
        </button>
      </div>
      {saveConfirmation && <p className="save-confirmation">Configuration enregistrée ✓</p>}
      </div>
    </div>
  )
}
