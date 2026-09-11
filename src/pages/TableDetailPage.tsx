import { Fragment } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { findCategoryBySlug } from './tables/categories'
import { getTableItems } from './tables/items'
import { useTheme } from '../theme/ThemeContext'
import type { Theme } from '../theme/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'
import './TableDetailPage.css'

const RANGE_1_TO_10 = Array.from({ length: 10 }, (_, i) => i + 1)

const ROW_COLORS: Record<Theme, string[]> = {
  light: ['#5B7FDB', '#6FA88A', '#D98F5E', '#9B84C4', '#4FA8A0', '#D9A441', '#C77B93', '#7C8FB0', '#A3924F', '#D9705F'],
  dark: ['#6E8FEF', '#6FBF94', '#E8975F', '#B08FE0', '#4FC4BC', '#F2C238', '#E28FAA', '#8FA3D9', '#C7B65C', '#F2836F'],
}

const TEXT_ON_ROW: Record<Theme, { light: string; dark: string }> = {
  light: { light: '#FFFFFF', dark: '#17171A' },
  dark: { light: '#F5F1E8', dark: '#0A0E1A' },
}

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

function relativeLuminance(hex: string): number {
  const channels = hexToRgb(hex).map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

function MultiplicationGrid() {
  const { theme } = useTheme()
  const rowColors = ROW_COLORS[theme]
  const textOptions = TEXT_ON_ROW[theme]

  return (
    <>
      <h2 className="subsection-title">Table générale</h2>
      <p className="content-note">
        Chaque table a sa propre couleur, qu'on la lise en ligne ou en colonne (3 × 7 et 7 × 3 sont assortis).
      </p>
      <div className="grid-scroll">
        <div className="heatmap-grid" role="table" aria-label="Table de multiplication de 1 à 10">
          <span className="heatmap-corner" aria-hidden="true" />
          {RANGE_1_TO_10.map((col) => (
            <span key={col} className="heatmap-header" role="columnheader">
              {col}
            </span>
          ))}
          {RANGE_1_TO_10.map((row) => (
            <Fragment key={row}>
              <span className="heatmap-header" role="rowheader">
                {row}
              </span>
              {RANGE_1_TO_10.map((col) => {
                const cellColor = rowColors[Math.max(row, col) - 1]
                const textColor = relativeLuminance(cellColor) > 0.45 ? textOptions.dark : textOptions.light
                return (
                  <span
                    key={col}
                    className="heatmap-cell"
                    role="cell"
                    style={{ backgroundColor: cellColor, color: textColor }}
                  >
                    {row * col}
                  </span>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  )
}

export default function TableDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = findCategoryBySlug(slug)

  usePageMeta(
    category
      ? { title: category.label, description: `${category.label} : à connaître par cœur pour calculer vite.` }
      : { title: 'Catégorie introuvable', noindex: true },
  )

  if (!category) {
    return <Navigate to="/tables" replace />
  }

  const items = getTableItems(category.kind)
  const isOperationTable = category.kind === 'multiplication' || category.kind === 'division'

  return (
    <div className="wrap">
      <Link to="/tables" className="back-link">
        ← Tables
      </Link>
      <h1 className="page-title">{category.label}</h1>

      <div className="op-table-grid">
        {items.map((item) => (
          <Link key={item.id} to={`/tables/${category.slug}/${item.id}`} className="op-summary-card">
            {isOperationTable ? (
              <>
                <span className="op-summary-number">{item.id}</span>
                <span className="op-summary-label">{item.label}</span>
              </>
            ) : (
              <span className="op-summary-number">{item.label}</span>
            )}
          </Link>
        ))}
      </div>

      {category.kind === 'multiplication' && <MultiplicationGrid />}
    </div>
  )
}
