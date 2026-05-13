// Global JS error capture.
//
// Listens for:
//   - `error` events (uncaught exceptions, including async errors that
//      bubble to window)
//   - `unhandledrejection` events (Promise rejections without a .catch)
//
// Each fires a Pulse event so you can spot regressions in production
// without piping logs to a dedicated tool.
//
// To avoid spamming the endpoint when a single bug fires repeatedly
// (e.g., one error per render), we rate-limit to 5 errors per page.

import { track } from './core.js'

let installed = false
let errorCount = 0
const MAX_ERRORS_PER_PAGE = 5

export function initErrors(): void {
  if (typeof window === 'undefined') return
  if (installed) return
  installed = true

  // Reset the counter on every navigation so each route gets a fresh budget.
  window.addEventListener('pulse:locationchange', () => {
    errorCount = 0
  })

  window.addEventListener('error', (e: ErrorEvent) => {
    if (errorCount >= MAX_ERRORS_PER_PAGE) return
    errorCount++

    track('js_error', {
      message: truncate(e.message, 300),
      source: truncate(e.filename || '', 300),
      line: e.lineno || 0,
      column: e.colno || 0,
    })
  })

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    if (errorCount >= MAX_ERRORS_PER_PAGE) return
    errorCount++

    let reason = 'unknown'
    try {
      if (e.reason instanceof Error) reason = e.reason.message
      else if (typeof e.reason === 'string') reason = e.reason
      else reason = JSON.stringify(e.reason)
    } catch {
      reason = String(e.reason)
    }

    track('unhandled_rejection', { reason: truncate(reason, 300) })
  })
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 1) + '…'
}
