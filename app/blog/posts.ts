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
  date: string         // YYYY-MM-DD — publication date, used for ordering
  modified?: string    // YYYY-MM-DD — last meaningful content update.
                       // Defaults to `date` if omitted. Bumping this is
                       // the canonical signal for crawlers + sitemap
                       // that the post was refreshed.
  readMinutes?: number
  published?: boolean  // false = draft, hidden from listing
}

const POSTS: PostMeta[] = [
  {
    slug: 'hosting-another-apps-window-inside-yours',
    title: "Hosting another app's window inside yours",
    description:
      'Switchboard shows several Claude desktop instances as tabs in one window. The obvious way to embed a window ate every key press — here is what Windows and macOS actually allow, and how a sign-in link finds the right tab.',
    date: '2026-09-20',
    readMinutes: 6,
    published: true,
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
