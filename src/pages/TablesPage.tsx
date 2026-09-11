import { Link } from 'react-router-dom'
import { GROUP_LABELS, TABLE_CATEGORIES } from './tables/categories'
import type { TableCategoryGroup } from './tables/categories'
import { usePageMeta } from '../hooks/usePageMeta'
import './TablesPage.css'

const GROUPS: TableCategoryGroup[] = ['calcul', 'geometrie', 'trigo-unites']

const CARD_TONES = [
  'var(--color-tile-1)',
  'var(--color-tile-2)',
  'var(--color-tile-3)',
  'var(--color-tile-4)',
  'var(--color-tile-5)',
  'var(--color-tile-6)',
  'var(--color-tile-7)',
  'var(--color-tile-8)',
  'var(--color-tile-9)',
]

export default function TablesPage() {
  usePageMeta({
    title: 'Tables et repères à connaître',
    description:
      'Tables de multiplication, carrés, puissances, nombres premiers, formules de géométrie et trigonométrie : les repères à connaître par cœur.',
  })

  return (
    <div className="wrap">
      <p className="page-intro">Les repères à connaître par cœur pour calculer vite.</p>

      {GROUPS.map((group) => (
        <section key={group} className="category-section">
          <h2 className="section-title">{GROUP_LABELS[group]}</h2>
          <div className="category-grid">
            {TABLE_CATEGORIES.filter((category) => category.group === group).map((category, index) => (
              <Link
                key={category.slug}
                to={`/tables/${category.slug}`}
                className="category-card"
                style={{ background: CARD_TONES[index % CARD_TONES.length] }}
              >
                <span className="category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="category-tag">{category.shortLabel}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
