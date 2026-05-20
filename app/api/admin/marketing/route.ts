// Admin UI for marketing posts — HTML page at /admin/marketing
// (mapped via vercel.json rewrite to /api/admin/marketing).
//
// Tracks every distribution post: HN submissions, r/forhire reposts,
// LinkedIn / Twitter posts, cold email blasts. Each row carries a
// `ref_tag` that matches the `?ref=` query param baked into URLs
// inside the post — Pulse persists that as `utm_source`, so the
// admin can join `marketing_posts.ref_tag` with
// `analytics_events.utm_source` to show per-post sessions +
// high-intent conversion counts in real time.
//
// CRUD via POST-Redirect-GET (no client JS). Same auth pattern as
// the rest of /admin/* (HTTP Basic via ANALYTICS_ADMIN_PASSWORD).

import { sql } from '@vercel/postgres'
import { requireBasicAuth } from '../../../../src/pulse/server/admin-auth'

export const runtime = 'nodejs'

type Status = 'active' | 'expired' | 'removed'

type MarketingPost = {
  id: number
  channel: string
  title: string
  post_url: string | null
  ref_tag: string
  content: string | null
  status: Status
  notes: string | null
  posted_at: string
  created_at: string
}

type AttributionRow = {
  ref_tag: string
  sessions: number
  views: number
  high_intent: number
  cal_clicks: number
  cv_downloads: number
  contact_submits: number
  ask_queries: number
}

const CHANNELS = [
  'hn',
  'show-hn',
  'hn-who-is-hiring',
  'reddit-forhire',
  'reddit-programming',
  'reddit-webdev',
  'linkedin',
  'twitter',
  'mastodon',
  'email-cold',
  'email-warm',
  'other',
]

const HIGH_INTENT_EVENTS = ['cal_click', 'cv_download', 'contact_submit', 'ask_query']

// ─────────────────────────────────────────────────────────────────────
// Handler
// ─────────────────────────────────────────────────────────────────────

export async function GET(req: Request): Promise<Response> {
  const authFail = requireBasicAuth(req)
  if (authFail) return authFail
  try {
    return await renderList()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin/marketing GET error:', msg)
    return new Response(renderError(msg), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

export async function POST(req: Request): Promise<Response> {
  const authFail = requireBasicAuth(req)
  if (authFail) return authFail
  try {
    return await handlePost(req)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin/marketing POST error:', msg)
    return new Response(renderError(msg), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
}

// ─────────────────────────────────────────────────────────────────────
// POST: create | update-status | delete (dispatched by _action)
// ─────────────────────────────────────────────────────────────────────

async function handlePost(req: Request): Promise<Response> {
  const form = await req.formData()
  const body: Record<string, string> = {}
  form.forEach((v, k) => {
    if (typeof v === 'string') body[k] = v
  })
  const action = body._action

  if (action === 'create') {
    if (!body.channel || !body.title || !body.ref_tag) {
      return redirect('/admin/marketing?error=missing_fields')
    }
    // Allow overriding the timestamp via posted_at_iso (e.g. logging a
    // post that went out earlier today). Falls back to now() in SQL.
    const postedAtIso = body.posted_at_iso?.trim() || null
    if (postedAtIso) {
      await sql`
        INSERT INTO marketing_posts
          (channel, title, post_url, ref_tag, content, notes, posted_at)
        VALUES (${body.channel}, ${body.title}, ${body.post_url || null},
                ${body.ref_tag}, ${body.content || null}, ${body.notes || null},
                ${postedAtIso}::timestamptz)
      `
    } else {
      await sql`
        INSERT INTO marketing_posts
          (channel, title, post_url, ref_tag, content, notes)
        VALUES (${body.channel}, ${body.title}, ${body.post_url || null},
                ${body.ref_tag}, ${body.content || null}, ${body.notes || null})
      `
    }
    return redirect('/admin/marketing?created=1')
  }

  if (action === 'status') {
    const id = parseInt(body.id || '', 10)
    const status = body.status as Status
    if (!id || !['active', 'expired', 'removed'].includes(status)) {
      return redirect('/admin/marketing?error=bad_input')
    }
    await sql`UPDATE marketing_posts SET status = ${status} WHERE id = ${id}`
    return redirect('/admin/marketing?updated=1')
  }

  if (action === 'notes') {
    const id = parseInt(body.id || '', 10)
    if (!id) return redirect('/admin/marketing?error=bad_input')
    await sql`UPDATE marketing_posts SET notes = ${body.notes || null} WHERE id = ${id}`
    return redirect('/admin/marketing?updated=1')
  }

  if (action === 'delete') {
    const id = parseInt(body.id || '', 10)
    if (!id) return redirect('/admin/marketing?error=bad_input')
    await sql`DELETE FROM marketing_posts WHERE id = ${id}`
    return redirect('/admin/marketing?deleted=1')
  }

  return redirect('/admin/marketing?error=unknown_action')
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } })
}

// ─────────────────────────────────────────────────────────────────────
// List view
// ─────────────────────────────────────────────────────────────────────

async function renderList(): Promise<Response> {
  // Fetch posts + per-ref-tag attribution in parallel.
  const [postsRes, attributionRes] = await Promise.all([
    sql`SELECT * FROM marketing_posts ORDER BY posted_at DESC`,
    // For each ref_tag that's logged in marketing_posts, count sessions
    // and high-intent events from analytics_events where utm_source
    // matches. Only count events AFTER the post was posted — so a
    // ref_tag reused for a later post doesn't pull in old traffic.
    // The IN clause uses a hardcoded list (matching HIGH_INTENT_EVENTS
    // below) — @vercel/postgres's sql tag doesn't accept array bindings
    // and these are all controlled string literals so inlining is safe.
    sql`
      WITH per_post AS (
        SELECT id, ref_tag, posted_at FROM marketing_posts
      )
      SELECT
        p.ref_tag,
        COUNT(DISTINCT e.session_hash) FILTER (WHERE e.event_type = 'view') AS sessions,
        COUNT(*) FILTER (WHERE e.event_type = 'view') AS views,
        COUNT(*) FILTER (WHERE e.event_type IN ('cal_click','cv_download','contact_submit','ask_query')) AS high_intent,
        COUNT(*) FILTER (WHERE e.event_type = 'cal_click') AS cal_clicks,
        COUNT(*) FILTER (WHERE e.event_type = 'cv_download') AS cv_downloads,
        COUNT(*) FILTER (WHERE e.event_type = 'contact_submit') AS contact_submits,
        COUNT(*) FILTER (WHERE e.event_type = 'ask_query') AS ask_queries
      FROM per_post p
      LEFT JOIN analytics_events e
        ON e.utm_source = p.ref_tag AND e.ts >= p.posted_at
      GROUP BY p.ref_tag
    `,
  ])

  const posts = postsRes.rows.map(rowToPost)
  const attrByRef = new Map<string, AttributionRow>()
  for (const r of attributionRes.rows) {
    attrByRef.set(String(r.ref_tag), {
      ref_tag: String(r.ref_tag),
      sessions: Number(r.sessions) || 0,
      views: Number(r.views) || 0,
      high_intent: Number(r.high_intent) || 0,
      cal_clicks: Number(r.cal_clicks) || 0,
      cv_downloads: Number(r.cv_downloads) || 0,
      contact_submits: Number(r.contact_submits) || 0,
      ask_queries: Number(r.ask_queries) || 0,
    })
  }

  return new Response(renderListPage(posts, attrByRef), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

// ─────────────────────────────────────────────────────────────────────
// HTML rendering
// ─────────────────────────────────────────────────────────────────────

function renderListPage(
  posts: MarketingPost[],
  attrByRef: Map<string, AttributionRow>,
): string {
  return `<!doctype html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Marketing · Pulse</title>
  <style>${STYLES}</style>
</head>
<body>
  ${renderTopbar()}

  <main>
    <section style="margin-bottom: 24px;">
      <h1 class="page-title">Marketing</h1>
      <p class="page-sub">
        Every distribution post — HN, Reddit, LinkedIn, cold email batches.
        Each row carries a <code>ref_tag</code> that matches the
        <code>?ref=</code> query param baked into URLs inside the post.
        Pulse persists that as <code>utm_source</code>, so the
        attribution columns below show real sessions + high-intent
        conversions driven by each post in real time.
      </p>
    </section>

    <section class="panel" style="margin-bottom: 24px;">
      <h2>Posts (${posts.length})</h2>
      ${posts.length === 0
        ? `<p class="empty">No posts logged yet — log one below.</p>`
        : renderPostsTable(posts, attrByRef)}
    </section>

    <section class="panel">
      <h2>Log a new post</h2>
      ${renderCreateForm()}
    </section>
  </main>

  <footer>
    <span class="muted">Pulse · Marketing tracker · joins ref_tag with utm_source for attribution</span>
  </footer>
</body>
</html>`
}

function renderPostsTable(
  posts: MarketingPost[],
  attrByRef: Map<string, AttributionRow>,
): string {
  return `<table class="m-table">
    <thead>
      <tr>
        <th>Posted</th>
        <th>Channel</th>
        <th>Title</th>
        <th>ref_tag</th>
        <th class="num">Sess</th>
        <th class="num">High-intent</th>
        <th class="num">Cal</th>
        <th class="num">CV</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      ${posts.map((p) => renderPostRow(p, attrByRef.get(p.ref_tag))).join('')}
    </tbody>
  </table>`
}

function renderPostRow(p: MarketingPost, a: AttributionRow | undefined): string {
  const sessions = a?.sessions ?? 0
  const highIntent = a?.high_intent ?? 0
  const cal = a?.cal_clicks ?? 0
  const cv = a?.cv_downloads ?? 0
  const linkOut = p.post_url
    ? `<a href="${esc(p.post_url)}" target="_blank" rel="noreferrer noopener" class="link-out">↗</a>`
    : '<span class="dim">—</span>'
  return `<tr>
    <td class="dim mono">${formatDate(p.posted_at)}</td>
    <td>${renderChannelBadge(p.channel)}</td>
    <td>
      <div class="title-cell">
        <span class="title-text">${esc(truncate(p.title, 80))}</span>
        ${linkOut}
      </div>
      ${p.notes ? `<div class="notes-cell dim">${esc(truncate(p.notes, 120))}</div>` : ''}
    </td>
    <td><code>${esc(p.ref_tag)}</code></td>
    <td class="num">${sessions || '<span class="dim">·</span>'}</td>
    <td class="num">${highIntent > 0 ? `<strong>${highIntent}</strong>` : '<span class="dim">·</span>'}</td>
    <td class="num">${cal || '<span class="dim">·</span>'}</td>
    <td class="num">${cv || '<span class="dim">·</span>'}</td>
    <td>${renderStatusBadge(p.status)}</td>
    <td class="num">
      <form method="POST" action="/admin/marketing" style="display:inline-block;" onsubmit="return confirm('Delete this post log entry?');">
        <input type="hidden" name="_action" value="delete" />
        <input type="hidden" name="id" value="${p.id}" />
        <button type="submit" class="action danger" title="Delete">×</button>
      </form>
    </td>
  </tr>`
}

function renderCreateForm(): string {
  // Helpful defaults — pre-fill the ref_tag based on the chosen channel
  // using a sensible convention. The user can override.
  return `<form method="POST" action="/admin/marketing" class="form">
    <input type="hidden" name="_action" value="create" />
    <div class="form-row">
      <label>
        <span>Channel</span>
        <select name="channel" required>
          ${CHANNELS.map((c) => `<option value="${c}">${c}</option>`).join('')}
        </select>
      </label>
      <label>
        <span>ref_tag <span class="dim">(matches ?ref= in URL)</span></span>
        <input name="ref_tag" required placeholder="hn-blog" pattern="[a-z0-9-]+" />
      </label>
    </div>
    <label>
      <span>Title <span class="dim">(post title or email subject)</span></span>
      <input name="title" required placeholder="A/B testing a portfolio that gets 20 visits a day" />
    </label>
    <label>
      <span>Post URL <span class="dim">(HN / Reddit / LinkedIn link, leave blank for email)</span></span>
      <input name="post_url" type="url" placeholder="https://news.ycombinator.com/item?id=..." />
    </label>
    <div class="form-row">
      <label>
        <span>Posted at <span class="dim">(ISO 8601, leave blank for now)</span></span>
        <input name="posted_at_iso" placeholder="2026-05-20T13:00:00Z" />
      </label>
    </div>
    <label>
      <span>Content <span class="dim">(optional — paste post body for reference)</span></span>
      <textarea name="content" rows="3" placeholder="The actual text of the post..."></textarea>
    </label>
    <label>
      <span>Notes <span class="dim">(what worked, what didn't)</span></span>
      <textarea name="notes" rows="2" placeholder="First comment posted within 60s..."></textarea>
    </label>
    <div class="form-actions">
      <button type="submit" class="btn primary">Log post</button>
      <span class="dim">Sessions + high-intent counts populate automatically from the join on <code>utm_source = ref_tag</code>.</span>
    </div>
  </form>`
}

// ─────────────────────────────────────────────────────────────────────
// Shared rendering helpers
// ─────────────────────────────────────────────────────────────────────

function renderTopbar(): string {
  return `<header class="topbar">
    <div class="brand">
      <span class="dot"></span>
      <strong>Pulse</strong>
      <span class="muted">Marketing · petropavlov.dev</span>
    </div>
    <nav class="links">
      <a href="/admin/analytics">Analytics</a>
      <a href="/admin/speed">Speed</a>
      <a href="/admin/events">Events</a>
      <a href="/admin/experiments">Experiments</a>
      <a href="/admin/marketing" class="active">Marketing</a>
    </nav>
  </header>`
}

function renderStatusBadge(s: Status): string {
  return `<span class="badge badge-${s}">${s}</span>`
}

function renderChannelBadge(c: string): string {
  const colors: Record<string, string> = {
    hn: 'rgba(255,102,0,0.16)',
    'show-hn': 'rgba(255,102,0,0.2)',
    'hn-who-is-hiring': 'rgba(255,102,0,0.12)',
    'reddit-forhire': 'rgba(255,69,0,0.16)',
    'reddit-programming': 'rgba(255,69,0,0.16)',
    'reddit-webdev': 'rgba(255,69,0,0.16)',
    linkedin: 'rgba(10,102,194,0.18)',
    twitter: 'rgba(29,155,240,0.16)',
    mastodon: 'rgba(99,100,255,0.16)',
    'email-cold': 'rgba(74,222,128,0.14)',
    'email-warm': 'rgba(74,222,128,0.18)',
    other: 'rgba(161,161,170,0.12)',
  }
  const bg = colors[c] || colors.other
  return `<span class="chan-badge" style="background:${bg}">${esc(c)}</span>`
}

function formatDate(s: string): string {
  return new Date(s).toISOString().slice(0, 16).replace('T', ' ') + ' UTC'
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s
  return s.slice(0, n - 1) + '…'
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function rowToPost(r: Record<string, unknown>): MarketingPost {
  return {
    id: Number(r.id),
    channel: String(r.channel),
    title: String(r.title),
    post_url: r.post_url == null ? null : String(r.post_url),
    ref_tag: String(r.ref_tag),
    content: r.content == null ? null : String(r.content),
    status: String(r.status) as Status,
    notes: r.notes == null ? null : String(r.notes),
    posted_at: String(r.posted_at),
    created_at: String(r.created_at),
  }
}

function renderError(msg: string): string {
  return `<!doctype html>
<html lang="en" class="dark">
<head><title>Error</title><style>${STYLES}</style></head>
<body>
  ${renderTopbar()}
  <main>
    <h1 class="page-title">Error</h1>
    <p class="page-sub">${esc(msg)}</p>
    <p><a class="back" href="/admin/marketing">← back to marketing</a></p>
  </main>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────
// Styles — matches the other admin pages
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
  display: flex; align-items: center; gap: 24px;
  padding: 14px 24px; border-bottom: 1px solid var(--border);
  background: rgba(9, 9, 11, 0.8); backdrop-filter: blur(10px);
  position: sticky; top: 0; z-index: 10;
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

main { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page-title { font-size: 24px; font-weight: 500; margin: 0 0 6px; }
.page-sub { color: var(--dim); margin: 0 0 8px; max-width: 760px; font-size: 13px; }
code {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 12px; color: var(--accent);
  background: var(--surface-2); padding: 1px 5px; border-radius: 3px;
}
.mono { font-family: ui-monospace, 'SF Mono', Menlo, monospace; }
.back {
  font-family: monospace; font-size: 12px; color: var(--dim);
  text-decoration: none; transition: color 0.15s;
}
.back:hover { color: var(--accent); }

.panel {
  background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  padding: 18px 20px; overflow: hidden;
}
.panel h2 {
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace; margin: 0 0 14px; font-weight: 500;
}
.empty { color: var(--faint); font-size: 13px; margin: 0; }

.m-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.m-table th {
  text-align: left; padding: 8px 10px 8px 0; font-weight: 500;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--dim); font-family: monospace;
  border-bottom: 1px solid var(--border);
}
.m-table th.num { text-align: right; padding-right: 0; }
.m-table td {
  padding: 10px 10px 10px 0; vertical-align: top;
  border-bottom: 1px solid rgba(39, 39, 42, 0.5);
}
.m-table tr:last-child td { border-bottom: none; }
.m-table tr:hover { background: rgba(255, 255, 255, 0.02); }
.m-table td.num { text-align: right; padding-right: 0; font-family: monospace; }
.title-cell { display: flex; align-items: center; gap: 6px; }
.title-text { color: var(--text); }
.notes-cell { font-size: 11px; margin-top: 4px; }
.link-out { color: var(--accent); text-decoration: none; font-size: 13px; }
.link-out:hover { color: var(--text); }

.badge {
  display: inline-block; font-size: 10px; font-family: monospace;
  text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px;
  border-radius: 4px; font-weight: 500;
}
.badge-active   { background: rgba(74, 222, 128, 0.15); color: var(--good); }
.badge-expired  { background: rgba(82, 82, 91, 0.25);   color: var(--faint); }
.badge-removed  { background: rgba(248, 113, 113, 0.15); color: var(--bad); }

.chan-badge {
  display: inline-block; font-size: 11px; font-family: monospace;
  padding: 2px 8px; border-radius: 4px; color: var(--text);
}

.dim  { color: var(--dim); }
.muted { color: var(--muted); }

.action {
  font-family: monospace; font-size: 14px; line-height: 1; color: var(--dim);
  background: transparent; border: 1px solid var(--border);
  padding: 3px 8px; border-radius: 4px; cursor: pointer;
}
.action.danger:hover { color: var(--bad); border-color: var(--bad); }

.form { display: flex; flex-direction: column; gap: 12px; }
.form-row { display: flex; gap: 12px; flex-wrap: wrap; }
.form-row label { flex: 1 1 0; min-width: 200px; }
.form label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.form label > span { font-size: 11px; color: var(--dim); font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em; }
.form input, .form textarea, .form select {
  background: var(--bg); border: 1px solid var(--border); border-radius: 6px;
  color: var(--text); padding: 8px 10px; font-size: 13px;
  font-family: inherit;
}
.form textarea { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 12px; }
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

footer {
  text-align: center; padding: 32px 24px; font-size: 12px;
  border-top: 1px solid var(--border); margin-top: 32px; color: var(--dim);
}
`
