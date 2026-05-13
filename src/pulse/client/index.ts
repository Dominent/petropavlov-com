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

import type { PulseConfig } from './types.js'
import { setConfig, track } from './core.js'
import { initPageViews } from './page-views.js'
import { initWebVitals } from './web-vitals.js'
import { initOutbound } from './outbound.js'
import { initScroll } from './scroll.js'
import { initSections } from './sections.js'
import { initErrors } from './errors.js'
import { initDwell } from './dwell.js'

export type {
  EventPayload,
  EventType,
  PulseConfig,
  SectionConfig,
  VitalMetric,
  VitalPayload,
} from './types.js'
export { track } from './core.js'
export { initPageViews } from './page-views.js'
export { initWebVitals } from './web-vitals.js'
export { initOutbound } from './outbound.js'
export { initScroll } from './scroll.js'
export { initSections } from './sections.js'
export { initErrors } from './errors.js'
export { initDwell } from './dwell.js'
export { getVisitorId, clearVisitorId } from './visitor-id.js'

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

  initPageViews(resolved)
  initWebVitals(resolved)
  initOutbound(resolved)
  initDwell()
  if (resolved.scrollRoutes.length > 0) initScroll(resolved)
  if (resolved.sections.length > 0) initSections(resolved.sections)
  if (resolved.errors) initErrors()
}

// Track is re-exported above; this re-declaration helps tools that
// don't follow re-exports see it as a top-level binding.
export { track as _track }
void track // keep linker from complaining if it tree-shakes the import
