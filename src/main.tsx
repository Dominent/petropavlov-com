import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <Analytics />
    <SpeedInsights />
  </StrictMode>,
)
