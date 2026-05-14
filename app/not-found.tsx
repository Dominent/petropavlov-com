'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeft } from 'lucide-react'
import { track } from '../src/pulse/client'

/**
 * 404 page — catches any path Next.js doesn't have a route for.
 * App-router convention: `app/not-found.tsx` is rendered automatically.
 * Fires a Pulse `404` event with the attempted path so broken inbound
 * links show up in the analytics dashboard.
 */
export default function NotFound() {
  const pathname = usePathname()

  useEffect(() => {
    track('404', { path: pathname ?? '' })
  }, [pathname])

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
            {pathname}
          </code>
          {' '}
          isn&rsquo;t something I can render.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
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
