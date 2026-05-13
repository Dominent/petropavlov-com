// Persistent visitor identifier for multi-touch attribution.
//
// Stored in localStorage as a random UUID. Used to link a visitor's
// sessions over time — answers:
//   - Which visitors are returning vs new in this window?
//   - Which channel originally brought a converting visitor?
//   - How long from a visitor's first touch to their conversion?
//
// Privacy posture:
//   - First-party only — your domain's localStorage, not shared with
//     any third party.
//   - No personally identifiable information — the ID is a random UUID
//     generated client-side. It cannot be linked to a real human
//     identity without correlating to other data.
//   - User-clearable — via browser site-data settings, the ?pulse=off
//     URL (when shipped), or `clearVisitorId()` programmatically.
//   - Falls back to a session-only in-memory ID if localStorage is
//     unavailable (private browsing on some browsers, blocked storage).
//
// This pattern is the same one Plausible's paid "stats" tier uses, and
// is defensible as consent-exempt under GDPR when framed as functional
// first-party analytics.

const STORAGE_KEY = '__pulse_visitor'

let cached: string | null = null

/**
 * Get the visitor ID — reads from localStorage on first call, caches
 * for subsequent calls. Generates a new ID if none exists.
 *
 * Returns null only on SSR (no `window`).
 */
export function getVisitorId(): string | null {
  if (typeof window === 'undefined') return null
  if (cached) return cached

  try {
    let id = localStorage.getItem(STORAGE_KEY)
    if (!id) {
      id = generateId()
      try {
        localStorage.setItem(STORAGE_KEY, id)
      } catch {
        // localStorage available but write failed (quota, permission) —
        // we still return the generated ID for the lifetime of this
        // page; it just won't persist across reloads.
      }
    }
    cached = id
    return id
  } catch {
    // localStorage entirely blocked — degrade to in-memory ID.
    if (!cached) cached = generateId()
    return cached
  }
}

/** Clear the visitor ID — used by the opt-out flow. */
export function clearVisitorId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore — best-effort
  }
  cached = null
}

function generateId(): string {
  // Alias `crypto` to a local to avoid TS narrowing it to `never`
  // after the first existence check (Crypto.randomUUID is in the
  // DOM lib types so subsequent `'randomUUID' in crypto` checks are
  // tautologies that confuse the narrowing).
  const c = typeof crypto !== 'undefined' ? crypto : undefined

  // crypto.randomUUID is available in Chrome 92+, Firefox 95+,
  // Safari 15.4+ — covers ~99% of modern browsers.
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }

  // Fallback: 16 random bytes as hex (128-bit identifier).
  const bytes = new Uint8Array(16)
  if (c) {
    c.getRandomValues(bytes)
  } else {
    // Pre-Web-Crypto browsers — use Math.random as last resort.
    // Lower entropy but distinct enough at portfolio-traffic scales.
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
