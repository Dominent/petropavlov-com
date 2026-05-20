import type { Metadata } from 'next'
import Script from 'next/script'
import { GramotaCaseStudyContent } from './content'

const TITLE = 'Building a TypeScript SDK for the EU Digital Identity Wallet'
const DESCRIPTION =
  '15 published npm packages, 579 mock + 31 live conformance tests against EU reference infrastructure, end-to-end roundtrips with the patched EU Android wallet. The Gramota case study — what was hard, what I shipped, and what I would do differently.'
const URL = 'https://petropavlov.dev/case-studies/gramota'
const PUBLISHED = '2026-05-10'

// ISR — regenerate every 60s so the inlined experiments JSON (in
// app/layout) refreshes between deploys.
export const revalidate = 60

export const metadata: Metadata = {
  title: `${TITLE} · Petro Pavlov`,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: 'article',
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    // No explicit images — sibling opengraph-image.tsx provides the
    // per-case-study card with the title rendered.
    publishedTime: PUBLISHED,
    authors: ['Petromil Pavlov'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    // Twitter inherits the OG image when not set explicitly.
  },
}

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  author: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
  },
  publisher: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  url: URL,
  about: [
    'EU Digital Identity Wallet',
    'eIDAS 2',
    'OID4VP',
    'OID4VCI',
    'SD-JWT VC',
    'DPoP',
    'DCQL',
    'TypeScript',
  ],
  keywords:
    'EU Digital Identity Wallet, eIDAS 2, OID4VP, OID4VCI, SD-JWT VC, DPoP, DCQL, TypeScript SDK, EUDIW, verifier, issuer',
}

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://petropavlov.dev/' },
    { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://petropavlov.dev/#work' },
    { '@type': 'ListItem', position: 3, name: 'Gramota', item: URL },
  ],
}

export default function GramotaCaseStudyPage() {
  return (
    <>
      <Script
        id="ld-article-gramota"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
      />
      <Script
        id="ld-breadcrumb-gramota"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <GramotaCaseStudyContent />
    </>
  )
}
