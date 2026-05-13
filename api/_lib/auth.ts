import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * HTTP Basic Auth gate for admin dashboards.
 *
 * Returns true if the request is authorized. Otherwise writes a 401
 * response with the WWW-Authenticate header (so the browser prompts
 * for credentials) and returns false.
 *
 * Username is fixed as "admin". Password comes from
 * `ANALYTICS_ADMIN_PASSWORD`. If that env var isn't set, the gate
 * refuses all requests (better fail-closed than expose data).
 *
 * Constant-time comparison so the password isn't timing-leakable.
 */
export function requireBasicAuth(req: VercelRequest, res: VercelResponse): boolean {
  const expected = process.env.ANALYTICS_ADMIN_PASSWORD
  if (!expected) {
    res.status(503).send('Admin password not configured. Set ANALYTICS_ADMIN_PASSWORD.')
    return false
  }

  const header = req.headers.authorization
  if (!header || !header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Pulse Admin", charset="UTF-8"')
    res.status(401).send('Authentication required')
    return false
  }

  let user = ''
  let pass = ''
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
    const colon = decoded.indexOf(':')
    user = decoded.slice(0, colon)
    pass = decoded.slice(colon + 1)
  } catch {
    res.setHeader('WWW-Authenticate', 'Basic realm="Pulse Admin", charset="UTF-8"')
    res.status(401).send('Malformed authorization')
    return false
  }

  if (user !== 'admin' || !timingSafeEqual(pass, expected)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Pulse Admin", charset="UTF-8"')
    res.status(401).send('Invalid credentials')
    return false
  }

  return true
}

/** Constant-time string equality. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still iterate so the early-return doesn't leak length info too cheaply.
    let mismatch = 1
    const len = Math.max(a.length, b.length)
    for (let i = 0; i < len; i++) mismatch |= 1
    void mismatch
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
