// Per-post OG image for /blog/ab-testing-a-portfolio-that-gets-20-visits-a-day.
// Renders at edge time via ImageResponse — outputs a 1200×630 PNG with
// the post title overlaid on the site's design language. Replaces the
// generic /og.png that every share-card was using until now.

import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize, ogContentType } from '../../_components/og-template'

export const runtime = 'edge'
export const alt = 'A/B testing a portfolio that gets 20 visits a day — petropavlov.dev'
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        tag="blog post"
        title="A/B testing a portfolio that gets 20 visits a day"
        subtitle="I built feature flags + significance testing into my portfolio, then did the math on whether I should actually run it."
      />
    ),
    { ...size },
  )
}
