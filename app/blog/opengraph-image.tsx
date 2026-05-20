// OG image for the /blog index page.

import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize, ogContentType } from '../_components/og-template'

export const runtime = 'edge'
export const alt = 'Blog · Petro Pavlov — notes on building AI products and the engineering behind petropavlov.dev'
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        tag="blog"
        title="Notes from building production AI products and the engineering behind this site."
        subtitle="Self-hosted analytics, A/B frameworks, EUDIW integrations, and the engineering decisions that go into shipping."
      />
    ),
    { ...size },
  )
}
