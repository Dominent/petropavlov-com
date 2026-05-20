// RSS 2.0 feed at /blog/feed.xml. Auto-discovers via the
// <link rel="alternate" type="application/rss+xml"> tag in layout.tsx
// so Feedly / NetNewsWire / Reeder / etc. find it automatically when a
// reader subscribes to the bare blog URL.
//
// Rebuilt on every request rather than statically, but the response
// has a 1h s-maxage cache so the edge serves it without re-rendering
// in the common case. Adding a new post and redeploying invalidates
// the cache naturally.

import { listPosts } from '../posts'

const BASE = 'https://petropavlov.dev'

export const runtime = 'nodejs'
export const revalidate = 3600 // 1 hour

export async function GET(): Promise<Response> {
  const posts = listPosts()
  const lastBuildDate = posts.length > 0
    ? new Date(`${posts[0].date}T00:00:00Z`).toUTCString()
    : new Date().toUTCString()

  const items = posts
    .map((p) => {
      const link = `${BASE}/blog/${p.slug}`
      const pubDate = new Date(`${p.date}T00:00:00Z`).toUTCString()
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      ${p.description ? `<description>${esc(p.description)}</description>` : ''}
      <dc:creator>Petromil Pavlov</dc:creator>
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Petro Pavlov · Blog</title>
    <link>${BASE}/blog</link>
    <atom:link href="${BASE}/blog/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on building production AI products, self-hosted infrastructure, and the engineering behind petropavlov.dev itself.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      // Edge-cache for an hour, allow 6h stale-while-revalidate.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=21600',
    },
  })
}

const ESC_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC_MAP[c] ?? c)
}
