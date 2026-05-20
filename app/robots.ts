// Dynamic robots.txt — Next.js serves this at /robots.txt.
// Replaces the static public/robots.txt so the sitemap URL stays
// in sync with whatever the deploy environment exposes.

import type { MetadataRoute } from 'next'

const BASE = 'https://petropavlov.dev'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Don't expose the admin surface to crawlers. Real admin auth
        // is HTTP Basic, but disallowing here keeps the URLs out of
        // search results and reduces wasted crawl budget.
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}
