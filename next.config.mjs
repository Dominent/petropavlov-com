// Next.js config for the petropavlov.dev migration.
//
// Goals during migration:
//  - Static generation (SSG) for /, /case-studies/*, /cv (handled separately)
//  - Existing /api/* routes from Vercel functions ported to app/api/*/route.ts
//  - SCSS support (we already have src/index.scss using Tailwind v4 via
//    the @tailwindcss/postcss plugin)
//  - React 19 features and Server Components by default

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep image optimization off for now — we self-host fonts + portrait
  // and use <picture> with preload manually. Next/Image can be adopted
  // later once the migration is stable.
  images: { unoptimized: true },
}

export default nextConfig
