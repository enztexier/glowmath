import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import './NotFoundPage.css'

export default function NotFoundPage() {
  usePageMeta({ title: 'Page introuvable', noindex: true })

  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page introuvable</h1>
      <p className="not-found-text">Cette page n'existe pas ou plus. Retourne à l'accueil pour continuer.</p>
      <Link to="/" className="not-found-btn">
        Retour à l'accueil
      </Link>
    </div>
  )
}
