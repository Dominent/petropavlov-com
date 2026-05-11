import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { initCal } from './lib/cal'

// Case studies are lazy-loaded — they're long pages of prose that
// most home-page visitors never reach. Keeping them out of the main
// bundle shaves ~30-40 KB gzipped off the initial page load.
const GramotaCaseStudy = lazy(() =>
  import('./pages/CaseStudyGramota').then((m) => ({
    default: m.GramotaCaseStudy,
  })),
)
const InsightDraftCaseStudy = lazy(() =>
  import('./pages/CaseStudyInsightDraft').then((m) => ({
    default: m.InsightDraftCaseStudy,
  })),
)

function CaseStudyFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="font-mono text-xs uppercase tracking-wider text-zinc-500">
        Loading case study…
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    initCal()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/case-studies/gramota"
        element={
          <Suspense fallback={<CaseStudyFallback />}>
            <GramotaCaseStudy />
          </Suspense>
        }
      />
      <Route
        path="/case-studies/insight-draft"
        element={
          <Suspense fallback={<CaseStudyFallback />}>
            <InsightDraftCaseStudy />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default App
