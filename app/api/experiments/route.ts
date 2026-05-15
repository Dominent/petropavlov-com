// Public endpoint — GET /api/experiments returns the list of currently-
// running experiments and their variants. The client SDK fetches this
// once on init, hashes visitor_id → sticky variant, attaches the
// assignment to every event downstream.
//
// Heavy cache (5 min s-maxage + 10 min SWR) — experiments don't change
// often, and stale data here just means the SDK takes a few minutes
// to learn about a new experiment. Old assignments stay valid (sticky
// per visitor) so the lag is invisible to users.
//
// Fail-open on error: empty list means "no active experiments" → page
// renders its control variant. Better than a 500 that breaks Pulse init.

import { sql } from '@vercel/postgres'

export type ActiveExperiment = {
  key: string
  variants: { name: string; weight: number }[]
}

export async function GET(): Promise<Response> {
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

    return Response.json(
      { experiments },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    )
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('experiments api error:', msg)
    return Response.json(
      { experiments: [] },
      { headers: { 'Cache-Control': 'no-store' } },
    )
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
