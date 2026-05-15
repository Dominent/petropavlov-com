// Page-view tracking for SPAs.
//
// Hooks the History API so route changes (pushState/replaceState) fire
// a `view` event automatically, no integration with your router needed.
// Works with React Router, Vue Router, Solid Router, vanilla JS — anything
// that uses standard History API navigation.
//
// UTM params are captured on first visit and persisted in sessionStorage
// so subsequent pageviews in the same session still attribute to the
// original source. sessionStorage (not localStorage) is used because
// it's automatically cleared when the tab closes — no persistent
// tracking identifier survives the session, which keeps us GDPR-safe
// without a cookie banner.

import type { EventPayload, PulseConfig } from './types'
import { send } from './send'
import { getVisitorId } from './visitor-id'
import { getAllAssignments } from './experiments'

const SESSION_UTM_KEY = '__pulse_utm'

let installed = false
let lastPath = ''
let internalCfg: { endpoint: string; debug: boolean } | null = null

export function initPageViews(config: Required<Pick<PulseConfig, 'endpoint'>> & PulseConfig): void {
  if (installed) return
  installed = true
  internalCfg = { endpoint: config.endpoint, debug: !!config.debug }

  // Monkey-patch pushState/replaceState. Neither fires a native event,
  // so we dispatch our own `pulse:locationchange` that downstream
  // listeners can hook into. TS gets queasy about Parameters<History[K]>
  // resolving to a union of tuples — we use unknown[] and trust that
  // we're forwarding exactly what was passed in.
  for (const method of ['pushState', 'replaceState'] as const) {
    const original = history[method].bind(history) as (...a: unknown[]) => void
    history[method] = function (...args: unknown[]) {
      const result = original(...args)
      window.dispatchEvent(new Event('pulse:locationchange'))
      return result
    } as History[typeof method]
  }

  // Back/forward navigation does fire popstate.
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('pulse:locationchange'))
  })

  window.addEventListener('pulse:locationchange', firePageView)

  // Initial load.
  firePageView()
}

function firePageView() {
  if (!internalCfg) return
  const path = window.location.pathname
  if (path === lastPath) return // de-dupe identical consecutive views
  lastPath = path
  send(internalCfg.endpoint, buildViewPayload(path), internalCfg.debug)
}

function buildViewPayload(page: string): EventPayload {
  const url = new URL(window.location.href)
  const params = url.searchParams

  // UTM precedence: current URL params > session-stored > none
  const stored = readSessionUtm()
  const utm_source = params.get('utm_source') || stored.utm_source
  const utm_medium = params.get('utm_medium') || stored.utm_medium
  const utm_campaign = params.get('utm_campaign') || stored.utm_campaign
  if (utm_source || utm_medium || utm_campaign) {
    writeSessionUtm({ utm_source, utm_medium, utm_campaign })
  }

  let referrer_host: string | undefined
  if (document.referrer) {
    try {
      const r = new URL(document.referrer)
      // Same-origin = not a referrer; that's just internal navigation
      if (r.hostname && r.hostname !== window.location.hostname) {
        referrer_host = r.hostname
      }
    } catch {
      // Malformed referrer
    }
  }

  // Same experiment-assignment merge as core.track() does — view events
  // bypass track() to keep the initial-load path tight, so we attach
  // the assignments here too. Empty object when initExperiments() has
  // not resolved yet (the first view event on a cold load may miss the
  // assignment; subsequent SPA navigations include it).
  const assignments = getAllAssignments()
  const props = Object.keys(assignments).length > 0 ? assignments : undefined

  return {
    event: 'view',
    page,
    visitor_id: getVisitorId() || undefined,
    referrer_host,
    utm_source: utm_source || undefined,
    utm_medium: utm_medium || undefined,
    utm_campaign: utm_campaign || undefined,
    props,
  }
}

/** Read UTM params persisted earlier in this session. */
export function readSessionUtm(): Record<string, string | undefined> {
  try {
    const raw = sessionStorage.getItem(SESSION_UTM_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeSessionUtm(utm: Record<string, string | undefined>): void {
  try {
    // Strip undefined keys before storing
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(utm)) if (v) clean[k] = v
    sessionStorage.setItem(SESSION_UTM_KEY, JSON.stringify(clean))
  } catch {
    // sessionStorage can be disabled (private mode, quota exceeded)
  }
}
