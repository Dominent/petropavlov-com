// Reliable, low-overhead transport for tracking payloads.
//
// sendBeacon is preferred because it's:
//   1. Fire-and-forget (no Promise to await, no UI blocking)
//   2. Guaranteed by the browser to be delivered, even if the page is
//      navigating away — critical for outbound link clicks and the
//      pagehide event.
//
// fetch with `keepalive: true` is the fallback when sendBeacon is
// missing (very old browsers) or when it returns false (payload over
// the ~64 KB beacon limit, browser-imposed).

export function send(url: string, payload: unknown, debug = false): void {
  let body: string
  try {
    body = JSON.stringify(payload)
  } catch {
    return // Unserializable payload — drop silently
  }

  if (debug) {
    // eslint-disable-next-line no-console
    console.debug('[pulse]', url, payload)
  }

  // Try sendBeacon
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' })
      const queued = navigator.sendBeacon(url, blob)
      if (queued) return
    }
  } catch {
    // Some browsers throw if the payload is too large — fall through.
  }

  // Fetch fallback. `keepalive: true` lets the request outlive the page
  // for ~30 seconds (browser-dependent), which is usually enough.
  try {
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'omit', // No cookies — Pulse is cookieless by design
    }).catch(() => {
      // Tracking must never throw in user code
    })
  } catch {
    // Silent
  }
}
