// Per-post OG image for /blog/hosting-another-apps-window-inside-yours.

import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize, ogContentType } from '../../_components/og-template'

export const runtime = 'edge'
export const alt = "Hosting another app's window inside yours — petropavlov.dev"
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        tag="blog post"
        title="Hosting another app's window inside yours"
        subtitle="The obvious way to embed a window ate every key press. What Windows and macOS actually allow."
      />
    ),
    { ...size },
  )
}
