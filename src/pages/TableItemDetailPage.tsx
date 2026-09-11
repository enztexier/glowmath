import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findCategoryBySlug } from './tables/categories'
import { getTableItems } from './tables/items'
import { usePageMeta } from '../hooks/usePageMeta'
import './TableItemDetailPage.css'

const SERIES_KINDS = new Set(['multiplication', 'division'])

const FONT_OPTIONS = [
  { id: 'default', label: 'Archivo', family: "'Archivo', sans-serif" },
  { id: 'serif', label: 'Serif', family: "Georgia, 'Times New Roman', serif" },
  { id: 'mono', label: 'Monospace', family: "'Courier New', Courier, monospace" },
  { id: 'rounded', label: 'Arrondie', family: "'Comic Sans MS', 'Comic Sans', cursive" },
  { id: 'narrow', label: 'Condensée', family: "'Arial Narrow', Arial, sans-serif" },
]

const DEFAULT_COLOR = '#4B5A3E'

export default function TableItemDetailPage() {
  const { slug, itemId } = useParams<{ slug: string; itemId: string }>()
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [fontId, setFontId] = useState(FONT_OPTIONS[0].id)

  const category = findCategoryBySlug(slug)
  const item = category ? getTableItems(category.kind).find((candidate) => candidate.id === itemId) : undefined

  usePageMeta(
    category && item
      ? { title: `${item.label} — ${category.shortLabel}`, description: `${item.label} : ${category.label}.` }
      : { title: 'Introuvable', noindex: true },
  )

  if (!category || !item) {
    return <Navigate to={`/tables/${slug ?? ''}`} replace />
  }

  const fontFamily = FONT_OPTIONS.find((f) => f.id === fontId)?.family ?? FONT_OPTIONS[0].family

  return (
    <div className="wrap">
      <Link to={`/tables/${category.slug}`} className="back-link">
        ← {category.shortLabel}
      </Link>
      <div className="op-detail-header">
        <h1 className="page-title">{item.label}</h1>
        {SERIES_KINDS.has(category.kind) && (
          <Link to={`/tables/${category.slug}/${item.id}/serie`} className="op-launch-series-btn">
            Lancer une série →
          </Link>
        )}
      </div>

      <div className="op-settings-bar">
        <label className="op-settings-field">
          <span>Couleur</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label className="op-settings-field">
          <span>Police</span>
          <select value={fontId} onChange={(e) => setFontId(e.target.value)}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="op-detail-grid" style={{ fontFamily }}>
        {item.lines.map((line, index) => (
          <div key={index} className="op-detail-row" style={{ color }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
