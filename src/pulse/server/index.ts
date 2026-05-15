// Pulse server — request parsing, storage adapters, query helpers.
//
// Designed to be framework-agnostic: works with @vercel/node, Cloudflare
// Workers, native Node, Next.js, Hono, etc. The only requirement is a
// `request`-like object with headers (either header.get() or a record).
//
// Typical usage in a Vercel function:
//
//   import { ingestEvent } from '../src/pulse/server'
//   export default async function handler(req, res) {
//     const result = await ingestEvent(req, req.body)
//     return result.ok ? res.status(204).end() : res.status(400).json(result)
//   }

import type { EventPayload, VitalPayload } from '../client/types'
import { buildEventRecord, buildVitalRecord, type RequestLike } from './parse-request'
import { postgres } from './storage/postgres'
import type { StorageAdapter } from './types'

export type {
  EventRecord,
  VitalRecord,
  StorageAdapter,
} from './types'

export { postgres } from './storage/postgres'
export * from './queries'
export * from './parse-request'
export * from './parse-ua'
export * from './hash'
export * from './categorize'

/**
 * Ingest a single event. Validates the payload, builds the record from
 * request context, and writes via the storage adapter.
 *
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on bad input.
 * Throws on storage failure — caller decides how to respond.
 */
export async function ingestEvent(
  req: RequestLike,
  payload: unknown,
  adapter: StorageAdapter = postgres,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isEventPayload(payload)) {
    return { ok: false, error: 'invalid payload' }
  }
  const record = buildEventRecord(req, payload)
  await adapter.insertEvent(record)
  return { ok: true }
}

export async function ingestVital(
  req: RequestLike,
  payload: unknown,
  adapter: StorageAdapter = postgres,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isVitalPayload(payload)) {
    return { ok: false, error: 'invalid payload' }
  }
  const record = buildVitalRecord(req, payload)
  await adapter.insertVital(record)
  return { ok: true }
}

// Runtime validation — defensive, since the payload comes from untrusted
// client code over the wire. We don't want a malformed payload to bomb
// the SQL insert or pollute the database with garbage rows.

function isEventPayload(x: unknown): x is EventPayload {
  if (!x || typeof x !== 'object') return false
  const p = x as Record<string, unknown>
  if (typeof p.event !== 'string' || p.event.length === 0 || p.event.length > 64) return false
  if (typeof p.page !== 'string' || p.page.length === 0 || p.page.length > 500) return false
  return true
}

function isVitalPayload(x: unknown): x is VitalPayload {
  if (!x || typeof x !== 'object') return false
  const p = x as Record<string, unknown>
  if (!['FCP', 'LCP', 'INP', 'CLS', 'FID', 'TTFB'].includes(p.metric as string)) return false
  if (typeof p.value !== 'number' || !isFinite(p.value) || p.value < 0) return false
  if (typeof p.page !== 'string' || p.page.length === 0 || p.page.length > 500) return false
  return true
}
