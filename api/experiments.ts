// Public endpoint — returns the list of currently-running experiments
// and their variants. The client SDK fetches this once on init,
// hashes the visitor_id to assign a sticky variant, and attaches the
// assignment to every event downstream.
//
// Heavy cache (5 min stale-while-revalidate at the edge) — experiments
// don't change often, and stale data here just means the SDK takes a
// few minutes to learn about a new experiment. Old assignments stay
// valid (sticky per visitor) so the lag is invisible to users.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from '@vercel/postgres'

export type ActiveExperiment = {
  key: string
  variants: { name: string; weight: number }[]
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { rows } = await sql`
      SELECT key, variants
      FROM experiments
      WHERE status = 'running'
      ORDER BY key
    `

    const experiments: ActiveExperiment[] = rows.map((r) => ({
      key: String(r.key),
      variants: normaliseVariants(r.variants),
    }))

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    // Edge cache for 5 min; allow 10 min of stale-while-revalidate so
    // a slow regen doesn't block visitors.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600',
    )
    res.status(200).json({ experiments })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('experiments api error:', msg)
    // Fail-open: empty list means "no active experiments" — page renders
    // its control variant. Better than a 500 that breaks Pulse init.
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({ experiments: [] })
  }
}

function normaliseVariants(raw: unknown): { name: string; weight: number }[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (v): v is { name: string; weight: number } =>
        !!v &&
        typeof v === 'object' &&
        typeof (v as { name: unknown }).name === 'string' &&
        typeof (v as { weight: unknown }).weight === 'number',
    )
    .map((v) => ({ name: v.name, weight: Math.max(0, Math.round(v.weight)) }))
}
