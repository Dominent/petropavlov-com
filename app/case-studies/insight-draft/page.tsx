import type { Metadata } from 'next'
import Script from 'next/script'
import { InsightDraftCaseStudyContent } from './content'

const TITLE = 'Building an AI meeting SaaS end-to-end while bots get banned'
const DESCRIPTION =
  'Insight Draft case study — Chrome extension recording without bots, 6+ parallel LLM calls per meeting, custom Hangfire fan-out/fan-in, statistical-voting speaker mapping. What was hard, what shipped, what I would do differently.'
const URL = 'https://petropavlov.dev/case-studies/insight-draft'
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
  dateModified: PUBLISHED,
  image: `${URL}/opengraph-image`,
  author: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
    image: 'https://petropavlov.dev/petro.webp',
    sameAs: [
      'https://github.com/Dominent',
      'https://www.linkedin.com/in/petro-p-insight-draft/',
    ],
  },
  publisher: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  url: URL,
  inLanguage: 'en',
  about: [
    'AI meeting notes',
    'Chrome extension',
    'Manifest V3',
    'Deepgram',
    'OpenAI Responses API',
    'RAG',
    'Hangfire',
    'Stripe',
    '.NET',
    'Angular',
  ],
  keywords:
    'AI meeting notes, Chrome extension, Manifest V3, tabCapture, Deepgram, OpenAI Responses API, RAG, Hangfire, Stripe, .NET, Angular, no-bot recording',
}

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://petropavlov.dev/' },
    { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://petropavlov.dev/#work' },
    { '@type': 'ListItem', position: 3, name: 'Insight Draft', item: URL },
  ],
}

export default function InsightDraftCaseStudyPage() {
  return (
    <>
      <Script
        id="ld-article-insight-draft"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
      />
      <Script
        id="ld-breadcrumb-insight-draft"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }}
      />
      <InsightDraftCaseStudyContent />
    </>
  )
}
