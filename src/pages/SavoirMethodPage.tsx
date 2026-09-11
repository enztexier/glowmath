import { Link, Navigate, useParams } from 'react-router-dom'
import { OPERATIONS, findMethod, methodsByOperation } from './savoir/methods'
import { usePageMeta } from '../hooks/usePageMeta'
import './SavoirMethodPage.css'

export default function SavoirMethodPage() {
  const { operationKey, slug } = useParams<{ operationKey: string; slug: string }>()
  const operation = OPERATIONS.find((op) => op.key === operationKey)
  const method = operation && slug ? findMethod(operation.key, slug) : undefined

  usePageMeta(
    method
      ? { title: `${method.title} — ${operation!.label}`, description: method.shortTip }
      : { title: 'Méthode introuvable', noindex: true },
  )

  if (!operation || !method) {
    return <Navigate to="/savoir" replace />
  }

  const siblings = methodsByOperation(operation.key)

  return (
    <div className="wrap">
      <Link to="/savoir" className="back-link">
        ← Savoir
      </Link>

      <div className="method-detail-head">
        <span className="op-badge" style={{ background: `var(${operation.colorVar})` }} aria-hidden="true">
          {operation.symbol}
        </span>
        <div>
          <div className="method-detail-op">{operation.label}</div>
          <h1 className="method-detail-title">{method.title}</h1>
        </div>
      </div>

      <p className="method-detail-intro">{method.intro}</p>

      <section className="method-detail-section">
        <h2>Comment faire</h2>
        <ol className="method-steps">
          {method.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="method-detail-section">
        <h2>Exemples pas à pas</h2>
        <div className="method-examples">
          {method.examples.map((example) => (
            <div key={example.problem} className="method-example-card">
              <div className="method-example-problem">{example.problem}</div>
              <ol className="method-example-steps">
                {example.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="method-example-result">
                Résultat : <strong>{example.result}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="method-detail-section">
        <h2>Astuces</h2>
        <ul className="method-tips">
          {method.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      <div className="method-practice-cta">
        <p>Prêt à t'entraîner ?</p>
        <Link to="/config" className="method-practice-btn">
          Lancer une session {operation.label.toLowerCase()} →
        </Link>
      </div>

      {siblings.length > 1 && (
        <section className="method-detail-section">
          <h2>Autres méthodes pour {operation.label.toLowerCase()}</h2>
          <div className="method-siblings">
            {siblings
              .filter((sibling) => sibling.slug !== method.slug)
              .map((sibling) => (
                <Link key={sibling.slug} to={`/savoir/${operation.key}/${sibling.slug}`} className="method-sibling-card">
                  {sibling.title}
                </Link>
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
