import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, ArrowRight, Calendar } from 'lucide-react'
import { listPosts } from './posts'

const URL = 'https://petropavlov.dev/blog'
// Title leads with keyword intent ("AI engineering & self-hosted infra
// notes") so the index competes for queries someone would actually
// type — not just the word "blog." Brand trails. 59 chars.
const TITLE = 'Blog — AI engineering & self-hosted infra notes · Petro Pavlov'
// Description loads relevant terms (RAG, LLM, self-hosted analytics)
// and leads with the author. 156 chars, within Google's snippet cap.
const DESCRIPTION =
  'Petro Pavlov on building production AI products end-to-end — RAG, LLM orchestration, self-hosted analytics, and the engineering behind petropavlov.dev.'
// Twitter-card copy can run a touch tighter since previews truncate
// earlier than SERP snippets.
const TWITTER_DESCRIPTION =
  'Notes on building production AI products end-to-end — RAG, LLM orchestration, self-hosted analytics, and the engineering behind petropavlov.dev.'

// ISR — regenerate every 60s so the inlined experiments JSON (in
// app/layout) refreshes between deploys. The post listing itself
// changes rarely; the 60s cost is for experiments freshness.
export const revalidate = 60

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  // Override the layout-level location-heavy keywords for blog
  // routes — they read off-topic on a content page about AI
  // engineering. These match the actual post topics.
  keywords: [
    'AI engineering blog',
    'self-hosted analytics',
    'RAG',
    'LLM orchestration',
    'A/B testing',
    'feature flags',
    'web analytics',
    'Next.js',
    'TypeScript',
    'Postgres',
  ],
  openGraph: {
    type: 'website',
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    // No explicit images — Next.js auto-populates from the sibling
    // opengraph-image.tsx file (per-route OG card with title rendered).
  },
  // Explicit Twitter card so /blog doesn't inherit the home-page
  // pitch ("Senior Full-Stack & AI Engineer · ...") which read
  // off-topic on the blog index.
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: TWITTER_DESCRIPTION,
  },
}

export default function BlogIndexPage() {
  const posts = listPosts()

  // BreadcrumbList — Home → Blog. Helps Google show the breadcrumb
  // trail in search result snippets, which improves CTR.
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://petropavlov.dev/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: URL },
    ],
  }

  // ItemList — tells search engines the listing structure of /blog.
  // Listing this way lets Google understand the page as an index of
  // articles rather than a single article itself. numberOfItems +
  // itemListOrder (descending = newest first) are schema.org-
  // recommended for unambiguous parsing.
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Petro Pavlov · Blog posts',
    numberOfItems: posts.length,
    itemListOrder: 'https://schema.org/ItemListOrderDescending',
    itemListElement: posts.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://petropavlov.dev/blog/${p.slug}`,
      name: p.title,
    })),
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Script
        id="ld-blog-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Script
        id="ld-blog-itemlist"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
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
            Notes from building production AI products and the engineering behind this site
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
