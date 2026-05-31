// Lightweight Google Analytics 4 (gtag.js) integration.
// - Active only in production builds AND when VITE_GA_MEASUREMENT_ID is set.
// - Page views are sent manually on route change (this is a HashRouter SPA).

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
const ENABLED = Boolean(GA_ID) && import.meta.env.PROD

export function initAnalytics(): void {
  if (!ENABLED) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  // We send page_view ourselves on each route change, so disable the auto one.
  window.gtag('config', GA_ID, { send_page_view: false })
}

export function trackPageView(path: string): void {
  if (!ENABLED || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: normalizePath(path),
    page_title: document.title,
  })
}

// Collapse opaque record IDs so reports show routes, not individual records.
function normalizePath(path: string): string {
  return path.replace(/\/(circle|entity)\/[^/?#]+/g, '/$1/:id')
}
