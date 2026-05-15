// Pulse Core Web Vitals ingest — POST /api/track-vitals.
//
// Fires at most ~6 times per page load (one per CWV metric), so the
// rate limit is tighter than /api/track.

import { ingestVital } from '../../../src/pulse/server/index'

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

function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

export async function POST(req: Request): Promise<Response> {
  if (!rateLimit(getIp(req))) {
    return new Response(null, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(null, { status: 400 })
  }

  try {
    const result = await ingestVital(req, body)
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 })
    }
    return new Response(null, { status: 204 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[track-vitals] storage error:', msg)
    return new Response(null, { status: 204 })
  }
}
