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
  // Posts will be added here. First one (the A/B framework writeup)
  // ships as part of Phase 3.
]

export function listPosts(): PostMeta[] {
  return POSTS
    .filter((p) => p.published !== false)
    .sort((a, b) => (b.date > a.date ? 1 : -1))
}

export function findPost(slug: string): PostMeta | undefined {
  return POSTS.find((p) => p.slug === slug && p.published !== false)
}
