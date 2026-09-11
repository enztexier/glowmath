import { Link } from 'react-router-dom'
import { slugForThemedPresetId, themedPresets } from '../engine/presets'
import { usePageMeta } from '../hooks/usePageMeta'
import './MenuPresetsPage.css'

const THEME_ICONS: Record<string, string> = {
  'themed-tables-2-3-4-5-6-7-8-9': '×',
  'themed-chrono': '⏱',
  'themed-fractions-decimals': '½',
  'themed-mix-college': '∞',
  'themed-addition-subtraction': '+',
  'themed-multiplication-division': '×÷',
  'themed-survival': '♥',
  'themed-mcq': '☰',
  'themed-percentage': '%',
  'themed-order-of-operations': '()',
  'themed-power-sqrt': '√',
  'themed-rounding': '≈',
  'themed-negative-numbers': '±',
  'themed-true-false': 'V/F',
  'themed-big-numbers': '#',
  'themed-chrono-2min': '⏳',
}

export const THEME_DESCRIPTIONS: Record<string, string> = {
  'themed-tables-2-3-4-5-6-7-8-9': 'Révise toutes les tables de multiplication, de 2 à 9.',
  'themed-chrono': "Réponds à un maximum de questions en 1 minute.",
  'themed-fractions-decimals': 'Fractions et nombres décimaux, dans les 4 opérations.',
  'themed-mix-college': 'Un mix complet niveau collège, avec négatifs et puissances.',
  'themed-addition-subtraction': "Que des additions et soustractions, pour s'échauffer.",
  'themed-multiplication-division': 'Que des multiplications et divisions.',
  'themed-survival': "Une erreur et c'est fini : combien de bonnes réponses vas-tu enchaîner ?",
  'themed-mcq': 'Réponds vite en choisissant parmi 4 propositions.',
  'themed-percentage': 'Calcule des pourcentages courants.',
  'themed-order-of-operations': "Applique les priorités opératoires (×÷ avant +−).",
  'themed-power-sqrt': 'Carrés, cubes et racines carrées.',
  'themed-rounding': 'Arrondis des nombres décimaux au bon chiffre.',
  'themed-negative-numbers': 'Additionne, soustrait, multiplie et divise avec des nombres négatifs.',
  'themed-true-false': 'Une réponse est affichée : à toi de dire si elle est juste.',
  'themed-big-numbers': 'Calcule avec des nombres à trois et quatre chiffres.',
  'themed-chrono-2min': 'Le même principe que Chrono, mais sur 2 minutes.',
}

export default function MenuPresetsPage() {
  usePageMeta({
    title: "S'entraîner",
    description:
      "16 modes d'entraînement au calcul mental prêts à l'emploi : chrono, survie, QCM, fractions, pourcentages, priorités opératoires et plus encore.",
  })

  return (
    <div className="wrap">
      <h1 className="page-title">Choisis ton mode</h1>
      <p className="page-intro">Clique sur un mode pour lancer la session directement.</p>

      <div className="themes-grid">
        {themedPresets.map((preset) => (
          <Link key={preset.id} to={`/modes/${slugForThemedPresetId(preset.id)}`} className="theme-card">
            <span className="tag">{THEME_ICONS[preset.id] ?? '★'}</span>
            <div className="theme-card-text">
              <h3>{preset.name}</h3>
              <p className="theme-desc">{THEME_DESCRIPTIONS[preset.id]}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
