import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { listPosts } from './posts'

const URL = 'https://petropavlov.dev/blog'
const TITLE = 'Blog · Petro Pavlov'
const DESCRIPTION =
  'Notes on building production AI products, self-hosted infrastructure, and the engineering decisions behind petropavlov.dev itself.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: ['https://petropavlov.dev/og.png'],
  },
}

export default function BlogIndexPage() {
  const posts = listPosts()

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back to petro.pavlov
          </Link>
          <a
            href="https://cal.com/petropavlov/intro"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-3 py-1 text-xs text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10"
          >
            <Calendar className="h-3 w-3" />
            Book intro
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-14 pb-24">
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-accent/90">
            <span>blog</span>
            <span className="h-px w-8 bg-border-strong" />
            <span className="text-faint">notes + writeups</span>
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
            Notes from building production AI products and the engineering behind this site.
          </h1>
          <p className="text-lg leading-relaxed text-muted">
            {DESCRIPTION}
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-dim">No posts yet — first one shipping soon.</p>
        ) : (
          <ul className="space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-2xl border border-border/80 bg-surface/30 p-6 transition-colors hover:border-accent-soft/40 hover:bg-surface/50"
                >
                  <div className="mb-2 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-faint">
                    <span>{post.date}</span>
                    {post.readMinutes ? (
                      <>
                        <span className="h-px w-6 bg-border-strong" />
                        <span>~{post.readMinutes} min read</span>
                      </>
                    ) : null}
                  </div>
                  <h2 className="mb-2 text-2xl font-medium tracking-tight text-foreground group-hover:text-accent-bright">
                    {post.title}
                  </h2>
                  {post.description ? (
                    <p className="mb-3 text-muted leading-relaxed">{post.description}</p>
                  ) : null}
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-accent">
                    Read post
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
