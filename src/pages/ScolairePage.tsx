import { Link } from 'react-router-dom'
import { summarizeConfig } from '../engine/configSummary'
import { schoolPresets, slugForSchoolPresetId } from '../engine/presets'
import { usePageMeta } from '../hooks/usePageMeta'
import './ScolairePage.css'

const CARD_TONES = [
  'var(--color-tile-1)',
  'var(--color-tile-2)',
  'var(--color-tile-3)',
  'var(--color-tile-4)',
  'var(--color-tile-5)',
  'var(--color-tile-6)',
  'var(--color-tile-7)',
  'var(--color-tile-8)',
]

export default function ScolairePage() {
  usePageMeta({
    title: 'Mode scolaire',
    description: 'Calcul mental adapté au programme scolaire, du CP au lycée : CP, CE1, CE2, CM1, CM2, collège et lycée.',
  })

  return (
    <div className="wrap">
      <h1 className="page-title">Mode scolaire</h1>
      <p className="page-intro">Choisis ton niveau : le contenu est adapté au programme, du CP au lycée.</p>

      <div className="levels-grid">
        {schoolPresets.map((preset, index) => (
          <Link
            key={preset.id}
            to={`/scolaire/${slugForSchoolPresetId(preset.id)}`}
            className="level-card"
            style={{ background: CARD_TONES[index % CARD_TONES.length] }}
          >
            <div className="level-card-code">{preset.name}</div>
            <div className="level-card-desc">{summarizeConfig(preset)}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
