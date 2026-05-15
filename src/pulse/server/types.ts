// Server-side types — shared between the request parser, storage
// adapters, and query helpers.

import type { EventType, VitalMetric } from '../client/types'

/** What we persist to the events table — built from the incoming payload + parsed request context. */
export type EventRecord = {
  event_type: EventType
  page: string
  referrer_host: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  country: string | null
  device: string | null
  browser: string | null
  os: string | null
  /** Daily-rotating session hash (server-derived). */
  session_hash: string
  /** Client-supplied persistent visitor ID from localStorage. Null if not provided. */
  visitor_id: string | null
  props: Record<string, unknown> | null
}

/** What we persist to the vitals table. */
export type VitalRecord = {
  metric: VitalMetric
  value: number
  page: string
  country: string | null
  device: string | null
  session_hash: string
  visitor_id: string | null
}

/** Generic storage adapter interface — implement this to use a non-Postgres backend. */
export type StorageAdapter = {
  insertEvent(record: EventRecord): Promise<void>
  insertVital(record: VitalRecord): Promise<void>
}
