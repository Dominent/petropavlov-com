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
    images: ['https://petropavlov.dev/og.png'],
    publishedTime: PUBLISHED,
    authors: ['Petromil Pavlov'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['https://petropavlov.dev/og.png'],
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

export default function InsightDraftCaseStudyPage() {
  return (
    <>
      <Script
        id="ld-article-insight-draft"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ARTICLE_SCHEMA) }}
      />
      <InsightDraftCaseStudyContent />
    </>
  )
}
