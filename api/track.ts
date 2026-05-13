import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ingestEvent } from '../src/pulse/server/index.js'

// In-memory rate limit: shedding obvious abuse before it hits Postgres.
// 200 events/min/IP is generous — a real visitor at the scroll-tracking
// peak fires maybe 6 events/min.
const counts = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 200

function rateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = counts.get(ip)
  if (!entry || now > entry.reset) {
    counts.set(ip, { count: 1, reset: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_PER_WINDOW) return false
  entry.count++
  return true
}

function getIp(req: VercelRequest): string {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string') return xf.split(',')[0].trim()
  if (Array.isArray(xf)) return xf[0]
  return req.socket.remoteAddress || 'unknown'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // sendBeacon issues POST. fetch keepalive also POST. We don't accept
  // anything else.
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  if (!rateLimit(getIp(req))) {
    return res.status(429).end()
  }

  try {
    const result = await ingestEvent(req, req.body)
    if (!result.ok) {
      return res.status(400).json({ error: result.error })
    }
    // 204 No Content — fire-and-forget transport doesn't read body
    return res.status(204).end()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[track] storage error:', msg)
    // Return 204 anyway — we never want analytics failures to surface
    // in user-facing tracking. We log server-side and move on.
    return res.status(204).end()
  }
}
