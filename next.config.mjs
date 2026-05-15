// Next.js config for petropavlov.dev.
//
//  - Static generation (SSG) for /, /case-studies/*, /blog/*
//  - MDX support for blog posts (app/blog/<slug>/page.mdx)
//  - Existing /api/* routes still serve as Vercel functions until
//    migrated to app/api/*/route.ts in a follow-up

import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    // GitHub Flavored Markdown — gives us tables, autolinks, strike-
    // through, task lists. Without this, pipe-style tables render as
    // literal "| col | col |" text in the prose output. Code blocks
    // and syntax highlighting are still handled by our <Code> React
    // component (Shiki on the client) rather than rehype-pretty-code,
    // because <Code> already lives in the design system used by the
    // case studies and we want consistency.
    //
    // String reference (not the imported function) — Turbopack
    // requires serialisable plugin options. Function references
    // throw "does not have serializable options" at build time.
    remarkPlugins: [['remark-gfm']],
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // MDX files become routable pages alongside .tsx/.ts.
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  // Keep image optimization off for now — we self-host fonts + portrait
  // and use <picture> with preload manually. Next/Image can be adopted
  // later once the migration is stable.
  images: { unoptimized: true },
}

export default withMDX(nextConfig)
