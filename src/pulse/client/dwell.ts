// Dwell time tracking — how long was a visitor actually engaged with
// each page, measured as time-while-visible (background-tab time
// doesn't count).
//
// Implementation:
//   - Page enters: capture start, reset accumulator
//   - visibilitychange to hidden: accumulate elapsed visible time,
//     send a `time_on_page` event so we don't lose the data
//   - visibilitychange to visible: reset the "last active start" mark
//   - Heartbeat every 15s while visible: accumulate, send cumulative
//     active_ms as a checkpoint (survives hard browser closes that
//     skip pagehide)
//   - pagehide: final flush
//   - SPA route change: flush dwell for old page, start fresh on new
//
// Each event carries the cumulative active_ms for the page so far.
// Heartbeats overwrite earlier values from the same session+page —
// the dashboard takes MAX(active_ms) per (session_hash, page) so
// the final/latest value wins.
//
// Why heartbeat AND pagehide?
//   - pagehide is the official "page is going away" signal but doesn't
//     fire reliably on hard browser closes (alt-F4, app kill).
//   - 15s heartbeats give us a known floor on dwell even if pagehide
//     never fires.

import { track } from './core'

const HEARTBEAT_MS = 15_000
const MIN_REPORT_MS = 1_000 // Drop sub-second noise

let installed = false
let activeMs = 0
let lastActiveStart = 0
let currentPage = ''

export function initDwell(): void {
  if (typeof window === 'undefined' || installed) return
  installed = true

  startPage()

  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('pulse:locationchange', onRouteChange)
  window.addEventListener('pagehide', onPageHide)

  // Heartbeat checkpoint — fire-and-forget; we never need to clear it
  // for the lifetime of the page.
  setInterval(heartbeat, HEARTBEAT_MS)
}

function startPage(): void {
  activeMs = 0
  lastActiveStart = document.visibilityState === 'visible' ? performance.now() : 0
  currentPage = window.location.pathname
}

/**
 * Roll the "last active start" mark forward, adding the elapsed
 * visible time to the page's accumulator. If currently hidden, the
 * active start is cleared until the page becomes visible again.
 */
function accumulate(): void {
  if (lastActiveStart > 0) {
    const now = performance.now()
    activeMs += now - lastActiveStart
    lastActiveStart = document.visibilityState === 'visible' ? now : 0
  }
}

function onVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    accumulate()
    sendDwell()
  } else {
    // Becoming visible — start counting from now.
    lastActiveStart = performance.now()
  }
}

function onRouteChange(): void {
  // location.pathname has already changed by the time this fires;
  // flush the previous page's dwell before starting fresh.
  if (window.location.pathname === currentPage) return
  accumulate()
  sendDwell()
  startPage()
}

function onPageHide(): void {
  accumulate()
  sendDwell()
}

function heartbeat(): void {
  if (document.visibilityState !== 'visible') return
  accumulate()
  sendDwell()
}

function sendDwell(): void {
  const ms = Math.round(activeMs)
  if (ms < MIN_REPORT_MS) return
  // Pass page explicitly — by the time this fires the SPA may have
  // already navigated, so window.location.pathname would be wrong.
  track('time_on_page', { active_ms: ms }, { page: currentPage })
}
