// Blog post index — the single source of truth for what shows up in
// the listing at /blog and (eventually) in the RSS feed.
//
// Each post lives at app/blog/<slug>/page.mdx and gets registered here
// with its display metadata. The MDX file owns the content + per-page
// metadata + JSON-LD schema; this file just answers "which posts
// exist and in what order".
//
// Keeping this as a hand-maintained list (vs. a glob over the
// filesystem) means the build doesn't need a custom plugin to crawl
// MDX frontmatter, and the listing order is whatever the author
// wants (newest first by convention).

export type PostMeta = {
  slug: string
  title: string
  description?: string
  date: string         // YYYY-MM-DD — used for both display and ordering
  readMinutes?: number
  published?: boolean  // false = draft, hidden from listing
}

const POSTS: PostMeta[] = [
  {
    slug: 'ab-testing-a-portfolio-that-gets-20-visits-a-day',
    title: 'A/B testing a portfolio that gets 20 visits a day',
    description:
      "I built feature flags + significance testing into my portfolio. Then I did the math and realised I shouldn't run it yet. Here's the framework anyway — and the spreadsheet that tells you when you actually should.",
    date: '2026-05-16',
    readMinutes: 9,
    // Set to true once you've proofread the post and want it on /blog.
    // Even while published=false, the page renders at the slug URL
    // (good for sharing for review).
    published: false,
  },
]

export function listPosts(): PostMeta[] {
  return POSTS
    .filter((p) => p.published !== false)
    .sort((a, b) => (b.date > a.date ? 1 : -1))
}

export function findPost(slug: string): PostMeta | undefined {
  return POSTS.find((p) => p.slug === slug && p.published !== false)
}
