import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ToggleSwitch from '../components/ui/ToggleSwitch'
import { usePageMeta } from '../hooks/usePageMeta'
import './TableSeriesSetupPage.css'

function isSeriesSlug(value: string | undefined): value is 'multiplication' | 'division' {
  return value === 'multiplication' || value === 'division'
}

export default function TableSeriesSetupPage() {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>()
  const navigate = useNavigate()
  const n = Number(itemId)
  const isValidNumber = Number.isInteger(n) && n >= 1 && n <= 10

  const [random, setRandom] = useState(true)
  const [infinite, setInfinite] = useState(false)
  const [revealAfterSeconds, setRevealAfterSeconds] = useState(5)
  const [manualEntry, setManualEntry] = useState(true)

  usePageMeta(
    isSeriesSlug(slug) && isValidNumber
      ? { title: `Lancer une série — ${slug === 'multiplication' ? 'Table de' : 'Division par'} ${itemId}` }
      : { title: 'Introuvable', noindex: true },
  )

  if (!isSeriesSlug(slug) || !isValidNumber) {
    return <Navigate to={`/tables/${slug ?? ''}`} replace />
  }

  function handleLaunch() {
    navigate(`/tables/${slug}/${itemId}/jouer`, {
      state: { operation: slug, n, random, infinite, revealAfterSeconds, manualEntry },
    })
  }

  return (
    <div className="wrap">
      <div className="series-setup-inner">
        <Link to={`/tables/${slug}/${itemId}`} className="back-link">
          ← Table de {n}
        </Link>
        <h1 className="page-title">Lancer une série</h1>
        <p className="page-intro">
          Table de {n} — {slug === 'multiplication' ? 'multiplication' : 'division'}
        </p>

        <div className="series-settings">
          <div className="series-row">
            <div className="series-row-text">
              <div className="series-row-title">Aléatoire</div>
              <div className="series-row-hint">Mélange l'ordre des questions</div>
            </div>
            <ToggleSwitch checked={random} onChange={setRandom} label="Aléatoire" />
          </div>

          <div className="series-row">
            <div className="series-row-text">
              <div className="series-row-title">À l'infini</div>
              <div className="series-row-hint">La série reboucle au lieu de s'arrêter après 10 questions</div>
            </div>
            <ToggleSwitch checked={infinite} onChange={setInfinite} label="À l'infini" />
          </div>

          <div className="series-row">
            <div className="series-row-text">
              <div className="series-row-title">Remplir à la main</div>
              <div className="series-row-hint">Tape la réponse au clavier</div>
            </div>
            <ToggleSwitch checked={manualEntry} onChange={setManualEntry} label="Remplir à la main" />
          </div>

          <div className="series-row column">
            <div className="series-row-header">
              <div className="series-row-text">
                <div className="series-row-title">Voir la réponse après</div>
                <div className="series-row-hint">La réponse s'affiche toute seule, sans rien taper</div>
              </div>
              <ToggleSwitch checked={!manualEntry} onChange={(v) => setManualEntry(!v)} label="Voir la réponse après" />
            </div>
            {!manualEntry && (
              <>
                <div className="series-row-hint">
                  {revealAfterSeconds} seconde{revealAfterSeconds > 1 ? 's' : ''}
                </div>
                <input
                  type="range"
                  min={1}
                  max={60}
                  value={revealAfterSeconds}
                  onChange={(e) => setRevealAfterSeconds(Number(e.target.value))}
                  className="series-slider"
                  aria-label="Voir la réponse après combien de secondes"
                />
              </>
            )}
          </div>
        </div>

        <button type="button" className="series-launch-btn" onClick={handleLaunch}>
          Lancer la série →
        </button>
      </div>
    </div>
  )
}
