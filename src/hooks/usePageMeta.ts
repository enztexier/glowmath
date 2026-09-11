import { useEffect } from 'react'

const SITE_URL = 'https://glow-math.com'
const DEFAULT_TITLE = 'GlowMath — Calcul mental en ligne, gratuit et personnalisable'
const DEFAULT_DESCRIPTION = 'Calcul mental pour tous, table de multiplication & bien plus encore.'

interface PageMetaOptions {
  /** Page-specific title. Rendered as "{title} — GlowMath". Omit to use the site default. */
  title?: string
  /** Page-specific description for meta/OG/Twitter tags. Omit to use the site default. */
  description?: string
  /** Set true for transient/stateful pages (session runner, results, 404) that shouldn't be indexed. */
  noindex?: boolean
}

function setMetaContent(selector: string, attribute: string, value: string) {
  const el = document.head.querySelector(selector)
  if (el) el.setAttribute(attribute, value)
}

export function usePageMeta({ title, description, noindex = false }: PageMetaOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — GlowMath` : DEFAULT_TITLE
    const fullDescription = description ?? DEFAULT_DESCRIPTION
    const url = `${SITE_URL}${window.location.pathname}`

    document.title = fullTitle
    setMetaContent('meta[name="description"]', 'content', fullDescription)
    setMetaContent('meta[name="robots"]', 'content', noindex ? 'noindex, nofollow' : 'index, follow')
    setMetaContent('link[rel="canonical"]', 'href', url)

    setMetaContent('meta[property="og:title"]', 'content', fullTitle)
    setMetaContent('meta[property="og:description"]', 'content', fullDescription)
    setMetaContent('meta[property="og:url"]', 'content', url)

    setMetaContent('meta[name="twitter:title"]', 'content', fullTitle)
    setMetaContent('meta[name="twitter:description"]', 'content', fullDescription)
  }, [title, description, noindex])
}
