import { useState } from 'react'
import './SessionIntro.css'

const INTRO_WORDS = ["C'est parti !", 'Go !', 'À toi de jouer !', 'En piste !', 'On y va !', '3, 2, 1...', 'Prêt ?', 'Allez !']

interface SessionIntroProps {
  onStart: () => void
}

function SessionIntroContent({ word }: { word: string }) {
  return (
    <div className="session-intro-content">
      <div className="session-intro-word">{word}</div>
      <div className="session-intro-hint">Touche l'écran pour commencer</div>
    </div>
  )
}

export default function SessionIntro({ onStart }: SessionIntroProps) {
  const [word] = useState(() => INTRO_WORDS[Math.floor(Math.random() * INTRO_WORDS.length)])
  const [leaving, setLeaving] = useState(false)

  function handleStart() {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(onStart, 350)
  }

  return (
    <div
      className={`session-intro${leaving ? ' leaving' : ''}`}
      onClick={handleStart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleStart()
      }}
      aria-label="Commencer la série"
    >
      <div className="session-intro-half session-intro-top">
        <SessionIntroContent word={word} />
      </div>
      <div className="session-intro-half session-intro-bottom">
        <SessionIntroContent word={word} />
      </div>
    </div>
  )
}
