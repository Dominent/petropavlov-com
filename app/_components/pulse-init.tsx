'use client'

// Pulse analytics init — runs once after hydration on every page.
//
// In the Vite build this was a synchronous call from src/main.tsx.
// In Next.js the equivalent is a small Client Component mounted at the
// root layout level; its useEffect fires once and configures all the
// tracking that the library does for the lifetime of the page.

import { useEffect } from 'react'
import { init as pulseInit } from '../../src/pulse/client'

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
  }, [])

  return null
}
