import type { VercelRequest, VercelResponse } from '@vercel/node'
import { ingestVital } from '../src/pulse/server/index.js'

// Vitals fire at most 6 times per page load (one per CWV metric), so
// the rate limit can be much lower than the general event tracker.
const counts = new Map<string, { count: number; reset: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 30

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
  if (req.method !== 'POST') return res.status(405).end()
  if (!rateLimit(getIp(req))) return res.status(429).end()

  try {
    const result = await ingestVital(req, req.body)
    if (!result.ok) return res.status(400).json({ error: result.error })
    return res.status(204).end()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[track-vitals] storage error:', msg)
    return res.status(204).end()
  }
}
