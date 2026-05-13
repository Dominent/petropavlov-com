# Pulse

> Privacy-first, GDPR-clean, self-hosted web analytics. ~5 KB on the client.
> Drop-in replacement for the part of Vercel Analytics + Speed Insights
> you actually use, with custom events out of the box (not Pro-locked).

**No cookies. No localStorage IDs. No IP storage. No fingerprinting. No consent banner needed.**

Pulse uses a daily-rotating server-side salt (the same approach Plausible and
Fathom use, blessed as consent-exempt by CNIL) to give you per-day session
deduplication without persistent user identifiers. After 24 hours, the
session hash is unlinkable to any IP — even if your database is dumped.

## Features

**Analytics**
- Page views (auto-tracked via History API — works with React Router, Vue Router, vanilla JS)
- Unique visitors (per-day session deduplication)
- Bounce rate (single-view sessions ÷ total sessions)
- Top pages, top referrers, UTM source/medium/campaign attribution (session-persisted)
- Country (from edge geolocation header — zero-latency, no external lookups)
- Device / browser / OS family
- **Custom events** (`track('contact_open')`, etc.) — first-class, no Pro tier
- Outbound link auto-tracking (mailto + tel included)
- Scroll milestone tracking (25/50/75/100%) — opt-in per route

**Web Vitals**
- FCP, LCP, INP, CLS, FID, TTFB
- P75 / P90 / P95 / P99 percentile aggregation in Postgres
- Real Experience Score (RES) — standard web.dev composite (LCP 25%, INP 25%, CLS 25%, FCP 15%, TTFB 10%)
- Per-page and per-country breakdowns

## Install

```bash
npm install @vercel/postgres
```

That's the only runtime dependency — Pulse implements Core Web Vitals from scratch on top of `PerformanceObserver` (no `web-vitals` wrapper).

Copy `src/pulse/` into your project, or (once extracted) `npm install <package>`.

## Database setup

Pulse uses Postgres. Schema is in `schema/postgres.sql`.

**On Vercel:**
1. Add Postgres to your project: Storage tab → Create → Postgres
2. Pull env vars locally: `vercel env pull .env.local`
3. Open the Vercel Postgres SQL console and paste the contents of `schema/postgres.sql`
4. Done — `@vercel/postgres` auto-connects via the `POSTGRES_URL` env var

**Anywhere else:**
1. Provision a Postgres database (Neon, Supabase, RDS, self-hosted, anything)
2. Set `POSTGRES_URL` env var to the connection string
3. Run `psql $POSTGRES_URL -f src/pulse/schema/postgres.sql`

You also need to set `ANALYTICS_SALT_SECRET` — a random 32+ byte hex string, used to derive the daily session-hashing salt. Generate one with `openssl rand -hex 32`.

## Client setup

In your app's entry point:

```ts
import { init } from './pulse/client'

init({
  endpoint: '/api/track',             // default: /api/track
  vitalsEndpoint: '/api/track-vitals', // default: /api/track-vitals
  scrollRoutes: [/^\/case-studies\//],  // empty = scroll tracking off
  debug: import.meta.env.DEV,
})
```

That's it for the auto-tracked dimensions (page views, web vitals, outbound clicks, scroll milestones).

For custom events, import `track`:

```ts
import { track } from './pulse/client'

// Anywhere in your app:
track('contact_open')
track('contact_submit', { email_domain: 'company.com' })
track('cal_click', { source: 'hero' })
```

`track()` automatically attaches the current pathname and any session-persisted UTM params.

## Server setup

Two API routes — one for events, one for vitals.

`api/track.ts`:
```ts
import { ingestEvent } from '../src/pulse/server'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const result = await ingestEvent(req, req.body)
  return result.ok ? res.status(204).end() : res.status(400).json(result)
}
```

`api/track-vitals.ts` is identical, but calls `ingestVital`.

## Dashboard

Pulse exports query helpers — wire them into any UI you like. The
portfolio that ships Pulse uses two server-rendered HTML pages
(`/admin/analytics`, `/admin/speed`) with basic-auth. ~200 lines each.

```ts
import {
  totals, bounceRate, topPages, topReferrers, topUTMSources,
  topCountries, deviceBreakdown, browserBreakdown, osBreakdown,
  customEvents, vitalsPercentiles, vitalsByDimension, parseRange,
  previousRange,
} from './pulse/server'

const range = parseRange('7d')
const { visitors, views } = await totals(range)
const bounce = await bounceRate(range)
const pages = await topPages(range, 10)
// ... etc
```

## Why not Plausible / Fathom / Umami?

If a hosted service is fine for you, use Plausible — it's mature and excellent. Pulse exists if you want:

- **No subscription** — free Postgres tier (Vercel/Neon/Supabase) covers personal-site traffic for years
- **Full SQL access to your data** — write any aggregation you want
- **One stack** — analytics lives in the same repo and runs in the same deploy as your app
- **Custom events without a Pro tier** — every event is first-class
- **Real Web Vitals, not just page views** — most cookieless tools skip CWV; Pulse treats them as a peer feature
- **It's yours** — small library, ~1500 lines, audit and modify in an afternoon

## License

MIT.
