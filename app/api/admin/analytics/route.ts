import { requireBasicAuth } from '../../../../src/pulse/server/admin-auth'
import {
  totals,
  bounceRate,
  topPages,
  topReferrers,
  topUTMSources,
  topCountries,
  deviceBreakdown,
  browserBreakdown,
  osBreakdown,
  customEvents,
  trafficByChannel,
  newVsReturning,
  firstTouchAttribution,
  dwellByPage,
  topClicks,
  parseRange,
  previousRange,
  type BreakdownRow,
  type ClickRow,
} from '../../../../src/pulse/server/index'

export const runtime = 'nodejs'

export async function GET(req: Request): Promise<Response> {
  const authFail = requireBasicAuth(req)
  if (authFail) return authFail

  const rangeParam = new URL(req.url).searchParams.get('range') ?? '7d'
  const range = parseRange(rangeParam)
  const prev = previousRange(range)

  // Run everything in parallel — Postgres can handle 10 short queries
  // concurrently without breaking a sweat.
  const [
    cur,
    prevTotals,
    bounce,
    prevBounce,
    pages,
    channels,
    referrers,
    utm,
    countries,
    devices,
    browsers,
    osData,
    events,
    recency,
    firstTouch,
    dwell,
    clicks,
  ] = await Promise.all([
    totals(range),
    totals(prev),
    bounceRate(range),
    bounceRate(prev),
    topPages(range, 12),
    trafficByChannel(range),
    topReferrers(range, 10),
    topUTMSources(range, 10),
    topCountries(range, 12),
    deviceBreakdown(range),
    browserBreakdown(range),
    osBreakdown(range),
    customEvents(range),
    newVsReturning(range),
    firstTouchAttribution(range, 10),
    dwellByPage(range, 10),
    topClicks(range, 15),
  ])

  const html = renderPage({
    rangeParam,
    visitors: cur.visitors,
    views: cur.views,
    bounce,
    visitorsDelta: pctDelta(cur.visitors, prevTotals.visitors),
    viewsDelta: pctDelta(cur.views, prevTotals.views),
    bounceDelta: pctDelta(bounce, prevBounce),
    pages,
    channels,
    referrers,
    utm,
    countries,
    devices,
    browsers,
    osData,
    events,
    recency,
    firstTouch,
    dwell,
    clicks,
  })
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

// ─────────────────────────────────────────────────────────────────────
// Rendering
// ─────────────────────────────────────────────────────────────────────

type ViewModel = {
  rangeParam: string
  visitors: number
  views: number
  bounce: number
  visitorsDelta: number | null
  viewsDelta: number | null
  bounceDelta: number | null
  pages: BreakdownRow[]
  channels: BreakdownRow[]
  referrers: BreakdownRow[]
  utm: BreakdownRow[]
  countries: BreakdownRow[]
  devices: BreakdownRow[]
  browsers: BreakdownRow[]
  osData: BreakdownRow[]
  events: BreakdownRow[]
  recency: { new_visitors: number; returning_visitors: number }
  firstTouch: BreakdownRow[]
  dwell: { key: string; median_ms: number; samples: number }[]
  clicks: ClickRow[]
}

function renderPage(m: ViewModel): string {
  const css = STYLES
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Pulse Analytics · petropavlov.dev</title>
  <style>${css}</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <strong>Pulse</strong>
      <span class="muted">Analytics · petropavlov.dev</span>
    </div>
    <nav class="links">
      <a href="/admin/analytics?range=${esc(m.rangeParam)}" class="active">Analytics</a>
      <a href="/admin/speed">Speed</a>
      <a href="/admin/events">Events</a>
      <a href="/admin/experiments">Experiments</a>
      <a href="/admin/marketing">Marketing</a>
    </nav>
    <div class="range">
      ${renderRangeTab('1d', m.rangeParam)}
      ${renderRangeTab('7d', m.rangeParam)}
      ${renderRangeTab('30d', m.rangeParam)}
      ${renderRangeTab('90d', m.rangeParam)}
    </div>
  </header>

  <main>
    <section class="stats">
      ${renderStat('Visitors', m.visitors, m.visitorsDelta, false, renderRecency(m.recency))}
      ${renderStat('Page Views', m.views, m.viewsDelta, false)}
      ${renderStat('Bounce Rate', m.bounce, m.bounceDelta, true)}
    </section>

    <section class="grid">
      ${renderPanel('Traffic Sources', m.channels, formatChannel)}
      ${renderPanel('First-touch attribution', m.firstTouch, formatFirstTouch)}
      ${renderPanel('Pages', m.pages, formatPath)}
      ${renderDwellPanel('Dwell time (median per page)', m.dwell)}
      ${renderPanel('Referrers', m.referrers, formatReferrer)}
      ${renderPanel('UTM Sources', m.utm)}
      ${renderPanel('Countries', m.countries, formatCountry)}
      ${renderPanel('Devices', m.devices, cap)}
      ${renderPanel('Browsers', m.browsers, cap)}
      ${renderPanel('Operating Systems', m.osData, cap)}
      ${renderPanel('Custom Events', m.events, formatEvent)}
    </section>

    <section style="margin-top: 16px;">
      ${renderClicksPanel('Top Clicked Elements', m.clicks)}
    </section>
  </main>

  <footer>
    <span class="muted">Powered by Pulse — privacy-first analytics. No cookies. No IPs stored.</span>
  </footer>
</body>
</html>`
}

function renderRangeTab(value: string, current: string): string {
  const cls = value === current ? 'tab active' : 'tab'
  return `<a class="${cls}" href="?range=${value}">${value}</a>`
}

function renderStat(
  label: string,
  value: number,
  delta: number | null,
  isPercent: boolean,
  extra: string = '',
): string {
  const display = isPercent ? `${value}%` : value.toLocaleString()
  let deltaHtml = ''
  if (delta != null) {
    const sign = delta >= 0 ? '+' : ''
    // For bounce rate, lower is better — flip the color
    const isGood = isPercent ? delta < 0 : delta >= 0
    const cls = delta === 0 ? 'delta' : isGood ? 'delta good' : 'delta bad'
    deltaHtml = `<span class="${cls}">${sign}${delta}%</span>`
  }
  return `<div class="stat">
    <div class="stat-label">${esc(label)}</div>
    <div class="stat-value">${display}</div>
    ${deltaHtml}
    ${extra}
  </div>`
}

/** Subtitle on the Visitors stat: "X new · Y returning". */
function renderRecency(r: { new_visitors: number; returning_visitors: number }): string {
  const total = r.new_visitors + r.returning_visitors
  if (total === 0) return ''
  return `<div class="stat-extra">
    <span class="muted">${r.new_visitors} new</span>
    <span class="muted-dim">·</span>
    <span class="muted">${r.returning_visitors} returning</span>
  </div>`
}

/** Dwell time panel — bar widths from samples, labels from median time. */
/**
 * Top clicked elements — full-width table since rows can be wide
 * (selector + text + host all together).
 */
function renderClicksPanel(title: string, rows: ClickRow[]): string {
  if (rows.length === 0) {
    return `<div class="panel">
      <h2>${esc(title)}</h2>
      <p class="empty">No click data yet — universal click tracking will populate this once visitors interact with the page.</p>
    </div>`
  }
  const max = Math.max(...rows.map((r) => r.clicks), 1)
  return `<div class="panel">
    <h2>${esc(title)}</h2>
    <table class="clicks-table">
      <colgroup>
        <col class="col-element" />
        <col class="col-text" />
        <col class="col-destination" />
        <col class="col-clicks" />
      </colgroup>
      <thead>
        <tr>
          <th>Element</th>
          <th>Text</th>
          <th>Destination</th>
          <th class="num">Clicks</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `<tr>
              <td class="click-element"><code>${esc(r.selector || '?')}</code></td>
              <td class="click-text">${r.text ? esc(r.text) : '<span class="muted">·</span>'}</td>
              <td class="click-host">${r.host ? esc(r.host) : '<span class="muted">·</span>'}</td>
              <td class="num count">${r.clicks}</td>
            </tr>`,
          )
          .join('')}
      </tbody>
    </table>
  </div>`
}

function renderDwellPanel(title: string, rows: { key: string; median_ms: number; samples: number }[]): string {
  if (rows.length === 0) {
    return `<div class="panel">
      <h2>${esc(title)}</h2>
      <p class="empty">No dwell data yet — visit a page and stay for at least 1 second.</p>
    </div>`
  }
  const max = Math.max(...rows.map((r) => r.samples), 1)
  return `<div class="panel">
    <h2>${esc(title)}</h2>
    <table>
      <tbody>
        ${rows
          .map((r) => {
            const pct = (r.samples / max) * 100
            const label = r.key === '/' ? '/ (home)' : r.key
            return `<tr>
              <td class="bar-cell">
                <div class="bar" style="width:${pct.toFixed(1)}%"></div>
                <span class="bar-label">${esc(label)}</span>
              </td>
              <td class="count">${formatDwell(r.median_ms)}</td>
              <td class="pct">${r.samples} ${r.samples === 1 ? 'visit' : 'visits'}</td>
            </tr>`
          })
          .join('')}
      </tbody>
    </table>
  </div>`
}

function formatDwell(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return rem > 0 ? `${m}m ${rem}s` : `${m}m`
}

/** Highlight UTMs in first-touch panel so they stand out from raw referrer hosts. */
function formatFirstTouch(s: string): string {
  if (s === '(direct)') return '<span class="muted">(direct)</span>'
  // UTM sources tend to be short slugs; referrer hosts contain dots.
  if (!s.includes('.')) return `<code>${esc(s)}</code>`
  return esc(s)
}

function renderPanel(
  title: string,
  rows: BreakdownRow[],
  formatKey: (k: string) => string = esc,
): string {
  if (rows.length === 0) {
    return `<div class="panel">
      <h2>${esc(title)}</h2>
      <p class="empty">No data yet.</p>
    </div>`
  }
  const max = Math.max(...rows.map((r) => r.visitors), 1)
  const total = rows.reduce((s, r) => s + r.visitors, 0)

  return `<div class="panel">
    <h2>${esc(title)}</h2>
    <table>
      <tbody>
        ${rows
          .map((r) => {
            const pct = (r.visitors / max) * 100
            const totalPct = total > 0 ? Math.round((r.visitors / total) * 100) : 0
            return `<tr>
              <td class="bar-cell">
                <div class="bar" style="width:${pct.toFixed(1)}%"></div>
                <span class="bar-label">${formatKey(r.key)}</span>
              </td>
              <td class="count">${r.visitors.toLocaleString()}</td>
              <td class="pct">${totalPct}%</td>
            </tr>`
          })
          .join('')}
      </tbody>
    </table>
  </div>`
}

// ─────────────────────────────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────────────────────────────

function formatPath(p: string): string {
  return esc(p === '/' ? '/ (home)' : p)
}

/** Channel badge — direct/search/social/referral with a dot color. */
function formatChannel(c: string): string {
  const colors: Record<string, string> = {
    direct: '#a1a1aa',   // zinc-400 — neutral
    search: '#60a5fa',   // blue-400
    social: '#fbbf24',   // amber-400
    referral: '#4ade80', // green-400
  }
  const dot = colors[c] || '#a1a1aa'
  const label = cap(c)
  return `<span style="display:inline-flex;align-items:center;gap:8px"><span style="width:8px;height:8px;border-radius:4px;background:${dot};display:inline-block"></span>${label}</span>`
}

/** Highlight "(direct)" rows so they stand out from real hosts. */
function formatReferrer(r: string): string {
  if (r === '(direct)') return '<span class="muted">(direct)</span>'
  return esc(r)
}

function formatCountry(c: string): string {
  if (!c || c === '??') return '<span class="muted">Unknown</span>'
  // Render ISO code + flag emoji (computed from regional indicator chars).
  const flag = c
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('')
  return `${flag} ${esc(c)}`
}

function formatEvent(e: string): string {
  // Render event names with the underscores replaced for readability.
  return `<code>${esc(e)}</code>`
}

function cap(s: string): string {
  if (!s) return esc(s)
  return esc(s[0].toUpperCase() + s.slice(1))
}

function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/[<>&"']/g, (c) => ESC_MAP[c] || c)
}
const ESC_MAP: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#39;',
}

function pctDelta(cur: number, prev: number): number | null {
  if (prev === 0) {
    if (cur === 0) return 0
    return null // can't compute % from zero
  }
  return Math.round(((cur - prev) / prev) * 100)
}

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────

const STYLES = `
:root {
  color-scheme: dark;
  --bg: #09090b;
  --surface: #18181b;
  --surface-2: #27272a;
  --border: #27272a;
  --text: #fafafa;
  --muted: #a1a1aa;
  --dim: #71717a;
  --faint: #52525b;
  --accent: #fbbf24;
  --good: #4ade80;
  --bad: #f87171;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  line-height: 1.5;
}
.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(9, 9, 11, 0.8);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}
.brand { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.brand .dot {
  width: 8px; height: 8px; border-radius: 4px; background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}
.brand strong { font-weight: 600; }
.brand .muted { color: var(--dim); margin-left: 4px; }
.links { display: flex; gap: 8px; margin-left: 16px; }
.links a {
  font-size: 13px; text-decoration: none; color: var(--muted);
  padding: 6px 10px; border-radius: 6px;
}
.links a:hover { background: var(--surface); color: var(--text); }
.links a.active { background: var(--surface); color: var(--text); }
.range { display: flex; gap: 4px; margin-left: auto; }
.tab {
  font-size: 12px; text-decoration: none; color: var(--dim);
  padding: 5px 10px; border-radius: 6px; font-family: monospace;
}
.tab:hover { background: var(--surface); color: var(--muted); }
.tab.active { background: var(--accent); color: var(--bg); font-weight: 600; }

main { padding: 24px; max-width: 1400px; margin: 0 auto; }

.stats {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;
}
.stat {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 20px 22px; display: flex; flex-direction: column; gap: 6px;
}
.stat-label {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
}
.stat-value { font-size: 36px; font-weight: 500; }
.delta {
  font-size: 12px; font-family: monospace; color: var(--dim); margin-top: 2px;
}
.delta.good { color: var(--good); }
.delta.bad { color: var(--bad); }
.stat-extra {
  font-size: 11px; font-family: monospace; color: var(--dim); margin-top: 6px;
  display: flex; gap: 8px; align-items: center;
}
.muted-dim { color: var(--faint); }

/* Top Clicked Elements table — fixed layout, no background bar.
   The selector is rendered as a code pill (the global code element
   styles) which already provides the visual anchor without needing
   a long coloured background. */
.clicks-table {
  font-size: 12px;
  table-layout: fixed;
  width: 100%;
}
.clicks-table colgroup col.col-element     { width: 32%; }
.clicks-table colgroup col.col-text        { width: 36%; }
.clicks-table colgroup col.col-destination { width: 22%; }
.clicks-table colgroup col.col-clicks      { width: 10%; }
.clicks-table th {
  text-align: left; padding: 8px 10px 8px 0; font-weight: 500;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
  border-bottom: 1px solid var(--border);
}
.clicks-table th.num { text-align: right; padding-right: 0; }
.clicks-table td {
  padding: 8px 10px 8px 0;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.clicks-table tr:hover { background: rgba(255, 255, 255, 0.02); }
.click-element code {
  font-size: 11px;
}
.click-text { color: var(--text); }
.click-host {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 11px; color: var(--muted);
}
.num { text-align: right; padding-right: 0 !important; }

.grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
  .stats { grid-template-columns: 1fr; }
}
.panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 16px 18px; overflow: hidden;
}
.panel h2 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin: 0 0 14px; font-weight: 500;
}
.panel .empty { color: var(--faint); font-size: 13px; margin: 0; }

.panel table { width: 100%; border-collapse: collapse; }
.panel td { padding: 6px 0; font-size: 13px; vertical-align: middle; }
.bar-cell {
  position: relative; padding-right: 12px !important;
  width: 100%; max-width: 0; overflow: hidden;
}
.bar {
  position: absolute; inset: 4px 0; background: var(--surface-2);
  border-radius: 4px; opacity: 0.6;
}
.bar-label {
  position: relative; padding-left: 8px; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block;
  max-width: 100%;
}
.count {
  text-align: right; font-family: monospace; font-size: 12px; color: var(--muted);
  padding-left: 12px !important; min-width: 60px;
}
.pct {
  text-align: right; font-family: monospace; font-size: 12px; color: var(--dim);
  min-width: 44px;
}
.muted { color: var(--dim); }
code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px; color: var(--accent);
  background: var(--surface-2); padding: 1px 5px; border-radius: 3px;
}
footer {
  text-align: center; padding: 32px 24px; font-size: 12px;
  border-top: 1px solid var(--border); margin-top: 32px;
}
`
