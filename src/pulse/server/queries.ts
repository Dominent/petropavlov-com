// Aggregation queries for the dashboard.
//
// All queries take a time window (start/end ISO timestamps) and return
// rows shaped for direct rendering. Percentile and bounce calculations
// use Postgres aggregate functions (percentile_cont, distinct counts)
// so heavy lifting happens in the database, not in JS.
//
// These functions are decoupled from any specific HTTP handler so the
// dashboard implementation (or any other consumer) can render the
// results however it likes.

import { sql } from './storage/postgres.js'
import { categorize, type Channel } from './categorize.js'

export type Range = { since: Date; until: Date }

// ─────────────────────────────────────────────────────────────────────
// Headline numbers
// ─────────────────────────────────────────────────────────────────────

export async function totals(r: Range): Promise<{
  visitors: number
  views: number
  sessions: number
}> {
  const { rows } = await sql`
    SELECT
      COUNT(DISTINCT session_hash)                                            AS visitors,
      COUNT(*) FILTER (WHERE event_type = 'view')                             AS views,
      COUNT(DISTINCT session_hash) FILTER (WHERE event_type = 'view')         AS sessions
    FROM analytics_events
    WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
  `
  const row = rows[0] || {}
  return {
    visitors: Number(row.visitors) || 0,
    views: Number(row.views) || 0,
    sessions: Number(row.sessions) || 0,
  }
}

/**
 * Bounce rate = sessions with exactly 1 view / total sessions.
 * A "session" is all events sharing a session_hash on a given day.
 */
export async function bounceRate(r: Range): Promise<number> {
  const { rows } = await sql`
    WITH session_views AS (
      SELECT session_hash, COUNT(*) AS view_count
      FROM analytics_events
      WHERE event_type = 'view'
        AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
      GROUP BY session_hash
    )
    SELECT
      COALESCE(
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE view_count = 1) / NULLIF(COUNT(*), 0),
          0
        ),
        0
      )::int AS bounce_rate
    FROM session_views
  `
  return Number(rows[0]?.bounce_rate) || 0
}

// ─────────────────────────────────────────────────────────────────────
// Breakdowns
// ─────────────────────────────────────────────────────────────────────

export type BreakdownRow = { key: string; visitors: number }

export async function topPages(r: Range, limit = 10): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT page AS key, COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY page
    ORDER BY visitors DESC
    LIMIT ${limit}
  `
  return rows.map(rowOf)
}

export async function topReferrers(r: Range, limit = 10): Promise<BreakdownRow[]> {
  // We include null referrers as "(direct)" so the visitor count is
  // complete — otherwise the panel would silently exclude a big chunk
  // of traffic. Most analytics dashboards do the same.
  const { rows } = await sql`
    SELECT
      COALESCE(referrer_host, '(direct)') AS key,
      COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY COALESCE(referrer_host, '(direct)')
    ORDER BY visitors DESC
    LIMIT ${limit}
  `
  return rows.map(rowOf)
}

/**
 * Traffic-source breakdown — visitors grouped into Direct / Search /
 * Social / Referral channels. Done in two steps: aggregate per-host
 * counts in SQL, then categorize in JS using `categorize()`. Avoids
 * shipping the (long) host-pattern lists into Postgres.
 */
export async function trafficByChannel(r: Range): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT
      referrer_host AS host,
      COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY referrer_host
  `

  const channels: Record<Channel, number> = {
    direct: 0,
    search: 0,
    social: 0,
    referral: 0,
  }

  for (const row of rows) {
    const ch = categorize(row.host as string | null)
    channels[ch] += Number(row.visitors) || 0
  }

  return (Object.entries(channels) as [Channel, number][])
    .filter(([, v]) => v > 0)
    .map(([key, visitors]) => ({ key, visitors }))
    .sort((a, b) => b.visitors - a.visitors)
}

export async function topUTMSources(r: Range, limit = 10): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT
      COALESCE(utm_source, '(none)') AS key,
      COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY COALESCE(utm_source, '(none)')
    ORDER BY visitors DESC
    LIMIT ${limit}
  `
  return rows.map(rowOf)
}

export async function topCountries(r: Range, limit = 10): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT
      COALESCE(country, '??') AS key,
      COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY COALESCE(country, '??')
    ORDER BY visitors DESC
    LIMIT ${limit}
  `
  return rows.map(rowOf)
}

export async function deviceBreakdown(r: Range): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT device AS key, COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view' AND device IS NOT NULL
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY device ORDER BY visitors DESC
  `
  return rows.map(rowOf)
}

export async function browserBreakdown(r: Range): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT browser AS key, COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view' AND browser IS NOT NULL
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY browser ORDER BY visitors DESC
  `
  return rows.map(rowOf)
}

export async function osBreakdown(r: Range): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT os AS key, COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type = 'view' AND os IS NOT NULL
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY os ORDER BY visitors DESC
  `
  return rows.map(rowOf)
}

export async function customEvents(r: Range): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    SELECT
      event_type AS key,
      COUNT(DISTINCT session_hash)::int AS visitors
    FROM analytics_events
    WHERE event_type <> 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY event_type
    ORDER BY visitors DESC
  `
  return rows.map(rowOf)
}

// ─────────────────────────────────────────────────────────────────────
// Multi-touch attribution & visitor recency (via persistent visitor_id)
// ─────────────────────────────────────────────────────────────────────

/**
 * New vs returning visitors in the window.
 *
 *   - "New" = the visitor's first-ever event was inside this window
 *   - "Returning" = the visitor's first-ever event was before the window
 *
 * Both are based on persistent `visitor_id` (localStorage UUID). Rows
 * with NULL visitor_id are ignored — those would mostly be old data
 * captured before the column was introduced, or visitors who blocked
 * localStorage entirely.
 */
export async function newVsReturning(r: Range): Promise<{ new_visitors: number; returning_visitors: number }> {
  const { rows } = await sql`
    WITH first_seen AS (
      SELECT visitor_id, MIN(ts) AS first_ts
      FROM analytics_events
      WHERE visitor_id IS NOT NULL
      GROUP BY visitor_id
    ),
    active AS (
      SELECT DISTINCT visitor_id
      FROM analytics_events
      WHERE visitor_id IS NOT NULL
        AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    )
    SELECT
      COUNT(*) FILTER (WHERE fs.first_ts >= ${r.since.toISOString()})::int AS new_visitors,
      COUNT(*) FILTER (WHERE fs.first_ts < ${r.since.toISOString()})::int AS returning_visitors
    FROM active a
    JOIN first_seen fs ON fs.visitor_id = a.visitor_id
  `
  const row = rows[0] || {}
  return {
    new_visitors: Number(row.new_visitors) || 0,
    returning_visitors: Number(row.returning_visitors) || 0,
  }
}

/**
 * First-touch attribution: for each visitor active in the window,
 * find what brought them to the site originally (their first-ever view
 * event's referrer / utm_source).
 *
 * This answers "which channel actually delivered the visitor", even if
 * they returned later via a different channel.
 */
export async function firstTouchAttribution(r: Range, limit = 10): Promise<BreakdownRow[]> {
  const { rows } = await sql`
    WITH first_touch AS (
      SELECT DISTINCT ON (visitor_id)
        visitor_id,
        COALESCE(utm_source, referrer_host, '(direct)') AS source
      FROM analytics_events
      WHERE visitor_id IS NOT NULL
        AND event_type = 'view'
      ORDER BY visitor_id, ts ASC
    ),
    active AS (
      SELECT DISTINCT visitor_id
      FROM analytics_events
      WHERE visitor_id IS NOT NULL
        AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    )
    SELECT
      ft.source AS key,
      COUNT(*)::int AS visitors
    FROM active a
    JOIN first_touch ft ON ft.visitor_id = a.visitor_id
    GROUP BY ft.source
    ORDER BY visitors DESC
    LIMIT ${limit}
  `
  return rows.map(rowOf)
}

/**
 * Dwell time distribution — counts visitors by how long they actively
 * engaged with each page. Reads MAX(active_ms) per (visitor, page) so
 * heartbeats don't double-count.
 */
export async function dwellByPage(r: Range, limit = 10): Promise<{ key: string; median_ms: number; samples: number }[]> {
  const { rows } = await sql`
    WITH per_visit AS (
      SELECT
        page,
        COALESCE(visitor_id, session_hash) AS who,
        MAX((props->>'active_ms')::int) AS active_ms
      FROM analytics_events
      WHERE event_type = 'time_on_page'
        AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
        AND props ? 'active_ms'
      GROUP BY page, COALESCE(visitor_id, session_hash)
    )
    SELECT
      page AS key,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY active_ms)::int AS median_ms,
      COUNT(*)::int AS samples
    FROM per_visit
    GROUP BY page
    ORDER BY samples DESC
    LIMIT ${limit}
  `
  return rows.map((r) => ({
    key: String(r.key ?? '/'),
    median_ms: Number(r.median_ms) || 0,
    samples: Number(r.samples) || 0,
  }))
}

// ─────────────────────────────────────────────────────────────────────
// Funnel, recent events, events-by-hour
// ─────────────────────────────────────────────────────────────────────

export type FunnelStage = {
  /** Short label for the stage (e.g. "Reached out"). */
  label: string
  /** One-line description of what behavior counts. */
  description: string
  /** Distinct sessions that reached this stage. */
  count: number
  /** Percentage of stage 1 (visitors). */
  pctOfTop: number
  /** Percentage retained from the immediately previous stage. */
  pctOfPrev: number
}

/**
 * Loose conversion funnel: each stage counts distinct sessions that
 * had at least one matching event in the window, independent of
 * whether they hit earlier stages. This better captures real behavior
 * than a strict funnel (e.g. someone who skips straight to "Book a
 * call" without scrolling to the work section still counts as
 * "Reached out"). Stages are still ordered for display, and the
 * pctOfPrev computation treats them as sequential.
 *
 * Stages are tuned for a freelance/consulting portfolio. Edit the
 * SELECT clause to fit a different site.
 */
export async function funnel(r: Range): Promise<FunnelStage[]> {
  const { rows } = await sql`
    SELECT
      COUNT(DISTINCT session_hash) AS visitors,
      COUNT(DISTINCT session_hash) FILTER (
        WHERE event_type = 'section_view' AND props->>'section' = 'work'
      ) AS browsed_work,
      COUNT(DISTINCT session_hash) FILTER (
        WHERE event_type = 'project_click'
          OR (event_type = 'view' AND page LIKE '/case-studies/%')
      ) AS interested,
      COUNT(DISTINCT session_hash) FILTER (
        WHERE event_type IN ('contact_open', 'cal_click')
      ) AS reached_out,
      COUNT(DISTINCT session_hash) FILTER (
        WHERE event_type = 'contact_submit'
      ) AS converted
    FROM analytics_events
    WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
  `
  const row = rows[0] || {}

  const stages = [
    { key: 'visitors', label: 'Visitor', description: 'Landed on the site' },
    {
      key: 'browsed_work',
      label: 'Browsed work',
      description: 'Scrolled to the Selected Work section',
    },
    {
      key: 'interested',
      label: 'Showed interest',
      description: 'Clicked a project or opened a case study',
    },
    {
      key: 'reached_out',
      label: 'Reached out',
      description: 'Opened the contact form or clicked Book a call',
    },
    {
      key: 'converted',
      label: 'Converted',
      description: 'Submitted the contact form',
    },
  ]
  const counts = stages.map((s) => Number(row[s.key]) || 0)
  const top = counts[0] || 0

  return stages.map((s, i) => ({
    label: s.label,
    description: s.description,
    count: counts[i],
    pctOfTop: top > 0 ? Math.round((counts[i] / top) * 100) : 0,
    pctOfPrev:
      i === 0
        ? 100
        : counts[i - 1] > 0
          ? Math.round((counts[i] / counts[i - 1]) * 100)
          : 0,
  }))
}

export type RecentEvent = {
  ts: string
  event_type: string
  page: string
  country: string | null
  device: string | null
  props: Record<string, unknown> | null
}

/**
 * Last N custom events (everything except `view`) — for the events
 * page's "Live feed" table. Includes props so the dashboard can show
 * each event's payload.
 */
export async function recentEvents(r: Range, limit = 50): Promise<RecentEvent[]> {
  const { rows } = await sql`
    SELECT ts::text AS ts, event_type, page, country, device, props
    FROM analytics_events
    WHERE event_type <> 'view'
      AND ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    ORDER BY ts DESC
    LIMIT ${limit}
  `
  return rows.map((row) => ({
    ts: String(row.ts),
    event_type: String(row.event_type),
    page: String(row.page),
    country: row.country == null ? null : String(row.country),
    device: row.device == null ? null : String(row.device),
    props:
      row.props == null
        ? null
        : (row.props as Record<string, unknown>),
  }))
}

/**
 * Event count per hour-of-day (UTC, 0-23). Returns all 24 buckets,
 * filling missing hours with zero so the histogram renders evenly.
 */
export async function eventsByHour(r: Range): Promise<{ hour: number; count: number }[]> {
  const { rows } = await sql`
    SELECT
      EXTRACT(HOUR FROM ts AT TIME ZONE 'UTC')::int AS hour,
      COUNT(*)::int AS count
    FROM analytics_events
    WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY hour
    ORDER BY hour
  `
  const map = new Map<number, number>()
  for (const row of rows) map.set(Number(row.hour), Number(row.count))
  const out: { hour: number; count: number }[] = []
  for (let h = 0; h < 24; h++) out.push({ hour: h, count: map.get(h) || 0 })
  return out
}

// ─────────────────────────────────────────────────────────────────────
// Web Vitals
// ─────────────────────────────────────────────────────────────────────

export type Percentile = 75 | 90 | 95 | 99
export type Metric = 'FCP' | 'LCP' | 'INP' | 'CLS' | 'FID' | 'TTFB'

export async function vitalsPercentiles(
  r: Range,
  pct: Percentile = 75,
): Promise<Record<Metric, number>> {
  const fraction = pct / 100
  const { rows } = await sql`
    SELECT metric, PERCENTILE_CONT(${fraction}) WITHIN GROUP (ORDER BY value)::float AS p
    FROM analytics_vitals
    WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
    GROUP BY metric
  `
  const out: Record<string, number> = {}
  for (const row of rows) out[row.metric] = Number(row.p) || 0
  return out as Record<Metric, number>
}

export type VitalByDim = { key: string; res: number; samples: number }

/**
 * Compute the Real Experience Score per dimension (page or country)
 * for a given period. RES is the standard web.dev composite — see
 * `computeRES` below for the formula.
 */
export async function vitalsByDimension(
  r: Range,
  dimension: 'page' | 'country',
): Promise<VitalByDim[]> {
  const { rows } =
    dimension === 'page'
      ? await sql`
        SELECT page AS key, metric,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::float AS p75,
          COUNT(*)::int AS samples
        FROM analytics_vitals
        WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
        GROUP BY page, metric
      `
      : await sql`
        SELECT COALESCE(country, '??') AS key, metric,
          PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value)::float AS p75,
          COUNT(*)::int AS samples
        FROM analytics_vitals
        WHERE ts >= ${r.since.toISOString()} AND ts < ${r.until.toISOString()}
        GROUP BY COALESCE(country, '??'), metric
      `

  // Group metrics by key, then compute RES.
  type Bucket = { samples: number; metrics: Record<string, number> }
  const buckets = new Map<string, Bucket>()
  for (const row of rows) {
    const b = buckets.get(row.key) || { samples: 0, metrics: {} }
    b.metrics[row.metric] = Number(row.p75) || 0
    b.samples += Number(row.samples) || 0
    buckets.set(row.key, b)
  }

  const out: VitalByDim[] = []
  for (const [key, b] of buckets) {
    out.push({ key, res: computeRES(b.metrics as Record<Metric, number>), samples: b.samples })
  }
  out.sort((a, b) => b.samples - a.samples)
  return out
}

/**
 * Real Experience Score (RES) — 0-100 composite of Core Web Vitals.
 *
 * Uses the standard web.dev scoring curves: each metric gets a 0-1
 * score (1.0 = good, 0.5 = needs improvement, 0.0 = poor), then the
 * weighted average is multiplied by 100. Weights match the public
 * Lighthouse v10+ scoring: LCP 25%, INP 25%, CLS 25%, FCP 15%, TTFB 10%.
 */
export function computeRES(m: Record<Metric, number>): number {
  const scores: { weight: number; score: number }[] = []
  if (m.LCP != null) scores.push({ weight: 0.25, score: scoreMetric(m.LCP, 2500, 4000) })
  if (m.INP != null) scores.push({ weight: 0.25, score: scoreMetric(m.INP, 200, 500) })
  if (m.CLS != null) scores.push({ weight: 0.25, score: scoreMetric(m.CLS, 0.1, 0.25) })
  if (m.FCP != null) scores.push({ weight: 0.15, score: scoreMetric(m.FCP, 1800, 3000) })
  if (m.TTFB != null) scores.push({ weight: 0.1, score: scoreMetric(m.TTFB, 800, 1800) })

  if (scores.length === 0) return 0
  const totalWeight = scores.reduce((s, x) => s + x.weight, 0)
  const weighted = scores.reduce((s, x) => s + x.weight * x.score, 0)
  return Math.round((weighted / totalWeight) * 100)
}

/** Map a measured value to a 0-1 score using the good/poor thresholds. */
function scoreMetric(value: number, good: number, poor: number): number {
  if (value <= good) return 1
  if (value >= poor) return 0
  return 1 - (value - good) / (poor - good)
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function rowOf(row: Record<string, unknown>): BreakdownRow {
  return { key: String(row.key ?? '??'), visitors: Number(row.visitors) || 0 }
}

/** Resolve a "7d" / "30d" / "90d" range string into a Range object. */
export function parseRange(s: string | undefined | null): Range {
  const now = new Date()
  const days = s === '90d' ? 90 : s === '30d' ? 30 : 7
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return { since, until: now }
}

/** Range covering the *previous* equivalent window — used for % deltas. */
export function previousRange(r: Range): Range {
  const span = r.until.getTime() - r.since.getTime()
  return { since: new Date(r.since.getTime() - span), until: r.since }
}
