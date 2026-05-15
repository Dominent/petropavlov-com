// Daily Pulse report — fires once per day via Vercel Cron, emails a
// digest of yesterday's traffic to the site owner via Resend.
//
// Schedule is defined in vercel.json (`crons`). Vercel signs cron
// requests with `Authorization: Bearer ${CRON_SECRET}`, which we verify
// before doing any work (otherwise anyone could trigger spam emails).
//
// "Yesterday" is the previous full UTC day. The cron fires at 07:00 UTC.

import { Resend } from 'resend'
import {
  totals,
  bounceRate,
  topPages,
  topReferrers,
  topCountries,
  trafficByChannel,
  customEvents,
  funnel,
  vitalsPercentiles,
  computeRES,
  type BreakdownRow,
  type FunnelStage,
  type Metric,
} from '../../../../src/pulse/server/index'

// Node runtime — Resend SDK uses fetch under the hood, but the rendered
// HTML is large enough that we want full Node memory limits.
export const runtime = 'nodejs'

export async function GET(req: Request): Promise<Response> {
  if (!authorize(req)) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'RESEND_API_KEY not configured' }, { status: 503 })
  }

  const yesterday = yesterdayRange()
  const before = previousDayRange(yesterday)

  const [
    curTotals,
    prevTotals,
    bounceCur,
    bouncePrev,
    pages,
    channels,
    referrers,
    countries,
    events,
    funnelData,
    vitals,
  ] = await Promise.all([
    totals(yesterday),
    totals(before),
    bounceRate(yesterday),
    bounceRate(before),
    topPages(yesterday, 5),
    trafficByChannel(yesterday),
    topReferrers(yesterday, 5),
    topCountries(yesterday, 5),
    customEvents(yesterday),
    funnel(yesterday),
    vitalsPercentiles(yesterday, 75),
  ])

  const dateLabel = formatDate(yesterday.since)
  const visitors = curTotals.visitors
  const subject = `petropavlov.dev · ${visitors} visitor${visitors === 1 ? '' : 's'} · ${dateLabel}`

  const html = renderEmail({
    dateLabel,
    visitors,
    prevVisitors: prevTotals.visitors,
    views: curTotals.views,
    prevViews: prevTotals.views,
    bounce: bounceCur,
    prevBounce: bouncePrev,
    pages,
    channels,
    referrers,
    countries,
    events,
    funnelData,
    vitalsRes: computeRES(vitals),
    vitals,
  })
  const text = renderText({
    dateLabel,
    visitors,
    views: curTotals.views,
    bounce: bounceCur,
    pages,
    channels,
    referrers,
    countries,
    events,
    funnelData,
    vitalsRes: computeRES(vitals),
  })

  const resend = new Resend(apiKey)
  const fromAddress = process.env.RESEND_FROM_EMAIL || 'Pulse <onboarding@resend.dev>'
  const toAddress = process.env.CONTACT_TO_EMAIL || 'petromilpavlov@gmail.com'

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      subject,
      html,
      text,
    })
    if (result.error) {
      console.error('[daily-report] resend error:', result.error)
      return Response.json(
        { error: 'send_failed', detail: result.error },
        { status: 500 },
      )
    }
    return Response.json({
      ok: true,
      subject,
      visitors,
      messageId: result.data?.id,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[daily-report] exception:', msg)
    return Response.json({ error: 'send_failed', detail: msg }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────
// Auth, dates
// ─────────────────────────────────────────────────────────────────────

function authorize(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const expected = `Bearer ${secret}`
  const got = req.headers.get('authorization')
  return got === expected
}

function yesterdayRange(): { since: Date; until: Date } {
  const now = new Date()
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  )
  const yesterdayUtc = new Date(todayUtc.getTime() - 24 * 60 * 60 * 1000)
  return { since: yesterdayUtc, until: todayUtc }
}

function previousDayRange(r: { since: Date; until: Date }): {
  since: Date
  until: Date
} {
  return {
    since: new Date(r.since.getTime() - 24 * 60 * 60 * 1000),
    until: r.since,
  }
}

function formatDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[d.getUTCDay()]} ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
}

function pctDelta(cur: number, prev: number): string {
  if (prev === 0) {
    if (cur === 0) return ''
    return ' (new)'
  }
  const pct = Math.round(((cur - prev) / prev) * 100)
  const sign = pct >= 0 ? '+' : ''
  return ` (${sign}${pct}%)`
}

// ─────────────────────────────────────────────────────────────────────
// HTML rendering — light theme for max email-client compatibility
// ─────────────────────────────────────────────────────────────────────

type ViewModel = {
  dateLabel: string
  visitors: number
  prevVisitors: number
  views: number
  prevViews: number
  bounce: number
  prevBounce: number
  pages: BreakdownRow[]
  channels: BreakdownRow[]
  referrers: BreakdownRow[]
  countries: BreakdownRow[]
  events: BreakdownRow[]
  funnelData: FunnelStage[]
  vitalsRes: number
  vitals: Record<Metric, number>
}

function renderEmail(m: ViewModel): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f7f7f8;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

          ${headerBlock(m)}
          ${statsBlock(m)}
          ${channelsBlock(m)}
          ${pagesAndReferrersBlock(m)}
          ${funnelBlock(m)}
          ${vitalsBlock(m)}
          ${footerBlock()}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function headerBlock(m: ViewModel): string {
  return `<tr><td style="padding:24px 28px 16px;border-bottom:1px solid #e5e7eb;">
    <div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#fbbf24;font-weight:600;">
      ● Pulse · petropavlov.dev
    </div>
    <h1 style="margin:6px 0 0;font-size:22px;font-weight:600;color:#111827;">
      Daily report · ${esc(m.dateLabel)}
    </h1>
  </td></tr>`
}

function statsBlock(m: ViewModel): string {
  return `<tr><td style="padding:20px 28px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        ${statCard('Visitors', m.visitors.toLocaleString(), pctDelta(m.visitors, m.prevVisitors), false)}
        ${statCard('Page Views', m.views.toLocaleString(), pctDelta(m.views, m.prevViews), false)}
        ${statCard('Bounce', `${m.bounce}%`, pctDelta(m.bounce, m.prevBounce), true)}
      </tr>
    </table>
  </td></tr>`
}

function statCard(label: string, value: string, delta: string, isBounce: boolean): string {
  let color = '#6b7280'
  if (delta) {
    const positive = delta.includes('+') && !delta.includes('(new)')
    const better = isBounce ? !positive : positive
    color = better ? '#16a34a' : '#dc2626'
    if (delta.includes('(new)')) color = '#6b7280'
  }
  return `<td width="33%" style="padding:0 6px;" align="left" valign="top">
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;">
      <div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">
        ${esc(label)}
      </div>
      <div style="font-size:26px;font-weight:500;margin-top:2px;color:#111827;">
        ${esc(value)}
      </div>
      ${delta ? `<div style="font-size:11px;font-family:ui-monospace,'SF Mono',Menlo,monospace;color:${color};margin-top:2px;">${esc(delta.trim())}</div>` : ''}
    </div>
  </td>`
}

function channelsBlock(m: ViewModel): string {
  if (m.channels.length === 0) return ''
  const colors: Record<string, string> = {
    direct: '#9ca3af',
    search: '#3b82f6',
    social: '#f59e0b',
    referral: '#10b981',
  }
  const rows = m.channels
    .map((c) => {
      const dot = colors[c.key] || '#9ca3af'
      return `<tr>
        <td style="padding:4px 0;">
          <span style="display:inline-block;width:8px;height:8px;background:${dot};border-radius:4px;margin-right:8px;vertical-align:middle;"></span>
          <span style="font-size:13px;color:#111827;">${esc(capitalize(c.key))}</span>
        </td>
        <td style="padding:4px 0;text-align:right;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:12px;color:#374151;">${c.visitors}</td>
      </tr>`
    })
    .join('')
  return `<tr><td style="padding:0 28px 8px;">
    ${sectionHeading('Traffic sources')}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>
  </td></tr>`
}

function pagesAndReferrersBlock(m: ViewModel): string {
  return `<tr><td style="padding:16px 28px 8px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td width="50%" valign="top" style="padding-right:8px;">
          ${sectionHeading('Top pages')}
          ${breakdownList(m.pages, (k) => (k === '/' ? '/ (home)' : k))}
        </td>
        <td width="50%" valign="top" style="padding-left:8px;">
          ${sectionHeading('Top referrers')}
          ${breakdownList(m.referrers, (k) => (k === '(direct)' ? '(direct)' : k))}
        </td>
      </tr>
      <tr>
        <td width="50%" valign="top" style="padding:12px 8px 0 0;">
          ${sectionHeading('Top countries')}
          ${breakdownList(m.countries, formatCountry)}
        </td>
        <td width="50%" valign="top" style="padding:12px 0 0 8px;">
          ${sectionHeading('Custom events')}
          ${breakdownList(m.events, (k) => `<code style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;color:#dc2626;background:#fee2e2;padding:1px 5px;border-radius:3px;">${esc(k)}</code>`)}
        </td>
      </tr>
    </table>
  </td></tr>`
}

function funnelBlock(m: ViewModel): string {
  if (m.funnelData.length === 0 || m.funnelData[0].count === 0) return ''
  const top = m.funnelData[0].count
  const rows = m.funnelData
    .map((s) => {
      const widthPct = top > 0 ? Math.max(2, (s.count / top) * 100) : 2
      return `<tr>
        <td style="padding:4px 0;">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#374151;margin-bottom:3px;">
            <span><strong style="color:#111827;">${esc(s.label)}</strong></span>
            <span style="font-family:ui-monospace,'SF Mono',Menlo,monospace;color:#6b7280;">${s.count} · ${s.pctOfTop}%</span>
          </div>
          <div style="background:#e5e7eb;border-radius:3px;height:5px;overflow:hidden;">
            <div style="background:linear-gradient(to right,#fbbf24,#f59e0b);height:100%;width:${widthPct.toFixed(1)}%;border-radius:3px;"></div>
          </div>
        </td>
      </tr>`
    })
    .join('')
  return `<tr><td style="padding:16px 28px 8px;">
    ${sectionHeading('Funnel')}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">${rows}</table>
  </td></tr>`
}

function vitalsBlock(m: ViewModel): string {
  if (m.vitalsRes === 0 && Object.values(m.vitals).every((v) => !v)) return ''
  const status = m.vitalsRes >= 90 ? 'Great' : m.vitalsRes >= 50 ? 'Needs work' : 'Poor'
  const color = m.vitalsRes >= 90 ? '#16a34a' : m.vitalsRes >= 50 ? '#f59e0b' : '#dc2626'
  return `<tr><td style="padding:16px 28px 8px;">
    ${sectionHeading('Web Vitals (P75)')}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td valign="middle" style="padding:8px 12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
          <div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Real Experience Score</div>
          <div style="font-size:26px;font-weight:500;color:${color};">${m.vitalsRes}<span style="font-size:12px;color:#6b7280;font-weight:400;margin-left:6px;">${status}</span></div>
          <div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;color:#374151;margin-top:6px;">
            ${formatVitalLine(m.vitals)}
          </div>
        </td>
      </tr>
    </table>
  </td></tr>`
}

function formatVitalLine(v: Record<Metric, number>): string {
  const parts: string[] = []
  if (v.LCP) parts.push(`LCP ${formatMs(v.LCP)}`)
  if (v.INP) parts.push(`INP ${formatMs(v.INP)}`)
  if (v.CLS != null) parts.push(`CLS ${v.CLS.toFixed(2)}`)
  if (v.FCP) parts.push(`FCP ${formatMs(v.FCP)}`)
  if (v.TTFB) parts.push(`TTFB ${formatMs(v.TTFB)}`)
  return parts.join(' · ')
}

function formatMs(v: number): string {
  return v < 1000 ? `${Math.round(v)}ms` : `${(v / 1000).toFixed(2)}s`
}

function footerBlock(): string {
  return `<tr><td style="padding:24px 28px;border-top:1px solid #e5e7eb;text-align:center;">
    <a href="https://petropavlov.dev/admin/analytics" style="display:inline-block;background:#fbbf24;color:#111827;font-size:13px;font-weight:500;text-decoration:none;padding:9px 18px;border-radius:999px;">
      Open full dashboard →
    </a>
    <div style="font-size:11px;color:#9ca3af;margin-top:18px;line-height:1.5;">
      Sent by Pulse — privacy-first analytics running on petropavlov.dev.<br/>
      No cookies. No IPs stored. Session deduplication uses a server-side daily-rotating hash.
    </div>
  </td></tr>`
}

function sectionHeading(label: string): string {
  return `<div style="font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:0 0 8px;font-weight:600;">
    ${esc(label)}
  </div>`
}

function breakdownList(
  rows: BreakdownRow[],
  formatKey: (k: string) => string = esc,
): string {
  if (rows.length === 0) {
    return `<div style="font-size:12px;color:#9ca3af;padding:4px 0;">No data</div>`
  }
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    ${rows
      .map(
        (r) => `<tr>
        <td style="padding:3px 0;font-size:12px;color:#374151;">${formatKey(r.key)}</td>
        <td style="padding:3px 0;text-align:right;font-family:ui-monospace,'SF Mono',Menlo,monospace;font-size:11px;color:#6b7280;">${r.visitors}</td>
      </tr>`,
      )
      .join('')}
  </table>`
}

function formatCountry(c: string): string {
  if (!c || c === '??') return 'Unknown'
  const flag = c
    .toUpperCase()
    .split('')
    .map((ch) => String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 65))
    .join('')
  return `${flag} ${esc(c)}`
}

function capitalize(s: string): string {
  if (!s) return s
  return s[0].toUpperCase() + s.slice(1)
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
// Plain text fallback (for email clients that don't render HTML)
// ─────────────────────────────────────────────────────────────────────

function renderText(m: {
  dateLabel: string
  visitors: number
  views: number
  bounce: number
  pages: BreakdownRow[]
  channels: BreakdownRow[]
  referrers: BreakdownRow[]
  countries: BreakdownRow[]
  events: BreakdownRow[]
  funnelData: FunnelStage[]
  vitalsRes: number
}): string {
  const line = (rows: BreakdownRow[], format: (k: string) => string = (k) => k) =>
    rows.length === 0
      ? '  (none)'
      : rows.map((r) => `  ${format(r.key).padEnd(30)} ${r.visitors}`).join('\n')

  return `Pulse · petropavlov.dev · ${m.dateLabel}

Yesterday at a glance:
  Visitors        ${m.visitors}
  Page Views      ${m.views}
  Bounce Rate     ${m.bounce}%

Traffic sources:
${line(m.channels, capitalize)}

Top pages:
${line(m.pages, (k) => (k === '/' ? '/ (home)' : k))}

Top referrers:
${line(m.referrers)}

Top countries:
${line(m.countries)}

Custom events:
${line(m.events)}

Funnel:
${m.funnelData.map((s) => `  ${s.label.padEnd(20)} ${String(s.count).padStart(5)}  (${s.pctOfTop}% of visitors)`).join('\n')}

Web Vitals RES: ${m.vitalsRes} / 100

Open the full dashboard: https://petropavlov.dev/admin/analytics
`
}
