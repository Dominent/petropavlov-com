// Extract privacy-relevant context from an incoming HTTP request,
// without persisting anything identifying.
//
// Adapter-agnostic — works with `VercelRequest`, raw `IncomingMessage`,
// Cloudflare `Request`, Hono context, Next.js handlers, etc. We accept
// anything that quacks like a request: a `headers` object and optional
// `socket.remoteAddress`.

import type { EventPayload, VitalPayload } from '../client/types.js'
import { parseUA } from './parse-ua.js'
import { sessionHash } from './hash.js'
import type { EventRecord, VitalRecord } from './types.js'

/**
 * Minimal request shape. Compatible with @vercel/node, native Node
 * IncomingMessage, and Web Fetch Request (with header.get()).
 */
export type RequestLike =
  | {
      headers: Record<string, string | string[] | undefined>
      socket?: { remoteAddress?: string }
    }
  | {
      headers: { get(name: string): string | null }
    }

function getHeader(req: RequestLike, name: string): string | null {
  const h = req.headers as { get?: (n: string) => string | null } & Record<
    string,
    string | string[] | undefined
  >
  if (typeof h.get === 'function') return h.get(name)
  const v = h[name.toLowerCase()]
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v[0] ?? null
  return null
}

/** Best-effort client IP from forwarding headers. */
export function getIp(req: RequestLike): string {
  const xf = getHeader(req, 'x-forwarded-for')
  if (xf) return xf.split(',')[0].trim()
  const real = getHeader(req, 'x-real-ip')
  if (real) return real
  const sock = (req as { socket?: { remoteAddress?: string } }).socket
  return sock?.remoteAddress || 'unknown'
}

/** Vercel sets `x-vercel-ip-country`; Cloudflare uses `cf-ipcountry`. */
export function getCountry(req: RequestLike): string | null {
  const v = getHeader(req, 'x-vercel-ip-country') || getHeader(req, 'cf-ipcountry')
  if (v && v.length === 2) return v.toUpperCase()
  return null
}

export function getUserAgent(req: RequestLike): string {
  return getHeader(req, 'user-agent') || ''
}

/** Build an EventRecord ready for storage from a request + client payload. */
export function buildEventRecord(req: RequestLike, payload: EventPayload): EventRecord {
  const ip = getIp(req)
  const ua = getUserAgent(req)
  const country = getCountry(req)
  const { device, browser, os } = parseUA(ua)

  return {
    event_type: payload.event,
    page: trim(payload.page, 500) || '/',
    referrer_host: trim(payload.referrer_host, 200),
    utm_source: trim(payload.utm_source, 100),
    utm_medium: trim(payload.utm_medium, 100),
    utm_campaign: trim(payload.utm_campaign, 200),
    country,
    device,
    browser,
    os,
    session_hash: sessionHash(ip, ua),
    // Client supplies visitor_id from localStorage. Trim to 64 chars
    // — UUIDs are 36 chars, plenty of headroom; bound to prevent abuse.
    visitor_id: trim(payload.visitor_id, 64),
    props: payload.props ?? null,
  }
}

/** Build a VitalRecord ready for storage from a request + client payload. */
export function buildVitalRecord(req: RequestLike, payload: VitalPayload): VitalRecord {
  const ip = getIp(req)
  const ua = getUserAgent(req)
  const country = getCountry(req)
  const { device } = parseUA(ua)

  return {
    metric: payload.metric,
    value: Number(payload.value),
    page: trim(payload.page, 500) || '/',
    country,
    device,
    session_hash: sessionHash(ip, ua),
    visitor_id: trim(payload.visitor_id, 64),
  }
}

function trim(s: string | null | undefined, max: number): string | null {
  if (!s) return null
  const t = String(s).trim()
  return t.length ? t.slice(0, max) : null
}
