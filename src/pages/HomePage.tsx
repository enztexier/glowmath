import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Operation, SessionConfig } from '../engine/types'
import { createDefaultConfig } from '../engine/defaultConfig'
import { difficultyPresets } from '../engine/presets'
import SplashScreen from '../components/SplashScreen'
import { usePageMeta } from '../hooks/usePageMeta'
import './HomePage.css'

const FAST_OPERATIONS: Operation[] = ['addition', 'subtraction']

function buildFastConfig(): SessionConfig {
  const base = createDefaultConfig()
  return {
    ...base,
    name: 'Mode Fast',
    operations: FAST_OPERATIONS,
    numberTypes: difficultyPresets.easy.numberTypes,
    difficulty: difficultyPresets.easy.difficulty,
    session: { mode: 'fixedCount', questionCount: 10 },
  }
}

export default function HomePage() {
  usePageMeta()
  const [showSplash, setShowSplash] = useState(true)

  return (
    <div className="card">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="home-grid">
        <div className="home-left">
          <Link to="/session" state={{ config: buildFastConfig() }} className="hero-visual">
            <div className="eq-visual-texture" aria-hidden="true" />
            <div className="eq-display" aria-hidden="true">
              <span className="big">37</span>
              <span className="op">+</span>
              <span className="big">15</span>
            </div>
            <span className="shop-badge">
              COMMENCER
              <br />
              UNE SÉRIE
            </span>
            <span className="hero-visual-tag">MODE FAST</span>
          </Link>

          <div className="strip-cards">
            <Link to="/modes" className="mini-card tone-a">
              <div className="num" aria-hidden="true">
                ✦
              </div>
              <span className="mini-card-label">MODE THÉMATIQUE</span>
            </Link>
            <Link to="/scolaire" className="mini-card tone-b">
              <div className="num" aria-hidden="true">
                ▤
              </div>
              <span className="mini-card-label">MODE SCOLAIRE</span>
            </Link>
          </div>
        </div>

        <Link to="/config" className="hero-text strip-cta home-right">
          <h1 className="hero-title">
            PERSONNALISE
            <br />
            TON MODE
            <span className="arrow" aria-hidden="true">
              <svg width="42" height="18" viewBox="0 0 42 18" fill="none">
                <path d="M0 9H40M40 9L32 1M40 9L32 17" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </span>
          </h1>
          <p className="hero-subtitle">CALCUL MENTAL</p>
          <p className="hero-desc">
            Des exercices de calcul mental adaptés à ton niveau : choisis une opération, une difficulté et un format
            de session, puis entraîne-toi à ton rythme.
          </p>
        </Link>
      </div>
    </div>
  )
}
