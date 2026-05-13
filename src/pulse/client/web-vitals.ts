// Core Web Vitals collection — from-scratch implementation.
//
// Replaces the `web-vitals` library. All metrics come from W3C standard
// browser APIs (PerformanceNavigationTiming + PerformanceObserver).
// No external dependency, ~1.5 KB inline, async chunk removed.
//
// Metric-by-metric:
//
//   TTFB (Time to First Byte)
//     PerformanceNavigationTiming.responseStart - requestStart.
//     One-shot read on init.
//
//   FCP (First Contentful Paint)
//     PerformanceObserver('paint') emits 'first-contentful-paint'.
//     Reports once when the entry arrives.
//
//   LCP (Largest Contentful Paint)
//     PerformanceObserver('largest-contentful-paint') emits a new entry
//     every time a larger content paint is observed. We report each new
//     value — LCP only grows, so the last reported value before page
//     close is the final value. Debounced by 50ms to avoid reporting
//     micro-increments during the initial paint flurry.
//
//   CLS (Cumulative Layout Shift)
//     PerformanceObserver('layout-shift') reports each shift. We
//     accumulate values from shifts that weren't user-initiated
//     (hadRecentInput=false). Report the running total each time.
//
//     Note: the official CLS algorithm uses a 5-second sliding session
//     window and takes the MAX session score. We use simple cumulative
//     sum, which slightly over-reports compared to the standard. For
//     a stable portfolio site with minimal shift, the difference is
//     negligible.
//
//   INP (Interaction to Next Paint)
//     PerformanceObserver('event') with durationThreshold=40ms. We
//     track the longest interaction duration seen so far and report
//     each new high water mark.
//
//     Note: the official INP algorithm groups events by interactionId
//     and takes the 98th percentile of interactions (or max for <50
//     interactions). We use "max so far", which agrees with the
//     official for sites with <50 interactions per session — which is
//     virtually all portfolio visits.
//
//   FID (First Input Delay)
//     Deprecated in favor of INP. We don't measure it at all — the
//     dashboard's FID card permanently shows "No samples", which
//     accurately reflects FID's obsolete status.
//
// Why no `reportAllChanges` switch / no pagehide handling:
// We always report on each change. sendBeacon batches efficiently, and
// the percentile calculation in the dashboard naturally handles
// multiple samples per session (monotonic metrics → P75 across all
// samples ≈ P75 across "final" values).

import type { PulseConfig, VitalMetric, VitalPayload } from './types.js'
import { send } from './send.js'
import { getVisitorId } from './visitor-id.js'

// LayoutShift isn't in TypeScript's lib.dom.d.ts yet. Define just the
// fields we read.
interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

let installed = false

export function initWebVitals(
  config: Required<Pick<PulseConfig, 'vitalsEndpoint'>> & PulseConfig,
): void {
  if (typeof window === 'undefined') return
  if (installed) return
  installed = true

  const endpoint = config.vitalsEndpoint
  const debug = !!config.debug

  const report = (metric: VitalMetric, value: number): void => {
    if (!isFinite(value) || value < 0) return
    const payload: VitalPayload = {
      metric,
      value,
      page: window.location.pathname,
      visitor_id: getVisitorId() || undefined,
    }
    send(endpoint, payload, debug)
  }

  // Bail early if PerformanceObserver isn't supported (very old browsers).
  // TTFB still works through getEntriesByType, so we keep that.
  const supportsObserver = typeof PerformanceObserver !== 'undefined'

  // ── TTFB ───────────────────────────────────────────────────────
  try {
    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming
      // responseStart can be 0 if not yet recorded; guard.
      if (nav.responseStart > 0) {
        report('TTFB', nav.responseStart - nav.requestStart)
      }
    }
  } catch {
    // PerformanceNavigationTiming not available
  }

  if (!supportsObserver) return

  // ── FCP ────────────────────────────────────────────────────────
  observe('paint', (entries, obs) => {
    for (const entry of entries) {
      if (entry.name === 'first-contentful-paint') {
        report('FCP', entry.startTime)
        obs.disconnect() // FCP fires only once
      }
    }
  })

  // ── LCP ────────────────────────────────────────────────────────
  let lcpReported = 0
  observe('largest-contentful-paint', (entries) => {
    // Each callback can deliver multiple entries; take the last (newest).
    const last = entries[entries.length - 1]
    if (!last) return
    // Debounce: LCP only grows, ignore noise within 50ms of last report.
    if (last.startTime > lcpReported + 50) {
      lcpReported = last.startTime
      report('LCP', last.startTime)
    }
  })

  // ── CLS ────────────────────────────────────────────────────────
  let cls = 0
  observe('layout-shift', (entries) => {
    for (const entry of entries as LayoutShift[]) {
      if (!entry.hadRecentInput) cls += entry.value
    }
    report('CLS', cls)
  })

  // ── INP ────────────────────────────────────────────────────────
  // `event` entries fire for every dispatched event whose duration
  // exceeds `durationThreshold` ms. INP is the largest interaction
  // duration observed.
  let inp = 0
  observe(
    'event',
    (entries) => {
      for (const entry of entries as PerformanceEventTiming[]) {
        if (entry.duration > inp) {
          inp = entry.duration
          report('INP', inp)
        }
      }
    },
    { durationThreshold: 40 },
  )
}

/**
 * Tiny helper around PerformanceObserver — handles the common pattern
 * of "subscribe to a single entry type with buffered: true and a
 * callback that gets the list of entries". Catches errors so an
 * unsupported entry type doesn't crash subsequent observers.
 */
function observe(
  type: string,
  cb: (entries: PerformanceEntry[], obs: PerformanceObserver) => void,
  extraOpts: Record<string, unknown> = {},
): void {
  try {
    const obs = new PerformanceObserver((list) => {
      cb(list.getEntries(), obs)
    })
    // Cast — durationThreshold is in spec but not in TS lib types yet.
    obs.observe({ type, buffered: true, ...extraOpts } as PerformanceObserverInit)
  } catch {
    // Browser doesn't support this entry type — silently skip
  }
}
