'use client'

// Client-side boot — runs once after hydration on every page.
//
// In the Vite build this was a synchronous call from src/main.tsx
// (for Pulse) and a useEffect in src/App.tsx (for Cal.com). In Next.js
// the equivalent is a small Client Component mounted at the root
// layout level; its useEffect fires once and configures both.

import { useEffect } from 'react'
import { init as pulseInit } from '../../src/pulse/client'
import { initCal } from '../../src/lib/cal'

export function PulseInit() {
  useEffect(() => {
    pulseInit({
      scrollRoutes: [/^\/case-studies\//],
      // IntersectionObserver-based section view tracking — same set
      // of section ids the Vite version uses.
      sections: [
        { id: 'hero', name: 'hero' },
        { id: 'work', name: 'work' },
        { id: 'ai', name: 'ai_engineering' },
        { id: 'experience', name: 'experience' },
        { id: 'about', name: 'about' },
        { id: 'ask', name: 'ask_petro' },
        { id: 'testimonials', name: 'testimonials' },
        { id: 'contact', name: 'contact' },
      ],
      errors: true,
      debug: process.env.NODE_ENV === 'development',
    })

    // Cal.com embed init — defer to idle so the ~15 KB gz embed chunk
    // doesn't compete with first paint. Idle with a 2 s timeout means
    // Cal is guaranteed warm by the time a visitor scrolls to a
    // "Book a call" button. Without this, the data-cal-link buttons
    // in Hero / Contact / case-study headers are inert.
    const idle = (cb: () => void): void => {
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      }
      if (typeof w.requestIdleCallback === 'function') {
        w.requestIdleCallback(cb, { timeout: 2000 })
      } else {
        setTimeout(cb, 1000)
      }
    }
    idle(() => {
      void initCal()
    })
  }, [])

  return null
}
