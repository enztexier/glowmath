import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { findThemedPresetBySlug } from '../engine/presets'
import { THEME_DESCRIPTIONS } from './MenuPresetsPage'
import { SessionRunner } from './SessionPage'
import { usePageMeta } from '../hooks/usePageMeta'
import './SessionPage.css'

export default function ModePage() {
  const { slug } = useParams<{ slug: string }>()
  const preset = slug ? findThemedPresetBySlug(slug) : undefined
  const config = useMemo(() => (preset ? { ...preset, id: crypto.randomUUID() } : undefined), [preset])

  usePageMeta(
    preset
      ? { title: preset.name, description: THEME_DESCRIPTIONS[preset.id] }
      : { title: 'Mode introuvable', noindex: true },
  )

  if (!config) {
    return (
      <div className="session-missing">
        <p>Mode introuvable.</p>
        <Link to="/modes">Choisir un mode</Link>
      </div>
    )
  }

  return <SessionRunner config={config} />
}
