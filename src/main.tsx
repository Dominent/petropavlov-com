import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Self-hosted fonts via Fontsource. Replaces external Google Fonts requests
// so the browser doesn't have to do extra DNS + TLS + HTTP round-trips to
// fonts.googleapis.com and fonts.gstatic.com. Variable fonts for Inter +
// JetBrains Mono (single file, all weights); static 400 + italic for
// Instrument Serif (the only weights we use).
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'

import './index.scss'
import App from './App.tsx'
import { init as pulseInit } from './pulse/client'

// Pulse — privacy-first analytics. Replaces @vercel/analytics +
// @vercel/speed-insights. No cookies, no IPs stored, GDPR-clean.
// See src/pulse/README.md for the full story.
pulseInit({
  scrollRoutes: [/^\/case-studies\//],
  // IntersectionObserver-based section view tracking — fires once per
  // session per section. Tells us how far down each visitor scrolls
  // on the home page (the funnel question that matters most).
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
  // Global JS error + unhandled rejection capture — rate-limited to 5
  // events per page load to prevent flooding when a bug fires repeatedly.
  errors: true,
  debug: import.meta.env.DEV,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
