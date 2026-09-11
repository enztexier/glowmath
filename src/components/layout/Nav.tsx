import { useLayoutEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTheme } from '../../theme/ThemeContext'
import './Nav.css'

function linkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'active' : ''
}

interface NavLinksProps {
  onNavigate?: () => void
  onLinkHover?: (event: MouseEvent<HTMLElement>) => void
}

function NavLinks({ onNavigate, onLinkHover }: NavLinksProps) {
  return (
    <>
      <NavLink to="/savoir" className={linkClassName} onClick={onNavigate} onMouseEnter={onLinkHover}>
        Savoir
      </NavLink>
      <NavLink to="/modes" className={linkClassName} onClick={onNavigate} onMouseEnter={onLinkHover}>
        S'entraîner
      </NavLink>
      <NavLink to="/scolaire" className={linkClassName} onClick={onNavigate} onMouseEnter={onLinkHover}>
        Scolaire
      </NavLink>
      <NavLink to="/config" className={linkClassName} onClick={onNavigate} onMouseEnter={onLinkHover}>
        Personnalisé
      </NavLink>
      <NavLink to="/tables" className={linkClassName} onClick={onNavigate} onMouseEnter={onLinkHover}>
        Tables
      </NavLink>
    </>
  )
}

interface PillRect {
  left: number
  width: number
}

export default function Nav() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pillRect, setPillRect] = useState<PillRect | null>(null)
  const navLinksRef = useRef<HTMLDivElement>(null)

  function measureActiveLink() {
    const activeEl = navLinksRef.current?.querySelector<HTMLElement>('a.active')
    setPillRect(activeEl ? { left: activeEl.offsetLeft, width: activeEl.offsetWidth } : null)
  }

  useLayoutEffect(() => {
    measureActiveLink()
    window.addEventListener('resize', measureActiveLink)
    return () => window.removeEventListener('resize', measureActiveLink)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search])

  function handleLinkHover(event: MouseEvent<HTMLElement>) {
    const el = event.currentTarget
    setPillRect({ left: el.offsetLeft, width: el.offsetWidth })
  }

  return (
    <div className="nav-shell">
      <nav className="top">
        <Link to="/" className="logo">
          GLOW
          <br />
          MATH
        </Link>
        <div className="nav-links" ref={navLinksRef} onMouseLeave={measureActiveLink}>
          <span
            className="nav-hover-pill"
            aria-hidden="true"
            style={{
              transform: `translateX(${pillRect?.left ?? 0}px)`,
              width: pillRect ? `${pillRect.width}px` : 0,
              opacity: pillRect ? 1 : 0,
            }}
          />
          <NavLinks onLinkHover={handleLinkHover} />
        </div>
        <div className="nav-right">
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          <Link to="/connexion" className="icon-btn" aria-label="Compte">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </Link>
          <button
            type="button"
            className="burger-btn"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <NavLinks onNavigate={() => setMobileOpen(false)} />
      </div>
    </div>
  )
}
