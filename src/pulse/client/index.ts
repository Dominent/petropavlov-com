// Pulse — privacy-first, GDPR-clean web analytics.
//
// Public client-side API. Call init() once at app boot, then track()
// from anywhere in your app. The library handles page views, web
// vitals, outbound clicks, optional scroll milestones, optional
// IntersectionObserver-based section tracking, and optional global JS
// error capture.
//
// Example:
//
//   import { init, track } from './pulse/client'
//
//   init({
//     endpoint: '/api/track',
//     vitalsEndpoint: '/api/track-vitals',
//     scrollRoutes: [/^\/case-studies\//],
//     sections: [{ id: 'hero' }, { id: 'work' }, { id: 'contact' }],
//     errors: true,
//     debug: import.meta.env.DEV,
//   })
//
//   // Then anywhere in your app:
//   track('contact_open')
//   track('contact_submit', { email_domain: 'company.com' })

import type { PulseConfig } from './types'
import { setConfig, track } from './core'
import { initPageViews } from './page-views'
import { initWebVitals } from './web-vitals'
import { initOutbound } from './outbound'
import { initScroll } from './scroll'
import { initSections } from './sections'
import { initErrors } from './errors'
import { initDwell } from './dwell'
import { initClicks } from './clicks'

export type {
  EventPayload,
  EventType,
  PulseConfig,
  SectionConfig,
  VitalMetric,
  VitalPayload,
} from './types'
export { track } from './core'
export { initPageViews } from './page-views'
export { initWebVitals } from './web-vitals'
export { initOutbound } from './outbound'
export { initScroll } from './scroll'
export { initSections } from './sections'
export { initErrors } from './errors'
export { initDwell } from './dwell'
export { initClicks } from './clicks'
export { getVisitorId, clearVisitorId } from './visitor-id'

/**
 * Initialize Pulse. Call once at app boot.
 *
 * With `autoTrack: true` (default), this wires up:
 *   - Page-view tracking on every history change
 *   - Core Web Vitals reporting
 *   - Outbound link click tracking
 *   - Scroll milestones (only if `scrollRoutes` is non-empty)
 *   - Section view events (only if `sections` is non-empty)
 *   - Global JS error capture (only if `errors: true`)
 *
 * If you need fine-grained control, pass `autoTrack: false` and call
 * the individual `init*()` functions yourself.
 */
export function init(config: PulseConfig = {}): void {
  if (typeof window === 'undefined') return // SSR no-op

  const resolved = {
    endpoint: config.endpoint || '/api/track',
    vitalsEndpoint: config.vitalsEndpoint || '/api/track-vitals',
    autoTrack: config.autoTrack !== false,
    scrollRoutes: config.scrollRoutes || [],
    internalHosts: config.internalHosts,
    sections: config.sections || [],
    errors: !!config.errors,
    debug: !!config.debug,
  }
  setConfig(resolved)

  if (!resolved.autoTrack) return

  // ── Critical (eager) ───────────────────────────────────────────
  // These must fire before first paint to catch FCP/LCP/the initial
  // `view` event, and to install global error handlers in time to
  // catch startup exceptions.
  initPageViews(resolved)
  initWebVitals(resolved)
  if (resolved.errors) initErrors()

  // ── Deferred (idle) ────────────────────────────────────────────
  // Listeners for clicks, scroll milestones, section visibility, and
  // outbound links — none of these matter in the first ~1-2s of page
  // life. Pushing them to requestIdleCallback frees the main thread
  // for the hero render. We use a 2s timeout so they're guaranteed
  // to run even if the browser stays busy.
  const idle = (cb: () => void): void => {
    if (typeof (window as { requestIdleCallback?: unknown }).requestIdleCallback === 'function') {
      ;(window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number })
        .requestIdleCallback(cb, { timeout: 2000 })
    } else {
      // Safari < 17 / older browsers — fall back to a short setTimeout
      setTimeout(cb, 1000)
    }
  }
  idle(() => {
    initOutbound(resolved)
    initDwell()
    initClicks()
    if (resolved.scrollRoutes.length > 0) initScroll(resolved)
    if (resolved.sections.length > 0) initSections(resolved.sections)
  })
}

// Track is re-exported above; this re-declaration helps tools that
// don't follow re-exports see it as a top-level binding.
export { track as _track }
void track // keep linker from complaining if it tree-shakes the import
