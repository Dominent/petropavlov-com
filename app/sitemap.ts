// Dynamic sitemap — replaces the static /public/sitemap.xml that was
// stale and missing the blog entirely. Next.js serves this at
// /sitemap.xml automatically.
//
// Includes every published route + every blog post in posts.ts, with
// per-route lastmod, changefreq, and priority. New blog posts appear
// in the sitemap on the next deploy (or sooner — pages have
// revalidate=60 so the sitemap also revalidates).

import type { MetadataRoute } from 'next'
import { listPosts } from './blog/posts'

const BASE = 'https://petropavlov.dev'

// Top-level routes that don't change often.
const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '/',                              changeFrequency: 'monthly', priority: 1.0 },
  { path: '/blog',                          changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/case-studies/gramota',          changeFrequency: 'yearly',  priority: 0.9 },
  { path: '/case-studies/insight-draft',    changeFrequency: 'yearly',  priority: 0.9 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    // Use today's date for now — these pages revalidate every 60s in
    // production so "today" is honest. A more precise scheme would
    // pull per-route content timestamps from a content registry.
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const blogEntries: MetadataRoute.Sitemap = listPosts().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    // Post `date` is the publication date — use it as lastModified.
    // When a post is updated, bumping the date in posts.ts is the
    // canonical signal to refresh crawlers.
    lastModified: new Date(`${p.date}T00:00:00Z`),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...blogEntries]
}
