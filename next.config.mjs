// Next.js config for petropavlov.dev.
//
//  - Static generation (SSG) for /, /case-studies/*, /blog/*
//  - MDX support for blog posts (app/blog/<slug>/page.mdx)
//  - Existing /api/* routes still serve as Vercel functions until
//    migrated to app/api/*/route.ts in a follow-up

import createMDX from '@next/mdx'

const withMDX = createMDX({
  // No remark/rehype plugins yet — keep the surface small. Adding
  // remark-gfm + rehype-pretty-code (or shiki) later when the first
  // post needs them is one line each here.
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
