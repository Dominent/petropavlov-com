// Shared client core — config state + the track() function.
//
// Lives in its own file so sub-modules (sections, errors, etc.) can
// fire events through track() without creating a circular dependency
// with index.ts. index.ts orchestrates init() and re-exports the
// public API from here.

import type { EventPayload, EventType, SectionConfig } from './types'
import { send } from './send'
import { readSessionUtm } from './page-views'
import { getVisitorId } from './visitor-id'

/** Optional per-call overrides for track(). */
export type TrackOptions = {
  /**
   * Override the event's `page` (default: `window.location.pathname`).
   * Used by dwell tracking — by the time a dwell event fires, the SPA
   * may have already navigated, and we want to attribute the event to
   * the page it's *about*, not the current page.
   */
  page?: string
}

/**
 * Resolved internal config — every field defined, used after merging
 * defaults in init(). Kept as a single object so we can swap it
 * atomically when init() is called.
 */
export type ResolvedConfig = {
  endpoint: string
  vitalsEndpoint: string
  autoTrack: boolean
  scrollRoutes: RegExp[]
  internalHosts: string[] | undefined
  sections: SectionConfig[]
  errors: boolean
  debug: boolean
}

const DEFAULTS: ResolvedConfig = {
  endpoint: '/api/track',
  vitalsEndpoint: '/api/track-vitals',
  autoTrack: true,
  scrollRoutes: [],
  internalHosts: undefined,
  sections: [],
  errors: false,
  debug: false,
}

let activeConfig: ResolvedConfig = DEFAULTS

/** Replace the active config. Called once by init(). */
export function setConfig(config: ResolvedConfig): void {
  activeConfig = config
}

/** Read the current config — used by sub-modules that need endpoint/debug. */
export function getConfig(): ResolvedConfig {
  return activeConfig
}

/**
 * Fire a custom event. Page (current pathname), any persisted UTM
 * params from the session, and the visitor ID from localStorage are
 * attached automatically.
 *
 * Safe to call before `init()` — uses defaults. Safe in SSR — no-op
 * when window is undefined.
 */
export function track(
  event: EventType,
  props?: Record<string, unknown>,
  opts?: TrackOptions,
): void {
  if (typeof window === 'undefined') return

  const utm = readSessionUtm()
  const payload: EventPayload = {
    event,
    page: opts?.page || window.location.pathname,
    visitor_id: getVisitorId() || undefined,
    utm_source: utm.utm_source || undefined,
    utm_medium: utm.utm_medium || undefined,
    utm_campaign: utm.utm_campaign || undefined,
    props,
  }
  send(activeConfig.endpoint, payload, activeConfig.debug)
}
