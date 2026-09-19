// Ask Petro — POST /api/chat.
//
// Grounds GPT-5-mini on a system prompt rendered from the portfolio's
// own data files (see ./system-prompt.ts). Rate-limited per IP to
// prevent abuse (LLM calls are not free).

import crypto from 'node:crypto'
import OpenAI from 'openai'
import { sql } from '../../../src/pulse/server/storage/postgres'
import { dailySalt } from '../../../src/pulse/server/hash'
import { SYSTEM_PROMPT } from './system-prompt'

const HOUR_MS = 60 * 60 * 1000
const MAX_PER_HOUR = 15

function getIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return 'unknown'
}

// Rate limiting lives in Postgres because a serverless function has no
// shared memory: a Map here is per-instance, so a caller spread across
// instances would get MAX_PER_HOUR from each one. The counter is a
// single atomic upsert, keyed by a salted hash — the site promises not
// to store IPs, and the salt rotates daily (same scheme as Pulse).
//
// If the database is unreachable (local dev without POSTGRES_URL, or an
// outage) we fall back to the in-memory counter rather than failing the
// chat or leaving it unlimited.

const memoryCounts = new Map<string, { count: number; reset: number }>()

function memoryRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = memoryCounts.get(key)
  if (!entry || now > entry.reset) {
    memoryCounts.set(key, { count: 1, reset: now + HOUR_MS })
    return true
  }
  if (entry.count >= MAX_PER_HOUR) return false
  entry.count++
  return true
}

let tableReady: Promise<void> | null = null

function ensureTable(): Promise<void> {
  tableReady ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS chat_rate_limits (
        key          TEXT PRIMARY KEY,
        window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
        count        INTEGER NOT NULL DEFAULT 1
      )
    `
    // Keys are useless once the daily salt rotates — sweep on cold start.
    await sql`DELETE FROM chat_rate_limits WHERE window_start < now() - interval '1 day'`
  })().catch((e) => {
    tableReady = null
    throw e
  })
  return tableReady
}

async function rateLimit(ip: string): Promise<boolean> {
  const key = crypto
    .createHash('sha256')
    .update(`chat|${ip}|${dailySalt()}`)
    .digest('hex')
    .slice(0, 32)
  try {
    await ensureTable()
    const { rows } = await sql`
      INSERT INTO chat_rate_limits (key) VALUES (${key})
      ON CONFLICT (key) DO UPDATE SET
        count = CASE
          WHEN chat_rate_limits.window_start < now() - interval '1 hour' THEN 1
          ELSE chat_rate_limits.count + 1
        END,
        window_start = CASE
          WHEN chat_rate_limits.window_start < now() - interval '1 hour' THEN now()
          ELSE chat_rate_limits.window_start
        END
      RETURNING count
    `
    return Number(rows[0]?.count ?? 1) <= MAX_PER_HOUR
  } catch {
    return memoryRateLimit(key)
  }
}

type ChatMessage = { role: 'user' | 'assistant'; text: string }

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return Response.json(
      { error: 'Chat is not configured on this deployment.' },
      { status: 503 },
    )
  }

  const ip = getIp(req)
  if (!(await rateLimit(ip))) {
    return Response.json(
      { error: "You've hit the hourly limit. Try again later or email Petro directly." },
      { status: 429 },
    )
  }

  let body: { message?: string; history?: ChatMessage[] }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const { message, history } = body

  if (
    !message ||
    typeof message !== 'string' ||
    message.trim().length === 0 ||
    message.length > 600
  ) {
    return Response.json({ error: 'Invalid message.' }, { status: 400 })
  }

  const safeHistory = Array.isArray(history) ? history.slice(-6) : []

  try {
    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeHistory.map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: String(m.text).slice(0, 1500),
        })),
        { role: 'user', content: message.trim() },
      ],
      // GPT-5 models count internal reasoning tokens against this cap.
      // 500 was too tight after the system prompt grew — the model spent
      // its whole budget reasoning and emitted no output. 2000 leaves
      // room for both, plus we cap reasoning at "minimal" because this
      // is a CV Q&A bot, not a math/agent task that needs deep thinking.
      max_completion_tokens: 2000,
      reasoning_effort: 'minimal',
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? ''
    if (!text) {
      return Response.json({ error: 'Empty response from model.' }, { status: 500 })
    }
    return Response.json({ text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('chat api error:', msg)
    return Response.json({ error: 'Failed to generate response.' }, { status: 500 })
  }
}
