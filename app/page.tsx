// Home page — same composition as the Vite build's src/pages/Home.tsx.
// All section components carry their own 'use client' directives where
// they use browser-only APIs (Framer Motion, hooks, IntersectionObserver),
// so Next.js still pre-renders them to static HTML at build time but
// they hydrate after first paint.

import { SideNav, TopBar } from '../src/components/SideNav'
import { Hero } from '../src/components/Hero'
import { SelectedWork } from '../src/components/SelectedWork'
import { AIEngineering } from '../src/components/AIEngineering'
import { Experience } from '../src/components/Experience'
import { About } from '../src/components/About'
import { AskPetro } from '../src/components/AskPetro'
import { Testimonials } from '../src/components/Testimonials'
import { Contact } from '../src/components/Contact'

// ISR — page is statically prerendered but regenerates every 60s on
// the next visit. Lets the inlined experiments JSON (in app/layout
// via ExperimentsScript) reflect experiment status changes within
// ~60s of activation, without requiring a redeploy.
export const revalidate = 60

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <TopBar />
      <SideNav />
      <main className="lg:pl-56">
        <div className="mx-auto max-w-5xl px-6 lg:px-12">
          <Hero />
        </div>
        <SelectedWork />
        <AIEngineering />
        <Experience />
        <About />
        <AskPetro />
        <Testimonials />
        <Contact />
      </main>
    </div>
  )
}
