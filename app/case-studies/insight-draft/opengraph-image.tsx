// Per-case-study OG image for /case-studies/insight-draft.

import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize, ogContentType } from '../../_components/og-template'

export const runtime = 'edge'
export const alt = 'Insight Draft — AI meeting SaaS, bot-free recording · petropavlov.dev'
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        tag="case study · AI meeting SaaS"
        title="Building an AI meeting SaaS end-to-end while bots get banned"
        subtitle="Bot-free recording across Meet · Teams · Zoom. 6 LLM call types per meeting. Custom Hangfire fan-out/fan-in over Postgres."
      />
    ),
    { ...size },
  )
}
