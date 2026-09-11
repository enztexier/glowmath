import { useEffect, useState } from 'react'
import './SplashScreen.css'

const VISIBLE_MS = 1100
const SPLIT_MS = 650

interface SplashScreenProps {
  onFinish: () => void
}

function SplashContent() {
  return (
    <div className="splash-content">
      <div className="splash-title">GLOW MATH</div>
      <div className="splash-bar-track">
        <div className="splash-bar-fill" />
      </div>
    </div>
  )
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const hideTimer = window.setTimeout(() => setHidden(true), VISIBLE_MS)
    const removeTimer = window.setTimeout(onFinish, VISIBLE_MS + SPLIT_MS)
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(removeTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`splash-overlay${hidden ? ' hidden' : ''}`} aria-hidden="true">
      <div className="splash-half splash-top">
        <SplashContent />
      </div>
      <div className="splash-half splash-bottom">
        <SplashContent />
      </div>
    </div>
  )
}
