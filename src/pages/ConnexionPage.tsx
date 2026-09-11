import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import './ConnexionPage.css'

export default function ConnexionPage() {
  usePageMeta({ title: 'Connexion', description: 'La connexion à ton compte arrive prochainement.', noindex: true })

  return (
    <div className="wrap">
      <div className="connexion-card">
        <span className="connexion-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
        </span>
        <h1>Bientôt disponible</h1>
        <p>La connexion à ton compte arrive prochainement.</p>
        <Link to="/" className="connexion-back">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
