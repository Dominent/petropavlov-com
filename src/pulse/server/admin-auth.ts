// HTTP Basic Auth gate for admin routes, adapted for Next.js App Router
// (Web Fetch Request/Response) instead of @vercel/node's req/res pair.
//
// Returns null when the request is authorised, or a Response to return
// to the caller when it isn't.
//
//   const auth = requireBasicAuth(req)
//   if (auth) return auth
//   // ... proceed with the handler

const REALM_HEADER = 'Basic realm="Pulse Admin", charset="UTF-8"'

export function requireBasicAuth(req: Request): Response | null {
  const expected = process.env.ANALYTICS_ADMIN_PASSWORD
  if (!expected) {
    return new Response(
      'Admin password not configured. Set ANALYTICS_ADMIN_PASSWORD.',
      { status: 503 },
    )
  }

  const header = req.headers.get('authorization')
  if (!header || !header.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': REALM_HEADER },
    })
  }

  let user = ''
  let pass = ''
  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf-8')
    const colon = decoded.indexOf(':')
    user = decoded.slice(0, colon)
    pass = decoded.slice(colon + 1)
  } catch {
    return new Response('Malformed authorization', {
      status: 401,
      headers: { 'WWW-Authenticate': REALM_HEADER },
    })
  }

  if (user !== 'admin' || !timingSafeEqual(pass, expected)) {
    return new Response('Invalid credentials', {
      status: 401,
      headers: { 'WWW-Authenticate': REALM_HEADER },
    })
  }

  return null
}

/** Constant-time string equality. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
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
