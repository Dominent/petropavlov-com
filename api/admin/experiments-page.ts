// Admin UI for experiments — HTML page at /admin/experiments (mapped
// via vercel.json rewrite). Same visual style as /admin/analytics +
// /admin/speed + /admin/events. Handles its own CRUD via
// POST-Redirect-GET so no client-side JS needed; the parallel JSON
// API at /api/admin/experiments is for programmatic access.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { requireBasicAuth } from '../_lib/auth.js'
import { experimentResults, type ExperimentResult } from '../../src/pulse/server/index.js'

type Status = 'draft' | 'running' | 'paused' | 'concluded'
type Variant = { name: string; weight: number }

type ExperimentRow = {
  id: number
  key: string
  name: string
  description: string | null
  status: Status
  variants: Variant[]
  success_event: string
  success_filter: Record<string, string> | null
  winner: string | null
  created_at: string
  started_at: string | null
  ended_at: string | null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireBasicAuth(req, res)) return

  try {
    if (req.method === 'POST') return await handlePost(req, res)
    const key = typeof req.query.key === 'string' ? req.query.key : null
    if (key) return await renderDetail(key, res)
    return await renderList(res)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin/experiments-page error:', msg)
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.status(500).send(renderError(msg))
  }
}

// ─────────────────────────────────────────────────────────────────────
// POST handler — all mutations dispatched by _action field
// ─────────────────────────────────────────────────────────────────────

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = (req.body ?? {}) as Record<string, string>
  const action = body._action
  const key = body.key || (typeof req.query.key === 'string' ? req.query.key : '')

  if (action === 'create') {
    if (!key || !/^[a-z][a-z0-9_-]*$/.test(key)) {
      return redirect(res, '/admin/experiments?error=bad_key')
    }
    if (!body.name) return redirect(res, '/admin/experiments?error=missing_name')
    if (!body.success_event) return redirect(res, '/admin/experiments?error=missing_event')
    const variants: Variant[] = [
      { name: body.variant_a_name || 'a', weight: parseInt(body.variant_a_weight, 10) || 50 },
      { name: body.variant_b_name || 'b', weight: parseInt(body.variant_b_weight, 10) || 50 },
    ]
    const successFilter = parseFilter(body.success_filter)
    await sql`
      INSERT INTO experiments
        (key, name, description, variants, success_event, success_filter)
      VALUES
        (${key}, ${body.name}, ${body.description || null},
         ${JSON.stringify(variants)}::jsonb, ${body.success_event},
         ${successFilter ? JSON.stringify(successFilter) : null}::jsonb)
    `
    return redirect(res, `/admin/experiments?key=${encodeURIComponent(key)}`)
  }

  if (action === 'update') {
    if (!key) return redirect(res, '/admin/experiments?error=missing_key')
    const variants: Variant[] = [
      { name: body.variant_a_name || 'a', weight: parseInt(body.variant_a_weight, 10) || 50 },
      { name: body.variant_b_name || 'b', weight: parseInt(body.variant_b_weight, 10) || 50 },
    ]
    const successFilter = parseFilter(body.success_filter)
    await sql`
      UPDATE experiments
      SET name = ${body.name},
          description = ${body.description || null},
          variants = ${JSON.stringify(variants)}::jsonb,
          success_event = ${body.success_event},
          success_filter = ${successFilter ? JSON.stringify(successFilter) : null}::jsonb
      WHERE key = ${key}
    `
    return redirect(res, `/admin/experiments?key=${encodeURIComponent(key)}`)
  }

  if (action === 'status') {
    if (!key) return redirect(res, '/admin/experiments?error=missing_key')
    const status = body.status as Status
    if (!['draft','running','paused','concluded'].includes(status)) {
      return redirect(res, `/admin/experiments?key=${encodeURIComponent(key)}&error=bad_status`)
    }
    if (status === 'running') {
      // Only set started_at on first transition to running, so pause+resume doesn't reset.
      await sql`
        UPDATE experiments
        SET status = 'running',
            started_at = COALESCE(started_at, now())
        WHERE key = ${key}
      `
    } else if (status === 'concluded') {
      await sql`
        UPDATE experiments
        SET status = 'concluded',
            ended_at = now(),
            winner = ${body.winner || null}
        WHERE key = ${key}
      `
    } else {
      await sql`UPDATE experiments SET status = ${status} WHERE key = ${key}`
    }
    return redirect(res, `/admin/experiments?key=${encodeURIComponent(key)}`)
  }

  if (action === 'delete') {
    if (!key) return redirect(res, '/admin/experiments?error=missing_key')
    const { rows } = await sql`SELECT status FROM experiments WHERE key = ${key}`
    if (rows.length === 0) return redirect(res, '/admin/experiments?error=not_found')
    if (!['draft','concluded'].includes(rows[0].status as string)) {
      return redirect(
        res,
        `/admin/experiments?key=${encodeURIComponent(key)}&error=pause_first`,
      )
    }
    await sql`DELETE FROM experiments WHERE key = ${key}`
    return redirect(res, '/admin/experiments?deleted=1')
  }

  return redirect(res, '/admin/experiments?error=unknown_action')
}

function redirect(res: VercelResponse, location: string): void {
  // 303 forces the next request to be GET, completing the
  // POST-Redirect-GET pattern correctly.
  res.setHeader('Location', location)
  res.status(303).end()
}

function parseFilter(raw: string | undefined): Record<string, string> | null {
  if (!raw || !raw.trim()) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string') clean[k] = v
    }
    return Object.keys(clean).length > 0 ? clean : null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────
// List view
// ─────────────────────────────────────────────────────────────────────

async function renderList(res: VercelResponse) {
  const { rows } = await sql`SELECT * FROM experiments ORDER BY created_at DESC`
  const experiments = rows.map(rowToExperiment)

  // For each non-draft experiment, attach results so the row can show
  // sample sizes + conversion + p-value at a glance.
  const enriched = await Promise.all(
    experiments.map(async (e) => ({
      ...e,
      results: e.status === 'draft' ? null : await experimentResults(e.key, e.success_event, e.success_filter),
    })),
  )

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(renderListPage(enriched))
}

function renderListPage(experiments: (ExperimentRow & { results: ExperimentResult | null })[]): string {
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Experiments · Pulse</title>
  <style>${STYLES}</style>
</head>
<body>
  ${renderTopbar('experiments')}

  <main>
    <section style="margin-bottom: 24px;">
      <h1 class="page-title">Experiments</h1>
      <p class="page-sub">
        A/B tests on petropavlov.dev. Variants live in code; this page configures
        which experiments are active, their traffic split, and the success metric.
        Stats use a Wilson 95% CI and a two-proportion z-test against variant A.
      </p>
    </section>

    <section class="panel" style="margin-bottom: 24px;">
      <h2>Experiments (${experiments.length})</h2>
      ${experiments.length === 0
        ? `<p class="empty">No experiments yet — create one below.</p>`
        : renderExperimentsTable(experiments)}
    </section>

    <section class="panel">
      <h2>New experiment</h2>
      ${renderCreateForm()}
    </section>
  </main>

  <footer>
    <span class="muted">Pulse · A/B framework · variants in code, config in DB</span>
  </footer>
</body>
</html>`
}

function renderExperimentsTable(
  experiments: (ExperimentRow & { results: ExperimentResult | null })[],
): string {
  return `<table class="exp-table">
    <thead>
      <tr>
        <th>Key</th>
        <th>Name</th>
        <th>Status</th>
        <th>Success metric</th>
        <th class="num">Variants</th>
        <th class="num">Sessions</th>
        <th class="num">Lift</th>
        <th class="num">p</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${experiments.map(renderExperimentRow).join('')}
    </tbody>
  </table>`
}

function renderExperimentRow(e: ExperimentRow & { results: ExperimentResult | null }): string {
  const totalSessions = e.results?.variants.reduce((s, v) => s + v.sessions, 0) ?? 0
  const liftCell = e.results?.comparison
    ? renderLiftCell(e.results.comparison.lift_pp)
    : `<span class="dim">—</span>`
  const pCell = e.results?.comparison
    ? formatPValue(e.results.comparison.p)
    : `<span class="dim">—</span>`
  return `<tr>
    <td><a href="/admin/experiments?key=${esc(e.key)}"><code>${esc(e.key)}</code></a></td>
    <td>${esc(e.name)}</td>
    <td>${renderStatusBadge(e.status)}</td>
    <td><code class="event">${esc(e.success_event)}${e.success_filter ? `<span class="dim"> ${esc(JSON.stringify(e.success_filter))}</span>` : ''}</code></td>
    <td class="num">${e.variants.map(v => `${esc(v.name)}·${v.weight}`).join(' / ')}</td>
    <td class="num">${totalSessions || `<span class="dim">0</span>`}</td>
    <td class="num">${liftCell}</td>
    <td class="num">${pCell}</td>
    <td class="num">
      <a class="action" href="/admin/experiments?key=${esc(e.key)}">view</a>
    </td>
  </tr>`
}

function renderCreateForm(): string {
  return `<form method="POST" action="/admin/experiments" class="form">
    <input type="hidden" name="_action" value="create" />
    <div class="form-row">
      <label>
        <span>Key <span class="dim">(slug, lowercase)</span></span>
        <input name="key" required pattern="[a-z][a-z0-9_-]*" placeholder="hero" />
      </label>
      <label>
        <span>Name</span>
        <input name="name" required placeholder="Hero alternates · tight vs current" />
      </label>
    </div>
    <label>
      <span>Description <span class="dim">(optional)</span></span>
      <textarea name="description" rows="2" placeholder="What hypothesis are we testing?"></textarea>
    </label>
    <div class="form-row">
      <label>
        <span>Variant A name</span>
        <input name="variant_a_name" value="a" required />
      </label>
      <label>
        <span>Weight</span>
        <input name="variant_a_weight" type="number" min="0" max="100" value="50" required />
      </label>
      <label>
        <span>Variant B name</span>
        <input name="variant_b_name" value="b" required />
      </label>
      <label>
        <span>Weight</span>
        <input name="variant_b_weight" type="number" min="0" max="100" value="50" required />
      </label>
    </div>
    <div class="form-row">
      <label>
        <span>Success event</span>
        ${renderEventSelect('success_event')}
      </label>
      <label>
        <span>Filter <span class="dim">(JSON, optional)</span></span>
        <input name="success_filter" placeholder='{"section":"work"}' />
      </label>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn primary">Create (as draft)</button>
      <span class="dim">Variants are React components in code. Wire <code>useExperiment('&lt;key&gt;')</code> in the component you want to test, then create the experiment here.</span>
    </div>
  </form>`
}

// ─────────────────────────────────────────────────────────────────────
// Detail view
// ─────────────────────────────────────────────────────────────────────

async function renderDetail(key: string, res: VercelResponse) {
  const { rows } = await sql`SELECT * FROM experiments WHERE key = ${key}`
  if (rows.length === 0) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return res.status(404).send(renderError(`Experiment not found: ${key}`))
  }
  const e = rowToExperiment(rows[0])
  const results = e.status === 'draft' ? null : await experimentResults(e.key, e.success_event, e.success_filter)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).send(renderDetailPage(e, results))
}

function renderDetailPage(e: ExperimentRow, results: ExperimentResult | null): string {
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${esc(e.name)} · Experiments · Pulse</title>
  <style>${STYLES}</style>
</head>
<body>
  ${renderTopbar('experiments')}

  <main>
    <section style="margin-bottom: 16px;">
      <a href="/admin/experiments" class="back">← all experiments</a>
    </section>

    <section style="margin-bottom: 24px;">
      <h1 class="page-title">${esc(e.name)} ${renderStatusBadge(e.status)}</h1>
      <p class="page-sub">
        <code>${esc(e.key)}</code> · created ${formatDate(e.created_at)}
        ${e.started_at ? `· started ${formatDate(e.started_at)}` : ''}
        ${e.ended_at ? `· ended ${formatDate(e.ended_at)}` : ''}
        ${e.winner ? `· winner <strong>${esc(e.winner)}</strong>` : ''}
      </p>
      ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ''}
    </section>

    <section class="panel" style="margin-bottom: 24px;">
      <h2>Results</h2>
      ${results ? renderResults(results) : `<p class="empty">Experiment is in draft — start it to collect data.</p>`}
    </section>

    <section class="panel" style="margin-bottom: 24px;">
      <h2>Status</h2>
      ${renderStatusControls(e)}
    </section>

    <section class="panel" style="margin-bottom: 24px;">
      <h2>Edit</h2>
      ${renderEditForm(e)}
    </section>

    ${['draft','concluded'].includes(e.status) ? `
    <section class="panel danger">
      <h2>Danger zone</h2>
      <form method="POST" action="/admin/experiments" onsubmit="return confirm('Delete experiment ${esc(e.key)}? This cannot be undone.');">
        <input type="hidden" name="_action" value="delete" />
        <input type="hidden" name="key" value="${esc(e.key)}" />
        <button type="submit" class="btn danger">Delete experiment</button>
        <span class="dim">Only available while draft or concluded.</span>
      </form>
    </section>
    ` : ''}
  </main>

  <footer>
    <span class="muted">Pulse · A/B framework</span>
  </footer>
</body>
</html>`
}

function renderResults(r: ExperimentResult): string {
  if (r.variants.length === 0) {
    return `<p class="empty">No data yet — variants haven't been assigned to any sessions.</p>`
  }

  const rowsHtml = r.variants.map((v, i) => {
    const pct = (v.rate * 100).toFixed(1)
    const ciLow = (v.ci95_low * 100).toFixed(1)
    const ciHigh = (v.ci95_high * 100).toFixed(1)
    return `<tr>
      <td><code>${esc(v.variant)}</code>${i === 0 ? ` <span class="dim">(control)</span>` : ''}</td>
      <td class="num">${v.sessions}</td>
      <td class="num">${v.conversions}</td>
      <td class="num"><strong>${pct}%</strong></td>
      <td class="num dim">[${ciLow}, ${ciHigh}]</td>
    </tr>`
  }).join('')

  let comparisonHtml = ''
  if (r.comparison) {
    const liftPp = (r.comparison.lift_pp * 100).toFixed(1)
    const liftRel = (r.comparison.lift_rel * 100).toFixed(0)
    const sign = r.comparison.lift_pp >= 0 ? '+' : ''
    const liftClass = r.comparison.lift_pp > 0 ? 'good' : r.comparison.lift_pp < 0 ? 'bad' : 'dim'
    const pStr = formatPValue(r.comparison.p)
    const verdict = r.comparison.p < 0.05
      ? (r.comparison.lift_pp > 0 ? 'Variant B significantly outperforms A. Consider shipping B.' :
         'Variant A significantly outperforms B. Consider keeping A.')
      : 'Not yet statistically significant. Keep collecting data.'
    comparisonHtml = `<div class="comparison">
      <div class="metric">
        <span class="metric-label">Lift</span>
        <span class="metric-value ${liftClass}">${sign}${liftPp}pp</span>
        <span class="metric-sub dim">(${sign}${liftRel}% relative)</span>
      </div>
      <div class="metric">
        <span class="metric-label">z-score</span>
        <span class="metric-value">${r.comparison.z.toFixed(2)}</span>
      </div>
      <div class="metric">
        <span class="metric-label">p-value</span>
        <span class="metric-value">${pStr}</span>
      </div>
      <p class="verdict">${verdict}</p>
    </div>`
  }

  return `<table class="results-table">
    <thead>
      <tr>
        <th>Variant</th>
        <th class="num">Sessions</th>
        <th class="num">Conversions</th>
        <th class="num">Rate</th>
        <th class="num">95% CI</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
  ${comparisonHtml}`
}

function renderStatusControls(e: ExperimentRow): string {
  const transitions: { label: string; status: Status; primary?: boolean; danger?: boolean }[] = []
  if (e.status === 'draft')     transitions.push({ label: 'Start', status: 'running', primary: true })
  if (e.status === 'running')   transitions.push({ label: 'Pause', status: 'paused' })
  if (e.status === 'paused')    transitions.push({ label: 'Resume', status: 'running', primary: true })
  if (e.status === 'running' || e.status === 'paused') {
    transitions.push({ label: 'Conclude — ship A', status: 'concluded' })
    transitions.push({ label: 'Conclude — ship B', status: 'concluded' })
  }

  if (transitions.length === 0) {
    return `<p class="empty">No transitions available from <code>${esc(e.status)}</code>.</p>`
  }

  const variantA = e.variants[0]?.name || 'a'
  const variantB = e.variants[1]?.name || 'b'

  return transitions.map(t => {
    const winner = t.label.includes('ship A') ? variantA
                 : t.label.includes('ship B') ? variantB
                 : ''
    const cls = t.primary ? 'btn primary' : t.danger ? 'btn danger' : 'btn'
    return `<form method="POST" action="/admin/experiments" style="display:inline-block; margin-right:8px;">
      <input type="hidden" name="_action" value="status" />
      <input type="hidden" name="key" value="${esc(e.key)}" />
      <input type="hidden" name="status" value="${t.status}" />
      ${winner ? `<input type="hidden" name="winner" value="${esc(winner)}" />` : ''}
      <button type="submit" class="${cls}">${esc(t.label)}</button>
    </form>`
  }).join('')
}

function renderEditForm(e: ExperimentRow): string {
  return `<form method="POST" action="/admin/experiments" class="form">
    <input type="hidden" name="_action" value="update" />
    <input type="hidden" name="key" value="${esc(e.key)}" />
    <label>
      <span>Name</span>
      <input name="name" value="${esc(e.name)}" required />
    </label>
    <label>
      <span>Description</span>
      <textarea name="description" rows="2">${esc(e.description || '')}</textarea>
    </label>
    <div class="form-row">
      <label>
        <span>Variant A name</span>
        <input name="variant_a_name" value="${esc(e.variants[0]?.name || 'a')}" required />
      </label>
      <label>
        <span>Weight</span>
        <input name="variant_a_weight" type="number" min="0" max="100" value="${e.variants[0]?.weight || 50}" required />
      </label>
      <label>
        <span>Variant B name</span>
        <input name="variant_b_name" value="${esc(e.variants[1]?.name || 'b')}" required />
      </label>
      <label>
        <span>Weight</span>
        <input name="variant_b_weight" type="number" min="0" max="100" value="${e.variants[1]?.weight || 50}" required />
      </label>
    </div>
    <div class="form-row">
      <label>
        <span>Success event</span>
        ${renderEventSelect('success_event', e.success_event)}
      </label>
      <label>
        <span>Filter (JSON)</span>
        <input name="success_filter" value="${esc(e.success_filter ? JSON.stringify(e.success_filter) : '')}" />
      </label>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn primary">Save</button>
    </div>
  </form>`
}

// ─────────────────────────────────────────────────────────────────────
// Shared rendering helpers
// ─────────────────────────────────────────────────────────────────────

function renderTopbar(active: 'analytics' | 'speed' | 'events' | 'experiments'): string {
  const link = (name: string, href: string) =>
    `<a href="${href}" class="${active === name ? 'active' : ''}">${name[0].toUpperCase() + name.slice(1)}</a>`
  return `<header class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <strong>Pulse</strong>
      <span class="muted">${active === 'experiments' ? 'Experiments' : 'Analytics'} · petropavlov.dev</span>
    </div>
    <nav class="links">
      ${link('analytics', '/admin/analytics')}
      ${link('speed', '/admin/speed')}
      ${link('events', '/admin/events')}
      ${link('experiments', '/admin/experiments')}
    </nav>
  </header>`
}

function renderStatusBadge(s: Status): string {
  const cls = `badge badge-${s}`
  return `<span class="${cls}">${s}</span>`
}

function renderLiftCell(liftPp: number): string {
  const sign = liftPp >= 0 ? '+' : ''
  const cls = liftPp > 0.005 ? 'good' : liftPp < -0.005 ? 'bad' : 'dim'
  return `<span class="${cls}">${sign}${(liftPp * 100).toFixed(1)}pp</span>`
}

function formatPValue(p: number): string {
  if (p < 0.001) return '<0.001'
  if (p < 0.01) return p.toFixed(3)
  if (p < 0.1) return p.toFixed(2)
  return p.toFixed(2)
}

function renderEventSelect(name: string, current?: string): string {
  const opts = [
    'view', 'click', 'cal_click', 'cv_download', 'contact_open', 'contact_submit',
    'section_view', 'nav_click', 'project_click', 'cta_click', 'ask_query',
    'ask_prompt_click', 'outbound',
  ]
  return `<select name="${name}" required>
    ${opts.map(e => `<option value="${e}"${e === current ? ' selected' : ''}>${e}</option>`).join('')}
  </select>`
}

function renderError(msg: string): string {
  return `<!doctype html>
<html lang="en" class="dark">
<head><title>Error</title><style>${STYLES}</style></head>
<body>
  ${renderTopbar('experiments')}
  <main>
    <h1 class="page-title">Error</h1>
    <p class="page-sub">${esc(msg)}</p>
    <p><a class="back" href="/admin/experiments">← back to experiments</a></p>
  </main>
</body>
</html>`
}

function rowToExperiment(r: Record<string, unknown>): ExperimentRow {
  return {
    id: Number(r.id),
    key: String(r.key),
    name: String(r.name),
    description: r.description == null ? null : String(r.description),
    status: String(r.status) as Status,
    variants: Array.isArray(r.variants) ? (r.variants as Variant[]) : [],
    success_event: String(r.success_event),
    success_filter: (r.success_filter as Record<string, string>) ?? null,
    winner: r.winner == null ? null : String(r.winner),
    created_at: String(r.created_at),
    started_at: r.started_at == null ? null : String(r.started_at),
    ended_at: r.ended_at == null ? null : String(r.ended_at),
  }
}

function formatDate(s: string): string {
  return new Date(s).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// ─────────────────────────────────────────────────────────────────────
// Styles — match /admin/analytics + /admin/speed + /admin/events
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
  --warning: #fbbf24;
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

main { padding: 24px; max-width: 1200px; margin: 0 auto; }
.page-title { font-size: 24px; font-weight: 500; margin: 0 0 6px; display: flex; align-items: center; gap: 12px; }
.page-sub { color: var(--dim); margin: 0 0 8px; max-width: 720px; font-size: 13px; }
.desc { color: var(--muted); margin: 8px 0 0; max-width: 720px; }
.back {
  font-family: monospace; font-size: 12px; color: var(--dim);
  text-decoration: none; transition: color 0.15s;
}
.back:hover { color: var(--accent); }
code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px; color: var(--accent);
  background: var(--surface-2); padding: 1px 5px; border-radius: 3px;
}
code.event { color: var(--muted); }

.panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px 20px; overflow: hidden;
}
.panel h2 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin: 0 0 14px; font-weight: 500;
}
.panel.danger { border-color: rgba(248, 113, 113, 0.25); }
.panel.danger h2 { color: var(--bad); }
.empty { color: var(--faint); font-size: 13px; margin: 0; }

/* Tables */
.exp-table, .results-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.exp-table th, .results-table th {
  text-align: left; padding: 8px 10px 8px 0; font-weight: 500;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
  border-bottom: 1px solid var(--border);
}
.exp-table th.num, .results-table th.num { text-align: right; padding-right: 0; }
.exp-table td, .results-table td {
  padding: 10px 10px 10px 0; vertical-align: middle;
  border-bottom: 1px solid rgba(39, 39, 42, 0.5);
}
.exp-table tr:last-child td, .results-table tr:last-child td { border-bottom: none; }
.exp-table tr:hover { background: rgba(255, 255, 255, 0.02); }
.exp-table td.num, .results-table td.num { text-align: right; padding-right: 0; font-family: monospace; }
.exp-table a { color: var(--accent); text-decoration: none; }
.exp-table a:hover { text-decoration: underline; }
.action {
  font-family: monospace; font-size: 11px; color: var(--dim);
  text-decoration: none; padding: 3px 8px; border-radius: 4px;
  border: 1px solid var(--border);
}
.action:hover { color: var(--accent); border-color: var(--accent); }

/* Status badges */
.badge {
  display: inline-block; font-size: 10px; font-family: monospace;
  text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px;
  border-radius: 4px; font-weight: 500;
}
.badge-draft     { background: rgba(161, 161, 170, 0.12); color: var(--muted); }
.badge-running   { background: rgba(74, 222, 128, 0.15);  color: var(--good); }
.badge-paused    { background: rgba(251, 191, 36, 0.15);  color: var(--warning); }
.badge-concluded { background: rgba(82, 82, 91, 0.25);    color: var(--faint); }

/* Lift / metric coloring */
.good { color: var(--good); }
.bad  { color: var(--bad); }
.dim  { color: var(--dim); }
.muted { color: var(--muted); }

/* Results comparison block */
.comparison {
  margin-top: 16px; padding: 16px;
  background: var(--surface-2); border-radius: 8px;
  display: flex; gap: 32px; flex-wrap: wrap; align-items: center;
}
.metric { display: flex; flex-direction: column; gap: 2px; }
.metric-label { font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em; color: var(--dim); }
.metric-value { font-size: 22px; font-family: monospace; font-weight: 500; }
.metric-sub { font-size: 11px; font-family: monospace; }
.verdict {
  flex: 1 1 100%; margin: 8px 0 0; padding-top: 12px;
  border-top: 1px solid var(--border); color: var(--muted); font-size: 13px;
}

/* Forms */
.form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.form-row label { flex: 1 1 0; min-width: 180px; }
.form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.form label > span { font-size: 11px; color: var(--dim); font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em; }
.form input, .form textarea, .form select {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); padding: 8px 10px; font-size: 13px;
  font-family: inherit;
}
.form input:focus, .form textarea:focus, .form select:focus {
  outline: none; border-color: var(--accent);
}
.form-actions { display: flex; gap: 12px; align-items: center; margin-top: 4px; }
.form-actions .dim { font-size: 11px; }

.btn {
  background: var(--surface-2); color: var(--text); border: 1px solid var(--border);
  border-radius: 6px; padding: 8px 14px; font-size: 13px; font-family: inherit;
  cursor: pointer; transition: all 0.15s;
}
.btn:hover { border-color: var(--accent); color: var(--accent); }
.btn.primary { background: var(--accent); color: var(--bg); border-color: var(--accent); font-weight: 500; }
.btn.primary:hover { background: #fcd34d; color: var(--bg); }
.btn.danger { color: var(--bad); border-color: rgba(248, 113, 113, 0.3); }
.btn.danger:hover { background: rgba(248, 113, 113, 0.1); color: var(--bad); }

footer {
  text-align: center; padding: 32px 24px; font-size: 12px;
  border-top: 1px solid var(--border); margin-top: 32px; color: var(--dim);
}
`
