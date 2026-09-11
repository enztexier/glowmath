import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { summarizeConfig } from '../engine/configSummary'
import { findSchoolPresetBySlug } from '../engine/presets'
import { SessionRunner } from './SessionPage'
import { usePageMeta } from '../hooks/usePageMeta'
import './SessionPage.css'

export default function ScolaireModePage() {
  const { slug } = useParams<{ slug: string }>()
  const preset = slug ? findSchoolPresetBySlug(slug) : undefined
  const config = useMemo(() => (preset ? { ...preset, id: crypto.randomUUID() } : undefined), [preset])

  usePageMeta(
    preset
      ? { title: `Niveau ${preset.name}`, description: summarizeConfig(preset) }
      : { title: 'Niveau introuvable', noindex: true },
  )

  if (!config) {
    return (
      <div className="session-missing">
        <p>Niveau introuvable.</p>
        <Link to="/scolaire">Choisir un niveau</Link>
      </div>
    )
  }

  return <SessionRunner config={config} />
}
