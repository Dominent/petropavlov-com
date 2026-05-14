import { lazy, Suspense, useEffect } from 'react'
import { SideNav, TopBar } from '../components/SideNav'
import { Hero } from '../components/Hero'
import { SelectedWork } from '../components/SelectedWork'
import { AIEngineering } from '../components/AIEngineering'
import { Experience } from '../components/Experience'
import { About } from '../components/About'

// Below-the-fold sections — lazy-loaded so they're not in the initial
// JS bundle. The components themselves are moderately heavy (Framer
// Motion entry animations, the contact dialog, the AskPetro chat
// state machine), and most visitors don't scroll there before the
// hero has settled. After the main bundle hydrates we prefetch these
// chunks on idle so they're warm by the time a visitor reaches them.
const AskPetro = lazy(() =>
  import('../components/AskPetro').then((m) => ({ default: m.AskPetro })),
)
const Testimonials = lazy(() =>
  import('../components/Testimonials').then((m) => ({ default: m.Testimonials })),
)
const Contact = lazy(() =>
  import('../components/Contact').then((m) => ({ default: m.Contact })),
)

/**
 * Placeholder that reserves vertical space while a lazy section
 * loads. Sized roughly to the real section's height so the page
 * doesn't reshuffle when the chunk arrives — keeps CLS at 0.
 */
function SectionFallback({ minHeight }: { minHeight: string }) {
  return <div style={{ minHeight }} aria-hidden="true" />
}

export function Home() {
  useEffect(() => {
    // Idle-time prefetch — kick off the chunk downloads after the
    // hero render is done so they're ready when the visitor scrolls.
    // No-op if the visitor scrolls fast (Suspense handles it) or the
    // browser doesn't support requestIdleCallback.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
    }
    const prefetch = (): void => {
      void import('../components/AskPetro')
      void import('../components/Testimonials')
      void import('../components/Contact')
    }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(prefetch, { timeout: 3000 })
    } else {
      setTimeout(prefetch, 1500)
    }
  }, [])

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
        <Suspense fallback={<SectionFallback minHeight="640px" />}>
          <AskPetro />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight="320px" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionFallback minHeight="560px" />}>
          <Contact />
        </Suspense>
      </main>
    </div>
  )
}
