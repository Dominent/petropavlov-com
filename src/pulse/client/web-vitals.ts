// Core Web Vitals — from-scratch implementation with SPA-route support.
//
// Each route (initial OR soft-navigation) gets its own per-route state.
// Metrics are computed relative to the route's start time, not the
// page's navigationStart. So `/case-studies/X` LCP reflects how long
// the case study took to paint, not "time since the visitor first
// arrived at the site".
//
// State transitions
// ─────────────────
//   Initial load    routeStartTime = 0 (= navigationStart, the
//                   timeOrigin for performance.now()).
//   Soft navigation routeStartTime = performance.now() at the
//                   `pulse:locationchange` event. lcpReported / cls /
//                   inp reset to 0. currentPage updated. Double-rAF
//                   soft-FCP scheduled.
//
// Per-metric behavior
// ───────────────────
//   TTFB  Initial load only. No analog for soft routes — no HTTP
//         request happens during a client-side route change.
//   FCP   Initial load: from PerformancePaintTiming's
//         `first-contentful-paint` entry.
//         Soft routes: approximated via double-requestAnimationFrame.
//         After two animation frames the browser has flushed pending
//         paints at least once; `performance.now() - routeStartTime`
//         is then a reasonable lower-bound on "time to first paint of
//         the new route's content".
//   LCP   Observed continuously. Entries before routeStartTime are
//         ignored (they belong to a previous route). Reported value
//         is `entry.startTime - routeStartTime`.
//   CLS   Cumulative sum of shifts since current route started.
//         Shifts before routeStartTime are ignored.
//   INP   Max interaction duration since current route started.
//         Interactions before routeStartTime are ignored.
//   FID   Deprecated — we don't emit it. The dashboard's FID card
//         permanently shows "No samples", which accurately reflects
//         FID's obsolete status.
//
// Important: report payloads use `currentPage` (tracked here) rather
// than `window.location.pathname`. An observer callback can fire
// mid-navigation, when `location.pathname` has already changed but
// our `pulse:locationchange` handler hasn't run yet. Using the locally
// tracked `currentPage` avoids that race.
//
// Algorithmic simplifications still apply (CLS as cumulative sum
// rather than sliding-window-max; INP as max rather than 98th
// percentile of interactions). For a portfolio with <50 interactions
// per session these match the spec to within rounding.
//
// Browser support
// ───────────────
//   PerformanceObserver itself is universal in modern browsers
//   (Chrome 52+, Firefox 57+, Safari 11+, Edge 79+). The per-entry-type
//   support varies, though, and that's where the dashboard data ends
//   up Chromium-biased:
//
//     paint                       Chrome 60+, Firefox 89+, Safari 16.4+
//     largest-contentful-paint    Chromium-only (Chrome/Edge 77+).
//                                 Safari and Firefox do NOT fire it.
//     layout-shift                Chromium-only.
//     event                       Chrome 76+, Edge 79+, Safari 16.4+.
//                                 Firefox does NOT fire it.
//
//   navigation timing (TTFB):
//     getEntriesByType('navigation') is in Chrome 57+ / Firefox 58+
//     / Safari 15+. Older Safari has the legacy `performance.timing`
//     API we don't read.
//
//   Practical effect:
//     - Modern Chromium  full set of metrics (TTFB, FCP, LCP, CLS, INP)
//     - Modern Safari    TTFB, FCP (initial + soft-FCP via rAF), INP
//     - Modern Firefox   TTFB, FCP (initial + soft-FCP), no LCP/CLS/INP
//     - Older browsers   Whatever subset their APIs expose; the
//                        rest silently no-op via the try/catch in
//                        `observe()` and the TTFB block.
//
//   Soft-FCP (via double-rAF) works in every browser that supports
//   `requestAnimationFrame`, which is universal — so even Safari and
//   Firefox visitors contribute SPA-route paint timing.
//
//   The dashboard's LCP/CLS/INP samples are therefore biased toward
//   Chromium traffic. This is a property of the Web Vitals APIs
//   themselves and is consistent with how every other web-vitals tool
//   (Vercel, Plausible, Google's own web-vitals library) reports.

import type { PulseConfig, VitalMetric, VitalPayload } from './types'
import { send } from './send'
import { getVisitorId } from './visitor-id'
import { track } from './core'

interface LayoutShift extends PerformanceEntry {
  value: number
  hadRecentInput: boolean
}

let installed = false
let routeStartTime = 0
let currentPage = ''
let lcpReported = 0
let cls = 0
let inp = 0

// First time the tab transitioned to `hidden` since the current
// route's startTime. While the tab is fully visible from route start
// onward, this stays Infinity and LCP entries are accepted normally.
// Once the tab is hidden — including the "loaded into a background
// tab" case where it's hidden at script start — any LCP entry that
// fires after the hidden moment gets dropped, because its value
// reflects how long the browser deferred paint, not real performance.
//
// This is the algorithm Google's web-vitals library uses for the
// same reason. Without it, a single visitor opening a link in a
// background tab can record a 20-40 second "LCP" that dominates the
// P75/P95 for an entire country bucket. See the LCP outlier analysis
// in the speed dashboard: every >10s LCP we've recorded was at
// 01:48-04:54 UTC — classic late-night background-tab pattern.
let firstHiddenTime = Infinity

export function initWebVitals(
  config: Required<Pick<PulseConfig, 'vitalsEndpoint'>> & PulseConfig,
): void {
  if (typeof window === 'undefined' || installed) return
  installed = true

  const endpoint = config.vitalsEndpoint
  const debug = !!config.debug
  currentPage = window.location.pathname

  // Initialise firstHiddenTime based on the tab's state at script load.
  // If the page started in a background tab, hidden time is 0 (route
  // start), so every LCP that fires later will be filtered. If the tab
  // is visible at load, hidden time stays Infinity until something
  // changes.
  firstHiddenTime =
    typeof document !== 'undefined' && document.visibilityState === 'hidden'
      ? 0
      : Infinity
  if (typeof document !== 'undefined') {
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'hidden') {
          firstHiddenTime = Math.min(firstHiddenTime, performance.now())
        }
      },
      { capture: true },
    )
  }

  const report = (metric: VitalMetric, value: number): void => {
    if (!isFinite(value) || value < 0) return
    const payload: VitalPayload = {
      metric,
      value,
      // Use the locally-tracked currentPage, not window.location.pathname,
      // so async observer callbacks during navigation can't attribute a
      // metric to the wrong page.
      page: currentPage,
      visitor_id: getVisitorId() || undefined,
    }
    send(endpoint, payload, debug)
  }

  // SPA route changes — fired by page-views.ts after history.pushState
  // / replaceState / popstate.
  window.addEventListener('pulse:locationchange', () => {
    // Same path = not a real navigation (replaceState with identical URL,
    // hash-only change, etc.). Skip — we'd otherwise double-report.
    if (window.location.pathname === currentPage) return

    routeStartTime = performance.now()
    currentPage = window.location.pathname
    lcpReported = 0
    cls = 0
    inp = 0
    // Reset hidden tracking for the new route. If the tab is currently
    // hidden at the moment of navigation, count it as hidden from the
    // route's start; otherwise wait for the next visibilitychange.
    firstHiddenTime =
      document.visibilityState === 'hidden' ? routeStartTime : Infinity

    // Soft-FCP approximation. Double-rAF is the established idiom for
    // "wait until the browser has actually painted at least once" — by
    // the second rAF callback the browser has flushed paint commands.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const softFcp = performance.now() - routeStartTime
        // Clamp to a sane range — values above 30s usually mean the
        // tab was backgrounded mid-navigation, which makes the timing
        // meaningless.
        if (softFcp > 0 && softFcp < 30_000) report('FCP', softFcp)
      })
    })
  })

  // ── TTFB ───────────────────────────────────────────────────────
  // Initial load only.
  try {
    const navEntries = performance.getEntriesByType('navigation')
    if (navEntries.length > 0) {
      const nav = navEntries[0] as PerformanceNavigationTiming
      if (nav.responseStart > 0) {
        report('TTFB', nav.responseStart - nav.requestStart)
      }
    }
  } catch {
    // PerformanceNavigationTiming unavailable
  }

  if (typeof PerformanceObserver === 'undefined') return

  // ── FCP ────────────────────────────────────────────────────────
  // Initial paint only. Observer auto-disconnects after the entry
  // fires (FCP can only happen once per document). Soft routes use
  // the double-rAF approximation scheduled in onRouteChange.
  observe('paint', (entries, obs) => {
    for (const entry of entries) {
      if (entry.name === 'first-contentful-paint') {
        report('FCP', entry.startTime)
        obs.disconnect()
      }
    }
  })

  // ── LCP ────────────────────────────────────────────────────────
  // Observe continuously; report values relative to the current
  // route's start. Entries from earlier routes are dropped.
  observe('largest-contentful-paint', (entries) => {
    const last = entries[entries.length - 1]
    if (!last) return
    if (last.startTime < routeStartTime) return // belongs to a previous route
    // Drop entries that fire AFTER the tab was first hidden — these
    // are the backgrounded-tab artifacts (20-40s "LCP") that poison
    // the dashboard's P75/P95. See firstHiddenTime declaration above.
    if (last.startTime > firstHiddenTime) return
    const value = last.startTime - routeStartTime
    // Debounce noisy micro-increments during the initial paint flurry.
    if (value > lcpReported + 50) {
      lcpReported = value
      report('LCP', value)
    }
  })

  // ── CLS ────────────────────────────────────────────────────────
  // Accumulate shifts that happen after routeStartTime and aren't
  // user-initiated.
  observe('layout-shift', (entries) => {
    for (const entry of entries as LayoutShift[]) {
      if (entry.hadRecentInput) continue
      if (entry.startTime < routeStartTime) continue
      cls += entry.value
    }
    report('CLS', cls)
  })

  // ── INP ────────────────────────────────────────────────────────
  // Track the longest interaction since routeStartTime. When we set
  // a new INP high water mark, ALSO fire an `inp_detail` event with
  // diagnostic info about which interaction caused it — answers the
  // "which click is slow?" question that's invisible from the aggregate
  // INP number alone.
  //
  // We filter `entry.name` to the actual interaction events INP is
  // defined over (click/tap/key). Hover-style events like pointerover,
  // pointerout, mouseover, mouseleave, mousemove also show up in the
  // `event` Performance Timing API but they are NOT interactions in
  // the INP sense — letting them through pollutes the metric with
  // animation-on-hover work that doesn't actually delay user input.
  const INP_EVENT_NAMES = new Set([
    'click',
    'pointerdown',
    'pointerup',
    'mousedown',
    'mouseup',
    'touchstart',
    'touchend',
    'keydown',
    'keyup',
    'contextmenu',
  ])
  observe(
    'event',
    (entries) => {
      for (const entry of entries as PerformanceEventTiming[]) {
        if (entry.startTime < routeStartTime) continue
        if (!INP_EVENT_NAMES.has(entry.name)) continue
        if (entry.duration > inp) {
          inp = entry.duration
          report('INP', inp)

          // Diagnostic event — lands in analytics_events so we can
          // group by target_tag / target_text / event_name.
          const target = entry.target as HTMLElement | null
          const props: Record<string, unknown> = {
            value: Math.round(entry.duration),
            event_name: entry.name, // 'click' | 'pointerdown' | 'keydown' | etc.
          }
          if (target && typeof target.tagName === 'string') {
            props.target_tag = target.tagName.toLowerCase()
            if (target.id) props.target_id = target.id
            const text = (target.textContent || '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 60)
            if (text) props.target_text = text
          }
          track('inp_detail', props)
        }
      }
    },
    { durationThreshold: 40 },
  )
}

/**
 * Tiny PerformanceObserver helper — handles the common "subscribe to
 * one entry type with buffered: true and a callback" pattern. Swallows
 * errors so an unsupported entry type doesn't bring down siblings.
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
    // durationThreshold (for 'event') is in spec but not yet in TS
    // PerformanceObserverInit; cast through unknown to silence the
    // type checker without losing the type elsewhere.
    obs.observe({ type, buffered: true, ...extraOpts } as PerformanceObserverInit)
  } catch {
    // Entry type not supported by this browser — silently skip
  }
}
