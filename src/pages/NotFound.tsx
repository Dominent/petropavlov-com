import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { track } from '../pulse/client'

/**
 * 404 page — catches any path React Router doesn't know about. Vercel's
 * SPA rewrite serves `/index.html` for unknown paths (with HTTP 200),
 * so we can't return a real 404 status code from here — but we can fire
 * a tracking event so you spot broken inbound links in the dashboard.
 */
export function NotFound() {
  const location = useLocation()

  useEffect(() => {
    track('404', { path: location.pathname + location.search })
  }, [location.pathname, location.search])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <div className="mb-6 font-mono text-xs uppercase tracking-wider text-accent">
          404 · Not Found
        </div>
        <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          That page doesn&rsquo;t exist
        </h1>
        <p className="mb-8 text-base leading-relaxed text-dim">
          You might have followed an old link. The path
          {' '}
          <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-accent">
            {location.pathname}
          </code>
          {' '}
          isn&rsquo;t something I can render.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-bright"
          >
            <Home className="h-4 w-4" />
            Back to home
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-5 py-2.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </div>
    </main>
  )
}
