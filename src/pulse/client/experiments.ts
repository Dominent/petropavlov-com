// A/B experiments — client SDK.
//
// On Pulse init we fetch /api/experiments once (edge-cached 5 min) to
// learn which experiments are running and what their variants are. Each
// visitor is assigned a sticky variant per experiment by hashing
// `visitor_id + experiment_key` modulo 100 — so the same person always
// gets the same variant, across reloads and (eventually) devices.
//
// Assignments are auto-attached to every track() call as `exp_<key>:
// <variant>` on the event's props, so the dashboard can group by
// variant without any per-call work from consumers.
//
// Consumers read the assignment via getVariant(key) or the
// useExperiment(key) React hook. Both return `null` when the experiment
// isn't running (or wasn't loaded yet), so the consumer's default branch
// (the "control" / current implementation) renders by default.
//
// Failure modes are deliberately silent:
//   - Network error fetching /api/experiments → empty list, nothing
//     gets bucketed, all consumers render their control branch.
//   - visitor_id missing (localStorage blocked) → falls back to
//     session_hash equivalent so the user still gets a stable bucket
//     within the session.
//   - Experiment paused/concluded server-side → next page-load picks up
//     the change; in-flight sessions keep their assignment.

import { useEffect, useState } from 'react'
import { getVisitorId } from './visitor-id'

type Variant = { name: string; weight: number }
type ActiveExperiment = { key: string; variants: Variant[] }

// In-memory state. Populated once by initExperiments(); read by
// getVariant / getAllAssignments downstream.
let active: ActiveExperiment[] = []
let assignments: Record<string, string> = {}
let loaded = false
let loadingPromise: Promise<void> | null = null

/**
 * Initialise experiments — populate `active` + `assignments` so any
 * subsequent track() call has the variant tags ready to merge.
 *
 * Two-tier load:
 *   1. SYNCHRONOUS — read the inlined JSON from <script id=
 *      "__pulse_experiments"> (rendered by app/_components/
 *      experiments-script.tsx). If present, assignments are computed
 *      before this function returns, and the first view + first
 *      section_view fire WITH the tag.
 *   2. ASYNC FALLBACK — if the inlined script is missing (old build,
 *      static asset cache, etc.), GET /api/experiments. The first few
 *      events of this load may fire untagged but subsequent events
 *      catch up.
 *
 * Idempotent — repeated calls return the same promise.
 */
export function initExperiments(endpoint = '/api/experiments'): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (loadingPromise) return loadingPromise

  // Tier 1 — synchronous inline load.
  const inlined = readInlinedExperiments()
  if (inlined !== null) {
    active = inlined
    assignments = computeAssignments(active)
    loaded = true
    // Still dispatch the event so useExperiment() hooks waiting on
    // the next tick don't sit waiting forever.
    queueMicrotask(() =>
      window.dispatchEvent(new Event('pulse:experiments-loaded')),
    )
    loadingPromise = Promise.resolve()
    return loadingPromise
  }

  // Tier 2 — async fetch fallback.
  loadingPromise = fetch(endpoint, { credentials: 'omit' })
    .then((r) => (r.ok ? r.json() : { experiments: [] }))
    .then((data: { experiments?: ActiveExperiment[] }) => {
      active = Array.isArray(data.experiments) ? data.experiments : []
      assignments = computeAssignments(active)
      loaded = true
      window.dispatchEvent(new Event('pulse:experiments-loaded'))
    })
    .catch(() => {
      // Network error → fail-open, no bucketing
      active = []
      assignments = {}
      loaded = true
      window.dispatchEvent(new Event('pulse:experiments-loaded'))
    })

  return loadingPromise
}

/**
 * Read the inlined experiment JSON from <script id="__pulse_experiments">,
 * if present. Returns the variant list, an empty array (DB query
 * succeeded with no rows), or null (script not present — fall back to
 * the async fetch path).
 */
function readInlinedExperiments(): ActiveExperiment[] | null {
  if (typeof document === 'undefined') return null
  const el = document.getElementById('__pulse_experiments')
  if (!el || !el.textContent) return null
  try {
    const parsed = JSON.parse(el.textContent) as { experiments?: unknown }
    if (!Array.isArray(parsed.experiments)) return []
    return parsed.experiments.filter(
      (e): e is ActiveExperiment =>
        !!e &&
        typeof e === 'object' &&
        typeof (e as { key: unknown }).key === 'string' &&
        Array.isArray((e as { variants: unknown }).variants),
    )
  } catch {
    return null
  }
}

/**
 * Return the variant assigned to the current visitor for this
 * experiment, or null if the experiment isn't running (or hasn't
 * loaded yet — initExperiments is async).
 *
 * Callers should treat null as "render the control branch."
 */
export function getVariant(key: string): string | null {
  return assignments[key] ?? null
}

/**
 * Return all current variant assignments as a flat object suitable for
 * merging into an event's props. Keys are prefixed with `exp_` so they
 * don't collide with regular event props.
 *
 *   { exp_hero: 'b', exp_cta_color: 'a' }
 *
 * Called by track() in core.ts on every event. Empty until
 * initExperiments() resolves.
 */
export function getAllAssignments(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, variant] of Object.entries(assignments)) {
    out[`exp_${key}`] = variant
  }
  return out
}

/**
 * React hook — returns the variant for `key`, re-rendering once when
 * the initial fetch resolves. Returns null until then, so consumers
 * naturally render their control branch during the first paint and
 * may switch to the test variant on a subsequent render.
 *
 * For experiments where flicker matters (visible above the fold), the
 * consumer can render the control branch unconditionally and ignore
 * the hook — assignments will still be tracked on view events so the
 * test still measures conversion.
 */
export function useExperiment(key: string): string | null {
  const [variant, setVariant] = useState<string | null>(() =>
    loaded ? getVariant(key) : null,
  )
  useEffect(() => {
    if (loaded) {
      setVariant(getVariant(key))
      return
    }
    const onLoaded = (): void => setVariant(getVariant(key))
    window.addEventListener('pulse:experiments-loaded', onLoaded)
    return () => window.removeEventListener('pulse:experiments-loaded', onLoaded)
  }, [key])
  return variant
}

// ─────────────────────────────────────────────────────────────────────
// Assignment math
// ─────────────────────────────────────────────────────────────────────

function computeAssignments(list: ActiveExperiment[]): Record<string, string> {
  const visitor = getVisitorId() || fallbackId()
  const out: Record<string, string> = {}
  for (const exp of list) {
    const variant = pickVariant(visitor, exp)
    if (variant) out[exp.key] = variant
  }
  return out
}

/**
 * Stable per-visitor assignment. Uses a deterministic 32-bit hash of
 * `visitor_id + ':' + experiment_key` to land each visitor on a
 * fraction of [0, 100), then walks the variants' weight cumulative
 * distribution to pick one.
 *
 * Weights don't need to sum to 100 — we normalise. So [50,50] and
 * [1,1] both produce a 50/50 split.
 */
function pickVariant(visitor: string, exp: ActiveExperiment): string | null {
  const variants = exp.variants.filter((v) => v.weight > 0)
  if (variants.length === 0) return null

  const totalWeight = variants.reduce((s, v) => s + v.weight, 0)
  const bucket = (hash32(`${visitor}:${exp.key}`) % 10_000) / 10_000 * totalWeight

  let acc = 0
  for (const v of variants) {
    acc += v.weight
    if (bucket < acc) return v.name
  }
  // Floating-point edge — bucket == totalWeight exactly. Fall through
  // to the last variant.
  return variants[variants.length - 1].name
}

/** Cheap, deterministic 32-bit string hash (FNV-1a). */
function hash32(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * Fallback identifier when visitor_id is unavailable (localStorage
 * blocked, private browsing). Uses a per-tab random id stored in
 * sessionStorage — sticky within the session but reset on tab close.
 * Not as good as visitor_id but better than re-bucketing on every
 * page load.
 */
function fallbackId(): string {
  const KEY = '__pulse_exp_fallback'
  try {
    let id = sessionStorage.getItem(KEY)
    if (!id) {
      id = `fb-${Math.random().toString(36).slice(2, 12)}`
      sessionStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}
