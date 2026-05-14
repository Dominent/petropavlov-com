// Universal click tracking — every meaningful click on the page fires
// a `click` event with the target element's selector + visible text +
// optional anchor host.
//
// What this complements
// ─────────────────────
//   - Specific events (`cta_click`, `cal_click`, `project_click`,
//     `nav_click`, etc.) continue firing for the buttons we explicitly
//     instrumented. This adds blanket coverage for everything else:
//     text links inside paragraphs, headings people accidentally
//     click, the portrait image, etc.
//   - The `outbound` tracker (mousedown-based) still fires for
//     external link clicks specifically. The universal click tracker
//     fires *additionally* — so the "Top Clicked Elements" panel sees
//     the click event too.
//
// Privacy posture
// ───────────────
//   Captures: selector (tag + id + first 2 stable classes), trimmed
//   text content (80 chars max), hostname of any anchor target.
//   Does NOT capture: x/y coordinates, mouse trails, anything from
//   input / textarea / contenteditable elements (so typed form values
//   can't leak via a misclick on a label or wrapper).

import { track } from './core'

let installed = false

export function initClicks(): void {
  if (typeof window === 'undefined' || installed) return
  installed = true

  // Capture phase + passive: run before any handler that might call
  // stopPropagation(), and tell the browser we never preventDefault()
  // so it can dispatch immediately without waiting on us.
  document.addEventListener('click', onClick, { capture: true, passive: true })
}

function onClick(e: MouseEvent): void {
  const raw = e.target as HTMLElement | null
  if (!raw) return
  if (shouldSkip(raw)) return

  // Only track clicks that landed on or inside something actionable.
  // Clicks on plain paragraphs, decorative spans, headings, etc. are
  // overwhelmingly accidental (text selection, mistaps) — not signal.
  // If you want a specific non-interactive element tracked, add
  // `data-clickable` to it.
  const target = resolveTarget(raw)
  if (!target) return

  track('click', {
    selector: shortSelector(target),
    text: extractText(target) || undefined,
    host: extractHref(target),
    tag: target.tagName.toLowerCase(),
  })
}

/**
 * Walk up to the nearest interactive ancestor. Returns null if there
 * isn't one — the click is on something non-interactive (plain text,
 * decorative span, etc.) and we drop it.
 *
 * Counts as actionable:
 *   - <a>, <button>
 *   - elements with role="button"
 *   - opt-in attributes: data-cal-link, data-clickable
 */
function resolveTarget(el: HTMLElement): HTMLElement | null {
  return el.closest(
    'a, button, [role="button"], [data-cal-link], [data-clickable]',
  ) as HTMLElement | null
}

/**
 * Skip clicks where the target — or any ancestor — is something we
 * deliberately don't track:
 *   1. Form inputs (typed values could leak via a label misclick)
 *   2. Third-party Cal.com modal internals (their widget injects
 *      a DOM tree we don't control; clicks on the close button,
 *      backdrop, etc. shouldn't pollute our "Top Clicked Elements"
 *      panel — `data-cal-link` triggers on OUR side are still
 *      captured by the explicit `cal_click` handler).
 */
function shouldSkip(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if (el.isContentEditable) return true
  if (el.closest('input, textarea, [contenteditable="true"]')) return true

  // Cal.com modal — class names start with `cal-modal`, `cal-element`,
  // or `cal-embed`. Substring match catches all three families.
  if (
    el.closest(
      '[class*="cal-modal"], [class*="cal-element-embed"], [class*="cal-embed"]',
    )
  ) {
    return true
  }

  return false
}

/**
 * Build a short, stable selector for the target. We deliberately ignore
 * Tailwind state-variant classes (`hover:`, `group-hover:`, etc.) since
 * they're noise that depends on user state. First two non-state classes,
 * in source order, are enough to disambiguate similar elements when
 * paired with the visible text.
 */
function shortSelector(el: HTMLElement): string {
  const tag = el.tagName.toLowerCase()
  const id = el.id ? `#${cssEscape(el.id)}` : ''
  let classes = ''
  // SVG elements have className as an SVGAnimatedString, not a string —
  // fall back gracefully.
  const raw =
    typeof el.className === 'string'
      ? el.className
      : (el.className as unknown as { baseVal?: string })?.baseVal || ''
  if (raw.trim().length > 0) {
    const kept = raw
      .split(/\s+/)
      .filter(Boolean)
      .filter((c) => !c.includes(':')) // skip Tailwind state variants
      .slice(0, 2)
    if (kept.length > 0) classes = '.' + kept.join('.')
  }
  return (tag + id + classes).slice(0, 120)
}

function extractText(el: HTMLElement): string {
  return (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80)
}

/**
 * If the click was on (or inside) an anchor, return the destination
 * hostname only — we don't need full URLs for the panel, and limiting
 * to hostname avoids accidentally capturing things like query strings
 * that might carry session-y state.
 */
function extractHref(el: HTMLElement): string | undefined {
  const a = el.closest('a') as HTMLAnchorElement | null
  if (!a || !a.href) return undefined
  try {
    return new URL(a.href).hostname
  } catch {
    return undefined
  }
}

function cssEscape(s: string): string {
  // Tiny escape — IDs with special chars are rare on portfolio sites.
  return s.replace(/[^a-zA-Z0-9_-]/g, '_')
}
