// Admin CRUD for experiments. Same auth pattern as the other admin
// endpoints (HTTP Basic via requireBasicAuth + ANALYTICS_ADMIN_PASSWORD).
//
// Verbs:
//   GET                     → list all experiments + per-variant results
//   GET    ?key=<key>       → one experiment + its results
//   POST                    → create new experiment (status=draft)
//   PATCH  ?key=<key>       → update (variants, weights, status, etc.)
//   DELETE ?key=<key>       → drop (only if status in draft/concluded)
//
// Status transitions:
//   draft  → running   (sets started_at)
//   running → paused
//   paused → running
//   running|paused → concluded (sets ended_at, optionally winner)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'
import { requireBasicAuth } from '../_lib/auth.js'
import { experimentResults } from '../../src/pulse/server/index.js'

type Variant = { name: string; weight: number }

type ExperimentRow = {
  id: number
  key: string
  name: string
  description: string | null
  status: 'draft' | 'running' | 'paused' | 'concluded'
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
    if (req.method === 'GET') return await handleGet(req, res)
    if (req.method === 'POST') return await handlePost(req, res)
    if (req.method === 'PATCH') return await handlePatch(req, res)
    if (req.method === 'DELETE') return await handleDelete(req, res)
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    res.status(405).json({ error: 'Method not allowed' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin/experiments api error:', msg)
    res.status(500).json({ error: msg })
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  const key = typeof req.query.key === 'string' ? req.query.key : null
  const { rows } = key
    ? await sql`SELECT * FROM experiments WHERE key = ${key}`
    : await sql`SELECT * FROM experiments ORDER BY created_at DESC`

  const experiments = rows.map(rowToExperiment)

  // For each running experiment, attach live results so the dashboard
  // can render conversion rates without a second round-trip.
  const withResults = await Promise.all(
    experiments.map(async (e) => {
      if (e.status === 'draft') return { ...e, results: null }
      const results = await experimentResults(e.key, e.success_event, e.success_filter)
      return { ...e, results }
    }),
  )

  res.status(200).json({ experiments: withResults })
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  const body = req.body as Partial<ExperimentRow>
  const err = validateCreateBody(body)
  if (err) return res.status(400).json({ error: err })

  const variants = normaliseVariants(body.variants!)
  if (variants.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 variants' })
  }

  await sql`
    INSERT INTO experiments
      (key, name, description, variants, success_event, success_filter)
    VALUES
      (${body.key!}, ${body.name!}, ${body.description ?? null},
       ${JSON.stringify(variants)}::jsonb, ${body.success_event!},
       ${body.success_filter ? JSON.stringify(body.success_filter) : null}::jsonb)
  `

  res.status(201).json({ ok: true })
}

async function handlePatch(req: VercelRequest, res: VercelResponse) {
  const key = typeof req.query.key === 'string' ? req.query.key : null
  if (!key) return res.status(400).json({ error: 'Missing key' })

  const body = req.body as Partial<ExperimentRow>
  const updates: string[] = []
  const params: unknown[] = []

  if (body.name != null) { updates.push('name'); params.push(body.name) }
  if (body.description !== undefined) { updates.push('description'); params.push(body.description) }
  if (body.variants != null) {
    const v = normaliseVariants(body.variants)
    if (v.length < 2) return res.status(400).json({ error: 'Need at least 2 variants' })
    updates.push('variants'); params.push(JSON.stringify(v))
  }
  if (body.success_event != null) { updates.push('success_event'); params.push(body.success_event) }
  if (body.success_filter !== undefined) {
    updates.push('success_filter')
    params.push(body.success_filter ? JSON.stringify(body.success_filter) : null)
  }
  if (body.status != null) {
    if (!['draft','running','paused','concluded'].includes(body.status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }
    updates.push('status'); params.push(body.status)
    if (body.status === 'running')   { updates.push('started_at'); params.push(new Date().toISOString()) }
    if (body.status === 'concluded') { updates.push('ended_at');   params.push(new Date().toISOString()) }
  }
  if (body.winner !== undefined) { updates.push('winner'); params.push(body.winner) }

  if (updates.length === 0) return res.status(400).json({ error: 'No updates provided' })

  // @vercel/postgres doesn't expose a parameterised raw-SQL builder, so
  // build the SET clause by hand and use sql.query() with positional args.
  // The columns we interpolate are an allow-list above — no SQL injection
  // surface.
  const setClause = updates.map((c, i) => `${c} = $${i + 1}`).join(', ')
  params.push(key)
  await sql.query(
    `UPDATE experiments SET ${setClause} WHERE key = $${params.length}`,
    params,
  )

  res.status(200).json({ ok: true })
}

async function handleDelete(req: VercelRequest, res: VercelResponse) {
  const key = typeof req.query.key === 'string' ? req.query.key : null
  if (!key) return res.status(400).json({ error: 'Missing key' })

  // Only allow delete on draft or concluded experiments — a running one
  // has live event data attached to it and is probably worth keeping in
  // the table for the audit trail.
  const { rows } = await sql`SELECT status FROM experiments WHERE key = ${key}`
  if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
  if (!['draft','concluded'].includes(rows[0].status as string)) {
    return res.status(409).json({ error: 'Pause + conclude the experiment before deleting' })
  }

  await sql`DELETE FROM experiments WHERE key = ${key}`
  res.status(200).json({ ok: true })
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function validateCreateBody(b: Partial<ExperimentRow>): string | null {
  if (!b.key || typeof b.key !== 'string' || !/^[a-z][a-z0-9_-]*$/.test(b.key)) {
    return 'key must be lowercase letters, numbers, _ or -'
  }
  if (!b.name || typeof b.name !== 'string') return 'name is required'
  if (!Array.isArray(b.variants)) return 'variants must be an array'
  if (!b.success_event || typeof b.success_event !== 'string') return 'success_event is required'
  return null
}

function normaliseVariants(raw: unknown): Variant[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (v): v is Variant =>
        !!v &&
        typeof v === 'object' &&
        typeof (v as { name: unknown }).name === 'string' &&
        typeof (v as { weight: unknown }).weight === 'number',
    )
    .map((v) => ({ name: v.name, weight: Math.max(0, Math.round(v.weight)) }))
}

function rowToExperiment(r: Record<string, unknown>): ExperimentRow {
  return {
    id: Number(r.id),
    key: String(r.key),
    name: String(r.name),
    description: r.description == null ? null : String(r.description),
    status: String(r.status) as ExperimentRow['status'],
    variants: Array.isArray(r.variants) ? (r.variants as Variant[]) : [],
    success_event: String(r.success_event),
    success_filter: (r.success_filter as Record<string, string>) ?? null,
    winner: r.winner == null ? null : String(r.winner),
    created_at: String(r.created_at),
    started_at: r.started_at == null ? null : String(r.started_at),
    ended_at: r.ended_at == null ? null : String(r.ended_at),
  }
}
