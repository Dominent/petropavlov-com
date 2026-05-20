import type { Metadata, Viewport } from 'next'
import Script from 'next/script'

// Self-hosted fonts via Fontsource — same setup as the Vite build.
// Variable fonts for Inter + JetBrains Mono, static 400 + italic for
// Instrument Serif.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource/instrument-serif'
import '@fontsource/instrument-serif/400-italic.css'

import './globals.scss'
import { PulseInit } from './_components/pulse-init'
import { ExperimentsScript } from './_components/experiments-script'

export const metadata: Metadata = {
  metadataBase: new URL('https://petropavlov.dev'),
  title: 'Petro Pavlov · Senior Full-Stack & AI Engineer · Consulting & Project Work',
  description:
    'Petro Pavlov — senior full-stack and AI engineer with 10+ years shipping production software at VMware, CData Virtuality (AI research team), TestGorilla, Walltopia, and Octopus Energy. Builds AI products end-to-end — RAG, fine-tuning, NL→SQL, LLM orchestration. Available for consulting and project work — primarily US (NYC, SF, Boston), Canada (Toronto, Montreal, Vancouver), and Israel (Tel Aviv); also open to EU/UK clients. Tel Aviv shares my timezone; North-American East-Coast mornings overlap with Sofia afternoons. Invoiced in USD, CAD, or EUR.',
  keywords: [
    'Petro Pavlov',
    'Petromil Pavlov',
    'senior full-stack engineer',
    'AI engineer',
    'AI consulting',
    'freelance AI engineer',
    'remote engineer for US clients',
    'remote engineer for Canadian clients',
    'remote engineer for Israeli clients',
    'Tel Aviv remote engineer',
    'Israeli tech freelancer',
    'remote engineer Toronto',
    'remote engineer Montreal',
    'remote engineer Vancouver',
    'freelance AI engineer NYC',
    'freelance AI engineer SF',
    'US Canada Israel EU contractor',
    'RAG',
    'fine-tuning',
    'LLM orchestration',
    'Claude',
    'OpenAI',
    'Angular',
    '.NET',
    'NL to SQL',
    'Cursor',
    'Claude Code',
    'Sofia Bulgaria',
    'Insight Draft',
    'Gramota',
    'CData Virtuality',
    'VMware',
    'TestGorilla',
    'Octopus Energy',
  ],
  authors: [{ name: 'Petro Pavlov' }],
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  alternates: { canonical: 'https://petropavlov.dev/' },
  openGraph: {
    type: 'website',
    siteName: 'Petro Pavlov',
    locale: 'en_US',
    url: 'https://petropavlov.dev/',
    title: 'Petro Pavlov · Senior Full-Stack & AI Engineer',
    description:
      '10+ years shipping production software. Most recently on the AI research team at CData Virtuality. Now building AI products end-to-end — RAG, fine-tuning, LLM orchestration. Available for consulting — primarily 🇺🇸 US (NYC · SF · Boston), 🇨🇦 Canada (Toronto · Montreal · Vancouver), and 🇮🇱 Israel (Tel Aviv); 🇪🇺 EU/UK clients welcome too.',
    images: [
      {
        url: 'https://petropavlov.dev/og.png',
        width: 1200,
        height: 630,
        alt: 'Petro Pavlov — Senior Full-Stack & AI Engineer. Sofia, Bulgaria.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petro Pavlov · Senior Full-Stack & AI Engineer',
    description:
      'Builds AI products end-to-end. RAG, fine-tuning, LLM orchestration. Available for consulting — 🇺🇸 US · 🇨🇦 Canada · 🇮🇱 Israel · 🇪🇺 EU/UK.',
    images: ['https://petropavlov.dev/og.png'],
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#09090b',
  colorScheme: 'dark',
}

// JSON-LD structured data — Person + ProfessionalService schemas.
// Kept inline as the Vite build had them — search engines parse this
// directly out of the served HTML.
const personLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Petromil Pavlov',
  alternateName: 'Petro Pavlov',
  url: 'https://petropavlov.dev/',
  image: 'https://petropavlov.dev/petro.jpg',
  email: 'mailto:petromilpavlov@gmail.com',
  jobTitle: 'Senior Full-Stack & AI Engineer',
  description:
    'Senior full-stack and AI engineer with 10+ years shipping production software. Builds AI products end-to-end — RAG, fine-tuning, LLM orchestration. Available for consulting and project work.',
  address: { '@type': 'PostalAddress', addressLocality: 'Sofia', addressCountry: 'BG' },
  sameAs: ['https://github.com/Dominent', 'https://www.linkedin.com/in/petro-p-insight-draft/'],
  // Entity-level expertise. Lets AI search engines surface this Person
  // for topical queries beyond just job title — e.g., "TypeScript SDK
  // for EU Digital Identity Wallet" or "low-traffic A/B testing".
  knowsAbout: [
    'AI product engineering',
    'RAG (retrieval-augmented generation)',
    'LLM orchestration',
    'Fine-tuning (Qwen3)',
    'NL-to-SQL',
    'Anthropic SDK',
    'OpenAI SDK',
    'Claude Code',
    'Cursor',
    'TypeScript',
    'Angular',
    '.NET / C#',
    'Node.js',
    'PostgreSQL',
    'Chrome extensions (Manifest V3)',
    'OAuth 2.0 / OIDC',
    'OID4VP / OID4VCI',
    'eIDAS 2 / EU Digital Identity Wallet',
    'Stripe payments integration',
    'X.509 PKI',
    'Self-hosted analytics',
    'A/B testing infrastructure',
    'Web Vitals',
    'Next.js',
  ],
}

// WebSite schema — entity linking for the site itself. Helps search
// engines and AI crawlers understand petropavlov.dev as a single
// coherent entity rather than a loose collection of pages.
const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Petro Pavlov',
  alternateName: 'petropavlov.dev',
  url: 'https://petropavlov.dev/',
  description:
    'Senior full-stack and AI engineer. Case studies, blog, and consulting availability.',
  author: { '@type': 'Person', name: 'Petromil Pavlov', url: 'https://petropavlov.dev/' },
  inLanguage: 'en',
}

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Petro Pavlov · Senior Engineering Consulting',
  provider: { '@type': 'Person', name: 'Petromil Pavlov', url: 'https://petropavlov.dev/' },
  // Recommended LocalBusiness/ProfessionalService fields.
  // `$$$` = premium/senior contractor band per schema.org convention;
  // accurate without committing to a specific number that anchors
  // negotiation. `address` mirrors the Person address.
  address: { '@type': 'PostalAddress', addressLocality: 'Sofia', addressCountry: 'BG' },
  priceRange: '$$$',
  image: 'https://petropavlov.dev/petro.webp',
  // Primary markets first (US, Canada, Israel), then EU/UK secondary.
  // Cities listed at the end for crawlers that read both granularities.
  areaServed: [
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Country', name: 'Canada' },
    { '@type': 'Country', name: 'Israel' },
    { '@type': 'Country', name: 'United Kingdom' },
    { '@type': 'Country', name: 'Germany' },
    { '@type': 'Country', name: 'Netherlands' },
    { '@type': 'Country', name: 'Bulgaria' },
    { '@type': 'City', name: 'New York' },
    { '@type': 'City', name: 'San Francisco' },
    { '@type': 'City', name: 'Boston' },
    { '@type': 'City', name: 'Toronto' },
    { '@type': 'City', name: 'Montreal' },
    { '@type': 'City', name: 'Vancouver' },
    { '@type': 'City', name: 'Tel Aviv' },
  ],
  serviceType: [
    'AI product engineering',
    'Senior full-stack consulting',
    'Architecture review',
    'End-to-end project builds',
    'LLM orchestration',
    'RAG implementation',
    'Identity & payments integration',
  ],
  // Concrete offerings with descriptions — gives crawlers (and AI
  // search engines) something more specific than a flat serviceType
  // list. Each item is a distinct engagement shape buyers would
  // search for.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Consulting & project engagements',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'AI product engineering — end-to-end',
          description:
            'Ship an AI product from prompt design through fine-tuned adapters, production RAG, and the identity / payments / integrations layer. Anthropic + OpenAI SDKs daily; Claude Code + Cursor for development.',
          serviceType: 'AI engineering',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Architecture review',
          description:
            'Trace your existing AI / full-stack architecture end-to-end. Identify the highest-risk failure modes under load and the highest-leverage simplifications. Written report + walkthrough call.',
          serviceType: 'Architecture consulting',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Fractional senior IC',
          description:
            'Multi-month retained engagement — embedded with one or two of your senior engineers, owning a slice of the codebase (AI service, identity / payments layer, etc.) and handing it off when complete.',
          serviceType: 'Fractional engineering',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'EU Digital Identity Wallet (eIDAS 2) integration',
          description:
            'Wire OID4VP / OID4VCI / SD-JWT VC / X.509 certificate management into your stack against the 2027 EU acceptance deadline. Tested against the EU Commission reference infrastructure. See the Gramota case study.',
          serviceType: 'Digital identity integration',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Chrome extension engineering (Manifest V3)',
          description:
            'Production Chrome extensions — tabCapture / desktopCapture / content scripts, multi-package monorepos, E2E test suites, Web Store publishing. 2+ years on a published meeting-recorder extension.',
          serviceType: 'Browser extension engineering',
        },
      },
    ],
  },
  url: 'https://petropavlov.dev/',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* color-scheme is also emitted by Next.js from the viewport
            export — keeping ONE source. The viewport export below is
            authoritative; this <meta> was duplicating it. */}
        {/* Resource hints — Cal.com booking modal. preconnect alone
            opens DNS+TCP+TLS; the redundant dns-prefetch was dropped
            (preconnect supersedes it on browsers that support both,
            which is everything ≥ Chrome 80 / Safari 11.3). */}
        <link rel="preconnect" href="https://app.cal.com" />
        {/* NOTE: The /petro.avif LCP preload used to live here. It
            was being emitted on every page (blog, case studies, etc.)
            even though the portrait only renders in the home Hero —
            wasting a high-priority bandwidth slot and a connection.
            Moved into the Hero components themselves so React 19
            hoists it into <head> only when Hero actually renders. */}
        {/* Auto-discovery for the blog RSS feed. Feedly / NetNewsWire /
            Reeder pick this up when a reader subscribes to /blog. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Petro Pavlov · Blog"
          href="/blog/feed.xml"
        />
        {/* Inline active A/B experiments as JSON so the Pulse client SDK
            reads variant assignments synchronously on init — before the
            first view event fires. Pages using this layout must export
            `revalidate = 60` for the inlined data to refresh between
            deploys. */}
        <ExperimentsScript />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        {children}
        <PulseInit />
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <Script
          id="ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
        <Script
          id="ld-service"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
      </body>
    </html>
  )
}
