import { requireBasicAuth } from '../../../../src/pulse/server/admin-auth'
import {
  vitalsPercentiles,
  vitalsByDimension,
  computeRES,
  parseRange,
  type Percentile,
  type Metric,
  type VitalByDim,
} from '../../../../src/pulse/server/index'

export const runtime = 'nodejs'

const VALID_PCT: Percentile[] = [75, 90, 95, 99]

export async function GET(req: Request): Promise<Response> {
  const authFail = requireBasicAuth(req)
  if (authFail) return authFail

  const params = new URL(req.url).searchParams
  const rangeParam = params.get('range') ?? '7d'
  const pctParam = Number(params.get('pct'))
  const pct: Percentile = (VALID_PCT as number[]).includes(pctParam)
    ? (pctParam as Percentile)
    : 75
  const range = parseRange(rangeParam)

  const [percentiles, byPage, byCountry] = await Promise.all([
    vitalsPercentiles(range, pct),
    vitalsByDimension(range, 'page'),
    vitalsByDimension(range, 'country'),
  ])

  const res_score = computeRES(percentiles)

  const html = renderPage({
    rangeParam,
    pct,
    res: res_score,
    percentiles,
    byPage,
    byCountry,
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
  pct: Percentile
  res: number
  percentiles: Record<Metric, number>
  byPage: VitalByDim[]
  byCountry: VitalByDim[]
}

function renderPage(m: ViewModel): string {
  const css = STYLES
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Pulse Speed · petropavlov.dev</title>
  <style>${css}</style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <strong>Pulse</strong>
      <span class="muted">Speed · petropavlov.dev</span>
    </div>
    <nav class="links">
      <a href="/admin/analytics">Analytics</a>
      <a href="/admin/speed?range=${esc(m.rangeParam)}&pct=${m.pct}" class="active">Speed</a>
      <a href="/admin/events">Events</a>
      <a href="/admin/experiments">Experiments</a>
      <a href="/admin/marketing">Marketing</a>
    </nav>
    <div class="range">
      ${renderTab('range', '1d', m.rangeParam, m.pct)}
      ${renderTab('range', '7d', m.rangeParam, m.pct)}
      ${renderTab('range', '30d', m.rangeParam, m.pct)}
      ${renderTab('range', '90d', m.rangeParam, m.pct)}
    </div>
    <div class="range" style="margin-left:8px">
      ${renderTab('pct', '75', m.rangeParam, m.pct)}
      ${renderTab('pct', '90', m.rangeParam, m.pct)}
      ${renderTab('pct', '95', m.rangeParam, m.pct)}
      ${renderTab('pct', '99', m.rangeParam, m.pct)}
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="res-card ${resClass(m.res)}">
        <div class="res-label">Real Experience Score</div>
        <div class="res-value">${m.res}</div>
        <div class="res-status">${resStatus(m.res)}</div>
      </div>
      <p class="res-blurb">
        Composite of LCP (25%), INP (25%), CLS (25%), FCP (15%), TTFB (10%) —
        ${m.pct}th percentile across all visitors in the selected window.
      </p>
    </section>

    <section class="metrics">
      ${renderMetric('FCP', m.percentiles.FCP, 1800, 3000, 'ms')}
      ${renderMetric('LCP', m.percentiles.LCP, 2500, 4000, 'ms')}
      ${renderMetric('INP', m.percentiles.INP, 200, 500, 'ms')}
      ${renderMetric('CLS', m.percentiles.CLS, 0.1, 0.25, '')}
      ${renderMetric('FID', m.percentiles.FID, 100, 300, 'ms')}
      ${renderMetric('TTFB', m.percentiles.TTFB, 800, 1800, 'ms')}
    </section>

    <section class="grid">
      ${renderDimPanel('Pages', m.byPage)}
      ${renderDimPanel('Countries', m.byCountry, true)}
    </section>
  </main>

  <footer>
    <span class="muted">Powered by Pulse — privacy-first analytics. No cookies. No IPs stored.</span>
  </footer>
</body>
</html>`
}

function renderTab(kind: 'range' | 'pct', value: string, range: string, pct: Percentile): string {
  let href: string
  let active: boolean
  if (kind === 'range') {
    href = `?range=${value}&pct=${pct}`
    active = value === range
  } else {
    href = `?range=${range}&pct=${value}`
    active = String(pct) === value
  }
  const cls = active ? 'tab active' : 'tab'
  const label = kind === 'pct' ? `P${value}` : value
  return `<a class="${cls}" href="${href}">${label}</a>`
}

function renderMetric(
  name: Metric,
  value: number | undefined,
  good: number,
  poor: number,
  unit: string,
): string {
  if (value == null) {
    return `<div class="metric metric-none">
      <div class="metric-label">${name}</div>
      <div class="metric-value">—</div>
      <div class="metric-status">No samples</div>
    </div>`
  }
  const status = value <= good ? 'good' : value >= poor ? 'bad' : 'mid'
  const statusLabel = status === 'good' ? 'Great' : status === 'bad' ? 'Poor' : 'Needs work'
  const display = unit === 'ms' ? (value < 1000 ? `${Math.round(value)}` : `${(value / 1000).toFixed(2)}`) : value.toFixed(2)
  const displayUnit = unit === 'ms' && value >= 1000 ? 's' : unit
  return `<div class="metric metric-${status}">
    <div class="metric-label">${name}</div>
    <div class="metric-value">${display}<span class="metric-unit">${displayUnit}</span></div>
    <div class="metric-status">${statusLabel}</div>
  </div>`
}

function renderDimPanel(title: string, rows: VitalByDim[], withFlag = false): string {
  if (rows.length === 0) {
    return `<div class="panel">
      <h2>${esc(title)}</h2>
      <p class="empty">No data yet.</p>
    </div>`
  }
  return `<div class="panel">
    <h2>${esc(title)}</h2>
    <table>
      <tbody>
        ${rows
          .map((r) => {
            const key = withFlag ? formatCountry(r.key) : esc(r.key === '/' ? '/ (home)' : r.key)
            const cls = resClass(r.res)
            return `<tr>
              <td class="bar-cell">
                <span class="bar-label">${key}</span>
              </td>
              <td class="count">${r.samples}</td>
              <td class="res-pill ${cls}">${r.res}</td>
            </tr>`
          })
          .join('')}
      </tbody>
    </table>
  </div>`
}

function resClass(score: number): string {
  if (score >= 90) return 'good'
  if (score >= 50) return 'mid'
  return 'bad'
}
function resStatus(score: number): string {
  if (score >= 90) return 'Great · above 90'
  if (score >= 50) return 'Needs improvement · 50–90'
  return 'Poor · below 50'
}

function formatCountry(c: string): string {
  if (!c || c === '??') return '<span class="muted">Unknown</span>'
  const flag = c
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('')
  return `${flag} ${esc(c)}`
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
  --good: #4ade80;
  --mid: #fbbf24;
  --bad: #f87171;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.5;
}
.topbar {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  background: rgba(9, 9, 11, 0.8); backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 10; flex-wrap: wrap;
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
.range:nth-of-type(2) { margin-left: 0; }
.tab {
  font-size: 12px; text-decoration: none; color: var(--dim);
  padding: 5px 10px; border-radius: 6px; font-family: monospace;
}
.tab:hover { background: var(--surface); color: var(--muted); }
.tab.active { background: var(--accent); color: var(--bg); font-weight: 600; }

main { padding: 24px; max-width: 1400px; margin: 0 auto; }

.hero {
  display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: center;
  margin-bottom: 32px;
}
.res-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 24px 32px; display: flex; flex-direction: column; align-items: center;
  min-width: 220px; text-align: center;
}
.res-card.good { border-color: var(--good); box-shadow: 0 0 24px -8px var(--good); }
.res-card.mid  { border-color: var(--mid);  box-shadow: 0 0 24px -8px var(--mid); }
.res-card.bad  { border-color: var(--bad);  box-shadow: 0 0 24px -8px var(--bad); }
.res-label {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin-bottom: 4px;
}
.res-value { font-size: 64px; font-weight: 600; line-height: 1; margin: 6px 0; }
.res-status { font-size: 12px; color: var(--muted); font-family: monospace; }
.res-blurb { color: var(--muted); font-size: 13px; max-width: 480px; margin: 0; }

.metrics {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 32px;
}
@media (max-width: 900px) { .metrics { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 500px) { .metrics { grid-template-columns: repeat(2, 1fr); } }
.metric {
  background: var(--surface); border: 1px solid var(--border); border-radius: 10px;
  padding: 12px 14px; display: flex; flex-direction: column; gap: 2px;
}
.metric-label {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
}
.metric-value {
  font-size: 22px; font-weight: 500; line-height: 1.2;
}
.metric-unit {
  font-size: 12px; color: var(--dim); margin-left: 3px;
}
.metric-status {
  font-size: 10px; font-family: monospace; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--dim);
}
.metric-good { border-color: rgba(74, 222, 128, 0.4); }
.metric-good .metric-status { color: var(--good); }
.metric-mid { border-color: rgba(251, 191, 36, 0.4); }
.metric-mid .metric-status { color: var(--mid); }
.metric-bad { border-color: rgba(248, 113, 113, 0.4); }
.metric-bad .metric-status { color: var(--bad); }
.metric-none { opacity: 0.5; }

.grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
}
@media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }
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
.panel td { padding: 8px 0; font-size: 13px; vertical-align: middle; }
.bar-cell { width: 100%; max-width: 0; }
.bar-label {
  color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: inline-block; max-width: 100%;
}
.count {
  text-align: right; font-family: monospace; font-size: 11px; color: var(--dim);
  padding: 0 12px !important; min-width: 50px;
}
.res-pill {
  text-align: right; font-family: monospace; font-size: 12px;
  padding: 2px 8px !important; border-radius: 4px; min-width: 48px;
  font-weight: 600;
}
.res-pill.good { color: var(--good); background: rgba(74, 222, 128, 0.1); }
.res-pill.mid { color: var(--mid); background: rgba(251, 191, 36, 0.1); }
.res-pill.bad { color: var(--bad); background: rgba(248, 113, 113, 0.1); }
.muted { color: var(--dim); }
footer {
  text-align: center; padding: 32px 24px; font-size: 12px;
  border-top: 1px solid var(--border); margin-top: 32px;
}
`
