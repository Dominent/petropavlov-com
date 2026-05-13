// Postgres storage adapter for Pulse.
//
// Uses `@vercel/postgres`, which works out-of-box on Vercel (env vars
// auto-injected) and also against any Neon-compatible Postgres in
// other environments via the `POSTGRES_URL` env var.
//
// To use a different driver (pg, neon serverless, postgres.js, etc.)
// implement the StorageAdapter interface against it — see types.ts.

import { sql } from '@vercel/postgres'
import type { EventRecord, StorageAdapter, VitalRecord } from '../types.js'

export const postgres: StorageAdapter = {
  async insertEvent(r: EventRecord): Promise<void> {
    await sql`
      INSERT INTO analytics_events
        (event_type, page, referrer_host, utm_source, utm_medium,
         utm_campaign, country, device, browser, os, session_hash,
         visitor_id, props)
      VALUES
        (${r.event_type}, ${r.page}, ${r.referrer_host}, ${r.utm_source},
         ${r.utm_medium}, ${r.utm_campaign}, ${r.country}, ${r.device},
         ${r.browser}, ${r.os}, ${r.session_hash},
         ${r.visitor_id},
         ${r.props ? JSON.stringify(r.props) : null})
    `
  },

  async insertVital(r: VitalRecord): Promise<void> {
    await sql`
      INSERT INTO analytics_vitals
        (metric, value, page, country, device, session_hash, visitor_id)
      VALUES
        (${r.metric}, ${r.value}, ${r.page}, ${r.country},
         ${r.device}, ${r.session_hash}, ${r.visitor_id})
    `
  },
}

/** Direct access to the @vercel/postgres `sql` helper — used by queries.ts. */
export { sql }
