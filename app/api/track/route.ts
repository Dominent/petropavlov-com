// Pulse event ingest — POST /api/track.
//
// sendBeacon and fetch(keepalive:true) both POST application/json.
// 204 No Content on success because the transport is fire-and-forget.
// On error we ALSO return 204 — analytics failures must never surface
// in user-facing tracking. Server-side log + move on.

import { ingestEvent } from '../../../src/pulse/server/index'

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
    const result = await ingestEvent(req, body)
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 400 })
    }
    return new Response(null, { status: 204 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[track] storage error:', msg)
    // Swallow errors — tracking never surfaces to users.
    return new Response(null, { status: 204 })
  }
}
