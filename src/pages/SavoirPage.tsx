import { Link } from 'react-router-dom'
import { OPERATIONS, methodsByOperation } from './savoir/methods'
import { usePageMeta } from '../hooks/usePageMeta'
import './SavoirPage.css'

const DAILY_USES = [
  'Vérifier un rendu de monnaie avant de quitter la caisse',
  'Estimer un budget de courses pendant que tu remplis le chariot',
  'Calculer un pourboire ou partager une addition entre amis',
  'Comparer deux prix au supermarché (le plus gros paquet n\'est pas toujours le meilleur prix)',
  'Ajuster une recette de cuisine pour plus ou moins de convives',
]

const MINI_EXAMPLES = [
  { problem: '8 + 5', trick: '8 est à 2 de 10, donc 10 + 3', result: '13' },
  { problem: '47 + 30', trick: 'Ajoute juste 3 dizaines à 47', result: '77' },
  { problem: '9 × 2', trick: 'Double 9, comme deux fois la même chose', result: '18' },
  { problem: '100 − 3', trick: 'Juste avant 100 : compte à rebours', result: '97' },
]

export default function SavoirPage() {
  usePageMeta({
    title: 'Savoir — Méthodes de calcul mental',
    description:
      'Apprends les méthodes et astuces pour calculer de tête : additions, soustractions, multiplications, divisions, expliquées étape par étape.',
  })

  return (
    <div className="wrap">
      <section className="manifesto">
        <h1 className="manifesto-title">
          Le calcul mental n'est pas
          <br />
          un don.
          <br />
          C'est une méthode.
        </h1>
        <p className="manifesto-lead">
          Tu n'es pas « nul en maths » ou « doué en maths ». Tu connais des méthodes, ou tu ne les connais pas
          encore. La bonne nouvelle, c'est que ça s'apprend — à n'importe quel âge, à ton rythme. Cette page
          t'explique comment.
        </p>

        <div className="manifesto-theses">
          <article className="manifesto-thesis">
            <span className="thesis-number" aria-hidden="true">
              01
            </span>
            <h2>À quoi ça sert, vraiment ?</h2>
            <p>
              Ce n'est pas une question d'école. C'est une question de vie quotidienne — la capacité à juger un
              ordre de grandeur sans sortir son téléphone, à repérer une erreur avant qu'elle ne coûte cher, à
              garder le contrôle sur les chiffres qui nous entourent. Par exemple, tu t'en sers pour :
            </p>
            <ul className="thesis-list">
              {DAILY_USES.map((use) => (
                <li key={use}>{use}</li>
              ))}
            </ul>
          </article>

          <article className="manifesto-thesis">
            <span className="thesis-number" aria-hidden="true">
              02
            </span>
            <h2>Pour tout le monde, à tout âge</h2>
            <p>
              Un enfant qui apprend ses tables construit les bases de tout son raisonnement mathématique futur. Un
              adulte qui calcule de tête au quotidien garde une longueur d'avance sur ses finances. Une personne
              âgée qui pratique régulièrement entretient sa mémoire et son agilité mentale — le calcul mental est
              l'un des meilleurs exercices cognitifs qui soient, à tout âge.
            </p>
            <p>
              C'est aussi bon pour la santé : comme la lecture ou les mots croisés, le calcul mental fait travailler
              la mémoire et la concentration, sans matériel ni abonnement — un vrai exercice pour le cerveau, à
              n'importe quel âge. Et au quotidien, c'est une vraie indépendance : tu vérifies toi-même, tu réponds
              vite, et tu évites de te faire avoir — sur un rendu de monnaie, une remise mal calculée, un prix au
              kilo trompeur. Personne ne peut te la faire deux fois.
            </p>
            <p className="thesis-emphasis">
              Il n'existe pas de « bosse des maths ». Juste des méthodes que personne ne t'a encore montrées —
              comme n'importe quelle compétence, ça se muscle et ça s'améliore avec la pratique. Répète-les
              quelques fois, et elles deviennent naturelles : tu ne les « appliqueras » plus, tu les feras, sans y
              penser. C'est tout l'objet de cette page.
            </p>
          </article>

          <article className="manifesto-thesis">
            <span className="thesis-number" aria-hidden="true">
              03
            </span>
            <h2>Une histoire millénaire</h2>
            <p>
              Le calcul mental précède de loin les mathématiques telles qu'on les enseigne aujourd'hui. Il y a plus
              de 4000 ans, les scribes égyptiens et les marchands babyloniens utilisaient déjà des techniques de
              décomposition proches de celles enseignées plus bas sur cette page — bien avant l'invention du zéro
              ou de l'écriture décimale que nous connaissons. En Inde, des méthodes de calcul rapide circulaient
              depuis l'Antiquité, transmises oralement de génération en génération. Longtemps, calculer de tête
              n'était pas une option parmi d'autres : c'était la seule façon de compter, bien avant le papier, le
              boulier ou la calculatrice.
            </p>
            <p className="thesis-emphasis">
              Ces techniques n'ont rien de magique : elles reposent toutes sur la même idée, que cette page te
              propose d'explorer — décomposer un problème pour le rendre plus simple.
            </p>
          </article>

          <article className="manifesto-thesis">
            <span className="thesis-number" aria-hidden="true">
              04
            </span>
            <h2>Essaie, tout de suite</h2>
            <p>Pas besoin d'attendre d'avoir lu toute la page. Regarde :</p>
            <ol className="thesis-steps">
              <li>9 + 6. Le 9 est juste à 1 de 10 — le nombre le plus simple qui existe.</li>
              <li>On emprunte ce 1 au 6. Il ne reste que 5.</li>
              <li>10 + 5 = 15. Voilà, c'est fini.</li>
            </ol>
            <div className="thesis-result">
              9 + 6 = <strong>15</strong> — trouvé sans compter sur tes doigts.
            </div>

            <p>Et ce n'est pas un coup de chance. Regarde encore :</p>
            <div className="thesis-mini-examples">
              {MINI_EXAMPLES.map((example) => (
                <div key={example.problem} className="thesis-mini-example">
                  <span className="mini-example-problem">{example.problem}</span>
                  <span className="mini-example-trick">{example.trick}</span>
                  <span className="mini-example-result">= {example.result}</span>
                </div>
              ))}
            </div>

            <p>
              C'est tout. Tu viens d'utiliser exactement la même idée que les marchands babyloniens il y a 3000
              ans : transformer un calcul compliqué en un calcul évident. Les méthodes ci-dessous t'apprennent à
              repérer ce genre de raccourci pour chaque opération — à ton rythme, une à la fois.
            </p>

            <div className="thesis-cta">
              <p className="thesis-cta-text">
                Prêt à essayer avec de vraies questions ? On commence tout doucement : 10 additions et
                soustractions faciles, une par une, avec la correction expliquée juste après chaque réponse — pour
                comprendre, pas juste pour deviner.
              </p>
              <Link to="/modes/premiers-pas" className="thesis-cta-btn">
                Lancer une série →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <div className="savoir-practice">
        <h2 className="practice-title">Les méthodes, en pratique</h2>
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
    </div>
  )
}
