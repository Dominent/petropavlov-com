// Per-case-study OG image for /case-studies/gramota.

import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize, ogContentType } from '../../_components/og-template'

export const runtime = 'edge'
export const alt = 'Gramota — TypeScript SDK for the EU Digital Identity Wallet · petropavlov.dev'
export const size = ogSize
export const contentType = ogContentType

export default async function Image() {
  return new ImageResponse(
    (
      <OgTemplate
        tag="case study · eIDAS 2"
        title="Building a TypeScript SDK for the EU Digital Identity Wallet"
        subtitle="15 npm packages with Sigstore provenance · ~580 conformance tests · end-to-end roundtrips against the EU reference wallet."
      />
    ),
    { ...size },
  )
}
