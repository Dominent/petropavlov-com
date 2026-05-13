// Scroll milestone tracking for long-form content (case studies, blog
// posts, etc.).
//
// Fires a `scroll` event when the user has scrolled past 25%, 50%,
// 75%, and 100% of the page height. Each milestone fires once per
// route. The current-position calculation uses the documentElement
// scroll position vs. its total scrollable height.

import type { PulseConfig } from './types'
import { send } from './send'

const MILESTONES = [25, 50, 75, 100] as const

let installed = false
let routeMatchers: RegExp[] = []
let internalCfg: { endpoint: string; debug: boolean } | null = null
let firedThisRoute = new Set<number>()
let lastPath = ''

export function initScroll(
  config: Required<Pick<PulseConfig, 'endpoint'>> & PulseConfig,
): void {
  if (installed) return
  installed = true
  internalCfg = { endpoint: config.endpoint, debug: !!config.debug }
  routeMatchers = config.scrollRoutes || []

  // Listen for SPA route changes so we can reset the milestone set.
  window.addEventListener('pulse:locationchange', onRouteChange)

  // Initial route
  onRouteChange()

  // Throttled scroll listener. requestAnimationFrame is plenty for
  // tracking-purposes — we don't need 60Hz precision, we need to
  // catch the threshold crossing within a few hundred ms.
  let ticking = false
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        check()
        ticking = false
      })
    },
    { passive: true },
  )
}

function onRouteChange() {
  const path = window.location.pathname
  if (path === lastPath) return
  lastPath = path
  firedThisRoute.clear()
}

function shouldTrack(path: string): boolean {
  if (routeMatchers.length === 0) return false
  return routeMatchers.some((r) => r.test(path))
}

function check() {
  if (!internalCfg) return
  const path = window.location.pathname
  if (!shouldTrack(path)) return

  const doc = document.documentElement
  const scrolled = window.scrollY + window.innerHeight
  const total = doc.scrollHeight
  if (total <= window.innerHeight) return // Page doesn't scroll
  const pct = Math.min(100, Math.round((scrolled / total) * 100))

  for (const m of MILESTONES) {
    if (pct >= m && !firedThisRoute.has(m)) {
      firedThisRoute.add(m)
      send(
        internalCfg.endpoint,
        {
          event: 'scroll',
          page: path,
          props: { depth: m },
        },
        internalCfg.debug,
      )
    }
  }
}
