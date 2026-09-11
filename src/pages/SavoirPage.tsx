import { Link } from 'react-router-dom'
import { OPERATIONS, methodsByOperation } from './savoir/methods'
import { usePageMeta } from '../hooks/usePageMeta'
import './SavoirPage.css'

export default function SavoirPage() {
  usePageMeta({
    title: 'Savoir — Méthodes de calcul mental',
    description:
      'Apprends les méthodes et astuces pour calculer de tête : additions, soustractions, multiplications, divisions, expliquées étape par étape.',
  })

  return (
    <div className="wrap">
      <h1 className="page-title">Savoir</h1>
      <p className="page-intro">
        Des méthodes simples pour apprendre à calculer de tête, opération par opération. Clique sur une carte pour
        voir l'explication complète, étape par étape.
      </p>

      <div className="savoir-sections">
        {OPERATIONS.map((operation) => (
          <section key={operation.key} className="savoir-section">
            <div className="savoir-section-head">
              <span className="op-badge" style={{ background: `var(${operation.colorVar})` }} aria-hidden="true">
                {operation.symbol}
              </span>
              <h2>{operation.label}</h2>
            </div>
            <div className="method-grid">
              {methodsByOperation(operation.key).map((method) => (
                <Link key={method.slug} to={`/savoir/${operation.key}/${method.slug}`} className="method-card">
                  <h3>{method.title}</h3>
                  <p className="method-tip">{method.shortTip}</p>
                  <p className="method-example">{method.shortExample}</p>
                  <span className="method-more">Voir la méthode en détail →</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
