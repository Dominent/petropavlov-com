import { requireBasicAuth } from '../../../../src/pulse/server/admin-auth'
import {
  customEvents,
  funnel,
  recentEvents,
  eventsByHour,
  readingCompletion,
  parseRange,
  type BreakdownRow,
  type FunnelStage,
  type RecentEvent,
  type ReadingCompletion,
} from '../../../../src/pulse/server/index'

export const runtime = 'nodejs'

export async function GET(req: Request): Promise<Response> {
  const authFail = requireBasicAuth(req)
  if (authFail) return authFail

  const rangeParam = new URL(req.url).searchParams.get('range') ?? '7d'
  const range = parseRange(rangeParam)

  const [events, funnelData, recent, byHour, reading] = await Promise.all([
    customEvents(range),
    funnel(range),
    recentEvents(range, 50),
    eventsByHour(range),
    readingCompletion(range),
  ])

  const html = renderPage({
    rangeParam,
    events,
    funnel: funnelData,
    recent,
    byHour,
    reading,
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
  events: BreakdownRow[]
  funnel: FunnelStage[]
  recent: RecentEvent[]
  byHour: { hour: number; count: number }[]
  reading: ReadingCompletion[]
}

function renderPage(m: ViewModel): string {
  const css = STYLES
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Pulse Events · petropavlov.dev</title>
  <style>${css}</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <strong>Pulse</strong>
      <span class="muted">Events · petropavlov.dev</span>
    </div>
    <nav class="links">
      <a href="/admin/analytics">Analytics</a>
      <a href="/admin/speed">Speed</a>
      <a href="/admin/events?range=${esc(m.rangeParam)}" class="active">Events</a>
      <a href="/admin/experiments">Experiments</a>
    </nav>
    <div class="range">
      ${renderRangeTab('1d', m.rangeParam)}
      ${renderRangeTab('7d', m.rangeParam)}
      ${renderRangeTab('30d', m.rangeParam)}
      ${renderRangeTab('90d', m.rangeParam)}
    </div>
  </header>

  <main>
    <section class="funnel-section">
      <h2 class="section-label">Conversion Funnel</h2>
      <div class="funnel">${renderFunnel(m.funnel)}</div>
    </section>

    <section class="funnel-section">
      <h2 class="section-label">Reading Completion <span class="section-sub">— case studies, max scroll depth per reader</span></h2>
      ${renderReadingCompletion(m.reading)}
    </section>

    <section class="grid two-col">
      <div class="panel">
        <h2>Custom Events</h2>
        ${renderEventsBreakdown(m.events)}
      </div>
      <div class="panel">
        <h2>Events by Hour <span class="panel-sub">(UTC)</span></h2>
        ${renderHourHistogram(m.byHour)}
      </div>
    </section>

    <section>
      <div class="panel">
        <h2>Recent Events <span class="panel-sub">(latest 50, excludes page views)</span></h2>
        ${renderRecentTable(m.recent)}
      </div>
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

// ─────────────────────────────────────────────────────────────────────
// Funnel
// ─────────────────────────────────────────────────────────────────────

function renderFunnel(stages: FunnelStage[]): string {
  if (stages.length === 0 || stages[0].count === 0) {
    return `<p class="empty">No traffic yet in this window.</p>`
  }
  const top = stages[0].count
  return stages
    .map((s, i) => {
      const widthPct = top > 0 ? Math.max(2, (s.count / top) * 100) : 2
      const arrow =
        i < stages.length - 1
          ? `<div class="funnel-arrow">↓ ${stages[i + 1].pctOfPrev}% continue · ${s.count - stages[i + 1].count} drop</div>`
          : ''
      return `
        <div class="funnel-stage">
          <div class="stage-head">
            <div class="stage-num">${i + 1}</div>
            <div class="stage-info">
              <div class="stage-label">${esc(s.label)}</div>
              <div class="stage-desc">${esc(s.description)}</div>
            </div>
            <div class="stage-stats">
              <div class="stage-count">${s.count.toLocaleString()}</div>
              <div class="stage-pct">${s.pctOfTop}% of visitors</div>
            </div>
          </div>
          <div class="stage-bar-track">
            <div class="stage-bar" style="width:${widthPct.toFixed(1)}%"></div>
          </div>
        </div>
        ${arrow}
      `
    })
    .join('')
}

// ─────────────────────────────────────────────────────────────────────
// Reading completion (case studies)
// ─────────────────────────────────────────────────────────────────────

function renderReadingCompletion(rows: ReadingCompletion[]): string {
  if (rows.length === 0) {
    return `<div class="reading-empty">
      <p class="empty">No case-study traffic in this window yet — visitors haven't reached <code>/case-studies/*</code>.</p>
    </div>`
  }
  return `<div class="reading-grid">
    ${rows.map(renderReadingFunnel).join('')}
  </div>`
}

function renderReadingFunnel(r: ReadingCompletion): string {
  const slug = r.page.replace('/case-studies/', '')
  const milestones = [
    { label: 'Viewed', count: r.viewers, pct: 100 },
    { label: 'Scrolled 25%', count: r.reached_25, pct: pct(r.reached_25, r.viewers) },
    { label: 'Scrolled 50%', count: r.reached_50, pct: pct(r.reached_50, r.viewers) },
    { label: 'Scrolled 75%', count: r.reached_75, pct: pct(r.reached_75, r.viewers) },
    { label: 'Read to end', count: r.reached_100, pct: pct(r.reached_100, r.viewers) },
  ]
  return `<div class="reading-card">
    <div class="reading-head">
      <code class="reading-slug">${esc(slug)}</code>
      <span class="reading-summary">
        ${r.viewers} ${r.viewers === 1 ? 'reader' : 'readers'} · ${pct(r.reached_100, r.viewers)}% to end
      </span>
    </div>
    <div class="reading-stages">
      ${milestones
        .map(
          (m) => `<div class="reading-stage">
            <div class="reading-stage-label">${esc(m.label)}</div>
            <div class="reading-bar-track">
              <div class="reading-bar" style="width:${Math.max(2, m.pct).toFixed(1)}%"></div>
            </div>
            <div class="reading-stage-stats">
              <span class="reading-count">${m.count}</span>
              <span class="reading-pct">${m.pct}%</span>
            </div>
          </div>`,
        )
        .join('')}
    </div>
  </div>`
}

function pct(num: number, denom: number): number {
  if (denom === 0) return 0
  return Math.round((num / denom) * 100)
}

// ─────────────────────────────────────────────────────────────────────
// Custom Events bar
// ─────────────────────────────────────────────────────────────────────

function renderEventsBreakdown(rows: BreakdownRow[]): string {
  if (rows.length === 0) return `<p class="empty">No custom events yet.</p>`
  const max = Math.max(...rows.map((r) => r.visitors), 1)
  return `<table>
    <tbody>
      ${rows
        .map((r) => {
          const pct = (r.visitors / max) * 100
          return `<tr>
            <td class="bar-cell">
              <div class="bar" style="width:${pct.toFixed(1)}%"></div>
              <span class="bar-label"><code>${esc(r.key)}</code></span>
            </td>
            <td class="count">${r.visitors.toLocaleString()}</td>
          </tr>`
        })
        .join('')}
    </tbody>
  </table>`
}

// ─────────────────────────────────────────────────────────────────────
// Hour histogram
// ─────────────────────────────────────────────────────────────────────

function renderHourHistogram(rows: { hour: number; count: number }[]): string {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return `<div class="histogram">
    ${rows
      .map((r) => {
        const h = (r.count / max) * 100
        return `<div class="hist-col" title="${r.hour}:00 — ${r.count} events">
          <div class="hist-bar" style="height:${h.toFixed(1)}%"></div>
          <div class="hist-label">${r.hour % 6 === 0 ? r.hour : ''}</div>
        </div>`
      })
      .join('')}
  </div>`
}

// ─────────────────────────────────────────────────────────────────────
// Recent events table
// ─────────────────────────────────────────────────────────────────────

function renderRecentTable(rows: RecentEvent[]): string {
  if (rows.length === 0) return `<p class="empty">No events yet in this window.</p>`
  return `<table class="events-table">
    <thead>
      <tr>
        <th>When</th>
        <th>Event</th>
        <th>Page</th>
        <th>Country</th>
        <th>Device</th>
        <th>Props</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(renderRecentRow).join('')}
    </tbody>
  </table>`
}

function renderRecentRow(r: RecentEvent): string {
  const ts = new Date(r.ts)
  const time = isNaN(ts.getTime()) ? r.ts : formatRelative(ts)
  const country = r.country && r.country !== '??' ? formatCountry(r.country) : '<span class="muted">·</span>'
  const device = r.device || '<span class="muted">·</span>'
  return `<tr>
    <td class="when" title="${esc(r.ts)}">${time}</td>
    <td><code class="event-pill">${esc(r.event_type)}</code></td>
    <td class="path">${esc(r.page === '/' ? '/ (home)' : r.page)}</td>
    <td>${country}</td>
    <td class="muted">${esc(device)}</td>
    <td class="props">${formatProps(r.props)}</td>
  </tr>`
}

function formatProps(props: Record<string, unknown> | null): string {
  if (!props) return '<span class="muted">·</span>'
  return Object.entries(props)
    .map(([k, v]) => {
      const val =
        typeof v === 'object' ? JSON.stringify(v) : String(v)
      return `<span class="prop"><span class="prop-key">${esc(k)}</span>=<span class="prop-val">${esc(val)}</span></span>`
    })
    .join(' ')
}

function formatRelative(ts: Date): string {
  const now = Date.now()
  const diff = Math.max(0, now - ts.getTime())
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function formatCountry(c: string): string {
  const flag = c
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('')
  return `${flag} <span class="muted">${esc(c)}</span>`
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
  --accent-soft: rgba(251, 191, 36, 0.15);
  --good: #4ade80;
  --bad: #f87171;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.5;
}
.topbar {
  display: flex; align-items: center; gap: 24px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  background: rgba(9, 9, 11, 0.8); backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 10;
}
.brand { display: flex; align-items: center; gap: 8px; }
.brand .dot {
  width: 8px; height: 8px; border-radius: 4px; background: var(--accent);
  box-shadow: 0 0 12px var(--accent);
}
.brand .muted { color: var(--dim); margin-left: 4px; }
.links { display: flex; gap: 8px; margin-left: 16px; }
.links a {
  font-size: 13px; text-decoration: none; color: var(--muted);
  padding: 6px 10px; border-radius: 6px;
}
.links a:hover, .links a.active { background: var(--surface); color: var(--text); }
.range { display: flex; gap: 4px; margin-left: auto; }
.tab {
  font-size: 12px; text-decoration: none; color: var(--dim);
  padding: 5px 10px; border-radius: 6px; font-family: monospace;
}
.tab:hover { background: var(--surface); color: var(--muted); }
.tab.active { background: var(--accent); color: var(--bg); font-weight: 600; }

main { padding: 24px; max-width: 1400px; margin: 0 auto; }

.section-label {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin: 0 0 14px; font-weight: 500;
}
.section-sub {
  text-transform: none; letter-spacing: 0; color: var(--faint);
  font-size: 10px; margin-left: 4px;
}

/* Reading completion */
.reading-grid {
  display: grid; gap: 12px;
}
@media (min-width: 900px) {
  .reading-grid { grid-template-columns: 1fr 1fr; }
}
.reading-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 16px 18px;
}
.reading-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 12px; gap: 8px;
}
.reading-slug {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px; color: var(--accent);
  background: var(--surface-2); padding: 2px 7px; border-radius: 4px;
}
.reading-summary {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 11px; color: var(--dim);
}
.reading-stages {
  display: flex; flex-direction: column; gap: 6px;
}
.reading-stage {
  display: grid; grid-template-columns: 90px 1fr 64px;
  align-items: center; gap: 10px;
}
.reading-stage-label {
  font-size: 12px; color: var(--muted); white-space: nowrap;
}
.reading-bar-track {
  height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden;
}
.reading-bar {
  height: 100%;
  background: linear-gradient(to right, var(--accent), rgba(251, 191, 36, 0.5));
  border-radius: 3px;
}
.reading-stage-stats {
  text-align: right; display: flex; justify-content: flex-end; gap: 8px;
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
}
.reading-count { font-size: 12px; color: var(--text); min-width: 24px; }
.reading-pct { font-size: 11px; color: var(--dim); min-width: 36px; }
.reading-empty { padding: 16px 0; }

/* Funnel */
.funnel-section { margin-bottom: 32px; }
.funnel {
  display: flex; flex-direction: column; gap: 4px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 20px 24px;
}
.funnel-stage {
  background: var(--bg); border: 1px solid var(--border);
  border-radius: 10px; padding: 14px 16px;
}
.stage-head {
  display: grid; grid-template-columns: 36px 1fr auto;
  gap: 14px; align-items: center; margin-bottom: 10px;
}
.stage-num {
  width: 32px; height: 32px; border-radius: 16px;
  background: var(--surface-2); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: monospace; font-weight: 600; font-size: 13px;
}
.stage-info { min-width: 0; }
.stage-label { font-size: 14px; font-weight: 500; color: var(--text); }
.stage-desc { font-size: 12px; color: var(--dim); margin-top: 1px; }
.stage-stats { text-align: right; }
.stage-count { font-size: 22px; font-weight: 500; line-height: 1; }
.stage-pct {
  font-size: 11px; color: var(--dim); font-family: monospace; margin-top: 3px;
}
.stage-bar-track {
  height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden;
}
.stage-bar {
  height: 100%; background: linear-gradient(to right, var(--accent), rgba(251, 191, 36, 0.5));
  border-radius: 3px; transition: width 0.3s;
}
.funnel-arrow {
  text-align: center; font-size: 11px; color: var(--dim);
  font-family: monospace; padding: 4px 0;
}

/* Generic panels */
.grid { display: grid; gap: 16px; margin-bottom: 16px; }
.grid.two-col { grid-template-columns: 1fr 1fr; }
@media (max-width: 800px) { .grid.two-col { grid-template-columns: 1fr; } }

.panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 16px 18px; overflow: hidden;
}
.panel h2 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin: 0 0 14px; font-weight: 500;
  display: flex; align-items: baseline; gap: 8px;
}
.panel-sub {
  font-size: 10px; color: var(--faint); text-transform: none; letter-spacing: 0;
}
.panel .empty { color: var(--faint); font-size: 13px; margin: 0; }

/* Bars (events breakdown) */
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

/* Hour histogram */
.histogram {
  display: grid; grid-template-columns: repeat(24, 1fr); gap: 2px;
  height: 140px; align-items: end; padding: 4px 0;
}
.hist-col {
  display: flex; flex-direction: column; align-items: stretch; gap: 4px;
  height: 100%; justify-content: end;
}
.hist-bar {
  background: linear-gradient(to top, var(--accent-soft), rgba(251, 191, 36, 0.6));
  border-radius: 2px 2px 0 0; min-height: 1px;
  transition: opacity 0.15s;
}
.hist-col:hover .hist-bar { opacity: 0.6; }
.hist-label {
  font-family: monospace; font-size: 9px; color: var(--faint);
  text-align: center; min-height: 12px;
}

/* Recent events table */
.events-table { font-size: 12px; }
.events-table th {
  text-align: left; padding: 8px 12px 8px 0; font-weight: 500;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
  border-bottom: 1px solid var(--border);
}
.events-table td {
  padding: 7px 12px 7px 0; border-bottom: 1px solid var(--border);
}
.events-table tr:last-child td { border-bottom: none; }
.events-table tr:hover { background: rgba(255, 255, 255, 0.02); }
.when {
  font-family: monospace; font-size: 11px; color: var(--dim); white-space: nowrap;
}
.path {
  font-family: monospace; font-size: 11px; color: var(--muted);
  max-width: 200px; overflow: hidden; text-overflow: ellipsis;
}
.event-pill {
  background: var(--accent-soft); color: var(--accent);
  padding: 2px 7px; border-radius: 4px; font-size: 11px;
  font-family: monospace; white-space: nowrap;
}
.props { font-family: monospace; font-size: 11px; }
.prop {
  display: inline-block; margin-right: 8px; white-space: nowrap;
}
.prop-key { color: var(--dim); }
.prop-val { color: var(--accent); }

code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px; color: var(--accent);
  background: var(--surface-2); padding: 1px 5px; border-radius: 3px;
}
.muted { color: var(--dim); }
footer {
  text-align: center; padding: 32px 24px; font-size: 12px;
  border-top: 1px solid var(--border); margin-top: 32px;
}
`
