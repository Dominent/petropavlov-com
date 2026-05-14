// Section visibility tracking via IntersectionObserver.
//
// You give Pulse a list of element ids + friendly names, and it fires
// a `section_view` event the first time each section scrolls into view.
// Useful for "how far down did this visitor read?" style funnel
// analysis on long single-page sites.
//
// Default behavior is once-per-session per section, persisted via
// sessionStorage so that re-entries (back/forward navigation within
// the same tab) don't double-count.

import type { SectionConfig } from './types'
import { track } from './core'

export type SectionsOptions = {
  /**
   * IntersectionObserver threshold — fraction of the element that
   * must be in viewport before a section is considered "viewed".
   * Default 0.2 (20%).
   */
  threshold?: number

  /**
   * Fire each section only once per browser session.
   * Default true — most analytics use cases want this.
   */
  oncePerSession?: boolean
}

const SS_PREFIX = '__pulse_section_'

let installed = false

export function initSections(
  sections: SectionConfig[],
  options: SectionsOptions = {},
): void {
  if (typeof window === 'undefined') return
  if (installed) return
  installed = true

  const threshold = options.threshold ?? 0.2
  const oncePerSession = options.oncePerSession !== false

  const setup = () => {
    for (const section of sections) {
      const name = section.name || section.id

      // Skip if already fired this session
      if (oncePerSession) {
        try {
          if (sessionStorage.getItem(SS_PREFIX + name)) continue
        } catch {
          // sessionStorage disabled — continue without de-dup
        }
      }

      const el = document.getElementById(section.id)
      if (!el) continue

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue

            if (oncePerSession) {
              try {
                sessionStorage.setItem(SS_PREFIX + name, '1')
              } catch {
                // Ignore
              }
            }

            track('section_view', { section: name })
            observer.disconnect()
          }
        },
        { threshold },
      )
      observer.observe(el)
    }
  }

  // Wait for DOM if necessary
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true })
  } else {
    // Defer slightly so React has a chance to mount sections after the
    // initial paint — IntersectionObserver firing on the very first
    // tick can miss elements that aren't mounted yet.
    setTimeout(setup, 50)
  }
}
