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
}

const serviceLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Petro Pavlov · Senior Engineering Consulting',
  provider: { '@type': 'Person', name: 'Petromil Pavlov', url: 'https://petropavlov.dev/' },
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
  url: 'https://petropavlov.dev/',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
        {/* LCP preload — portrait above the fold. Same as Vite build. */}
        <link
          rel="preload"
          as="image"
          href="/petro.webp"
          type="image/webp"
          fetchPriority="high"
        />
        {/* Resource hints — Cal.com booking modal */}
        <link rel="preconnect" href="https://app.cal.com" />
        <link rel="dns-prefetch" href="https://app.cal.com" />
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
