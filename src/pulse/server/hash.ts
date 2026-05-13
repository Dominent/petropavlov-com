// Pseudonymous session hashing.
//
// We compute SHA256(ip + ua + daily_salt) and store the first 128 bits
// as hex. The daily_salt is itself SHA256(SECRET + UTC_YYYYMMDD),
// rotating every 24 hours.
//
// The privacy guarantee: within a calendar day we can de-duplicate
// visits from the same IP+browser (so "10 page views from one visitor
// counts as 1 session"). After the salt rotates, yesterday's hash is
// no longer linkable to any current IP — even if an attacker captured
// the database, they can't go back and identify visitors from past days.
//
// This is the same approach Plausible and Fathom use; CNIL (the French
// data protection authority) has explicitly blessed it as
// consent-exempt analytics.

import crypto from 'node:crypto'

const FALLBACK_SECRET =
  'pulse-dev-fallback-salt-please-set-ANALYTICS_SALT_SECRET-in-production'

/** Today's salt — SHA256(secret + UTC date). */
export function dailySalt(date: Date = new Date()): string {
  const secret = process.env.ANALYTICS_SALT_SECRET || FALLBACK_SECRET
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  return crypto.createHash('sha256').update(`${secret}|${ymd}`).digest('hex')
}

/** Pseudonymous 128-bit session id derived from IP + UA + today's salt. */
export function sessionHash(ip: string, userAgent: string, date: Date = new Date()): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${dailySalt(date)}`)
    .digest('hex')
    .slice(0, 32)
}
