// Client-side type definitions for Pulse. Kept in a dedicated file so
// they can be imported from any client module without pulling in the
// rest of the SDK.

/**
 * Built-in events. Strings are also accepted — custom event names
 * work without changes to the library.
 */
export type EventType =
  | 'view'
  | 'section_view'
  | 'time_on_page'
  | 'contact_open'
  | 'contact_submit'
  | 'contact_field_focus'
  | 'contact_validation_error'
  | 'cal_click'
  | 'cta_click'
  | 'nav_click'
  | 'project_click'
  | 'ask_query'
  | 'ask_prompt_click'
  | 'ask_error'
  | 'scroll'
  | 'outbound'
  | 'js_error'
  | 'unhandled_rejection'
  | '404'
  | (string & {}) // hack to allow custom strings without losing built-in autocomplete

/** Section configuration for IntersectionObserver-based view tracking. */
export type SectionConfig = {
  /** HTML element id to observe */
  id: string
  /** Friendly name used in the event prop (defaults to `id`) */
  name?: string
}

export type EventPayload = {
  event: EventType
  page: string
  /** Random UUID from localStorage for multi-touch attribution. */
  visitor_id?: string
  referrer_host?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  props?: Record<string, unknown>
}

export type VitalMetric = 'FCP' | 'LCP' | 'INP' | 'CLS' | 'FID' | 'TTFB'

export type VitalPayload = {
  metric: VitalMetric
  value: number
  page: string
  visitor_id?: string
}

/**
 * Pulse configuration. Pass to `init()` once at app boot.
 *
 * All fields are optional — calling `init()` with no args is valid and
 * uses sensible defaults (endpoint `/api/track`, autoTrack on, etc.).
 */
export type PulseConfig = {
  /** POST endpoint for events. Default `/api/track`. */
  endpoint?: string

  /** POST endpoint for Core Web Vitals samples. Default `/api/track-vitals`. */
  vitalsEndpoint?: string

  /**
   * When true, init() automatically wires up page views, web vitals,
   * outbound link tracking, and scroll milestone tracking. Default true.
   *
   * Set to false if you want fine-grained control via the individual
   * `initPageViews()`, `initWebVitals()`, etc. exports.
   */
  autoTrack?: boolean

  /**
   * Routes (matched against `location.pathname`) where scroll milestone
   * events should fire. Default `[]` — scroll tracking off.
   *
   * Example: `[/^\/case-studies\//]` to track scroll only on case studies.
   */
  scrollRoutes?: RegExp[]

  /**
   * Hosts treated as "internal" — links to them won't fire `outbound`
   * events. Default: `[window.location.hostname]`.
   */
  internalHosts?: string[]

  /**
   * Sections to observe with IntersectionObserver. Each entry fires a
   * `section_view` event the first time it enters the viewport.
   * Default: `[]` — section tracking off.
   *
   * Example: `[{ id: 'hero' }, { id: 'work' }, { id: 'contact' }]`
   */
  sections?: SectionConfig[]

  /**
   * Enable global JS error + unhandled-rejection capture.
   * Default false. Each page load gets a 5-error budget to avoid
   * flooding the endpoint when a bug fires repeatedly.
   */
  errors?: boolean

  /** Console-log every event being sent. Default false. */
  debug?: boolean
}
