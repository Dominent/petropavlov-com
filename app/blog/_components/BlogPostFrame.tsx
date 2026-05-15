// Styled article frame for blog posts. Each post's MDX file imports
// this and wraps its body content so the prose gets consistent
// typography + a header + footer CTA without duplicating boilerplate.
//
// Usage in an MDX file:
//
//   import { BlogPostFrame } from '../_components/BlogPostFrame'
//
//   export const metadata = { ... }
//
//   <BlogPostFrame title="..." description="..." date="..." readMinutes={8}>
//
//   # Section heading
//
//   prose...
//
//   </BlogPostFrame>
//
// MDX renders the React tree inline — `<BlogPostFrame>` receives the
// rest of the markdown as children, which gets styled by the `prose
// prose-invert` parent.

import Link from 'next/link'
import { ArrowLeft, Calendar, Mail } from 'lucide-react'

type Props = {
  title: string
  description?: string
  date: string
  readMinutes?: number
  tag?: string
  children: React.ReactNode
}

export function BlogPostFrame({
  title,
  description,
  date,
  readMinutes,
  tag = 'blog post',
  children,
}: Props) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            all posts
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

      <article className="mx-auto max-w-3xl px-6 pt-14 pb-24">
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-accent/90">
            <span>{tag}</span>
            <span className="h-px w-8 bg-border-strong" />
            <span className="text-faint">{date}{readMinutes ? ` · ~${readMinutes} min read` : ''}</span>
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
            {title}
          </h1>
          {description ? (
            <p className="text-xl leading-relaxed text-muted">{description}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-faint">
            <span>by Petromil Pavlov</span>
            <span className="text-ghost">·</span>
            <span>petropavlov.dev</span>
          </div>
        </div>

        <div
          className="
            prose prose-invert max-w-none
            prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:mt-16 prose-h2:mb-4 prose-h2:text-2xl prose-h2:md:text-3xl
            prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl
            prose-p:text-muted prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-medium
            prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-bright
            prose-code:rounded prose-code:border prose-code:border-border prose-code:bg-surface/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:text-accent-bright prose-code:before:content-none prose-code:after:content-none
            prose-pre:rounded-lg prose-pre:border prose-pre:border-border/80 prose-pre:bg-background prose-pre:text-[0.8rem] prose-pre:leading-relaxed
            prose-li:text-muted prose-li:my-1
            prose-ul:my-4
            prose-blockquote:border-l-accent-soft/40 prose-blockquote:bg-surface/30 prose-blockquote:text-muted prose-blockquote:not-italic prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
            prose-hr:border-border
            prose-table:text-sm
            prose-th:text-muted prose-th:font-medium prose-th:border-border
            prose-td:border-border prose-td:text-muted
          "
        >
          {children}
        </div>

        <div className="mt-16 flex flex-col items-stretch gap-3 rounded-2xl border border-border/80 bg-surface/30 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-medium text-foreground">
              Building something AI-shaped?
            </p>
            <p className="mt-1 text-sm text-dim">
              60-min technical call &mdash; no slides, no pitch. Architecture,
              trade-offs, what would actually work for your stack.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
            <a
              href="mailto:petromilpavlov@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-bright"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <a
              href="https://cal.com/petropavlov/intro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-4 py-2 text-sm font-medium text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10"
            >
              <Calendar className="h-4 w-4" />
              Book a 20-min intro
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
