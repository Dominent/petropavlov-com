// Server component — inlines the active experiment list as a JSON
// script tag in <head>. The Pulse client SDK reads it synchronously
// on init, so variant assignments are populated before any tracking
// event fires.
//
// Without this, the first `view` event (and the initial
// `section_view` for the hero) race the async /api/experiments fetch.
// On a fast bounce (<100ms), the visitor fires two untagged events
// and is then gone — invisible to the A/B test's exposure count.
//
// Reads the DB directly (no self-HTTP), cached for 60s via
// unstable_cache. Combined with `revalidate = 60` on the consuming
// pages, experiment changes (start / pause / weight change) propagate
// to live HTML within ~60s without a redeploy.

import { sql } from '@vercel/postgres'
import { unstable_cache } from 'next/cache'

type Variant = { name: string; weight: number }
type ActiveExperiment = { key: string; variants: Variant[] }

const getActiveExperiments = unstable_cache(
  async (): Promise<{ experiments: ActiveExperiment[] }> => {
    try {
      const { rows } = await sql`
        SELECT key, variants
        FROM experiments
        WHERE status = 'running'
        ORDER BY key
      `
      const experiments = rows.map((r) => ({
        key: String(r.key),
        variants: normaliseVariants(r.variants),
      }))
      return { experiments }
    } catch {
      // Fail-open: empty list → SDK falls back to its async fetch path,
      // which itself is fail-open. Tracking continues; A/B just degrades.
      return { experiments: [] }
    }
  },
  ['pulse-active-experiments'],
  { revalidate: 60 },
)

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

export async function ExperimentsScript() {
  const data = await getActiveExperiments()
  return (
    <script
      id="__pulse_experiments"
      type="application/json"
      // dangerouslySetInnerHTML is the canonical React pattern for
      // injecting JSON without an extra surrounding text node. Safe
      // here because the payload is JSON.stringify of a controlled
      // shape (no user input).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
