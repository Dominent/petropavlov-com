'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { track } from '../pulse/client'

const sections = [
  { id: 'hero', label: 'Intro', num: '00' },
  { id: 'work', label: 'Selected Work', num: '01' },
  { id: 'ai', label: 'AI Engineering', num: '02' },
  { id: 'experience', label: 'Where I’ve Built', num: '03' },
  { id: 'about', label: 'About', num: '04' },
  { id: 'ask', label: 'Ask Petro', num: '05' },
  { id: 'testimonials', label: 'What people say', num: '06' },
  { id: 'contact', label: 'Contact', num: '07' },
]

export function SideNav() {
  const [active, setActive] = useState('hero')

  // Active-section detection. We previously used IntersectionObserver
  // with a 5%-wide trigger band at 40-45% of the viewport, but that
  // band can't be reached by the last few sections when the page hits
  // its scroll limit — they stay below the band forever, so the active
  // highlight gets stuck on whatever was last in view.
  //
  // The scroll-position approach instead asks "which section's top has
  // crossed the 40% line, picking the lowest one that has?" This is
  // monotonic in scroll position so the highlight always advances, and
  // we explicitly force the last section active when the page is at
  // the bottom (so contact lights up even if it's a short section).
  useEffect(() => {
    function update() {
      const triggerLine = window.innerHeight * 0.4
      let next = sections[0].id
      for (const { id } of sections) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= triggerLine) {
          next = id
        }
      }
      // Scrolled to the bottom? Force the last section active.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      if (atBottom) next = sections[sections.length - 1].id
      setActive(next)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 z-40 hidden h-screen w-56 flex-col justify-center px-10 lg:flex">
      <ul className="space-y-3">
        {sections.map(({ id, label, num }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => track('nav_click', { target: id, source: 'side_nav' })}
              className={clsx(
                'group flex items-center gap-3 font-mono text-xs uppercase tracking-wider transition-all',
                active === id
                  ? 'text-accent'
                  : 'text-faint hover:text-muted'
              )}
            >
              <span
                className={clsx(
                  'h-px transition-all',
                  active === id
                    ? 'w-12 bg-accent'
                    : 'w-6 bg-border-strong group-hover:w-10 group-hover:bg-dim'
                )}
              />
              <span>
                <span className="opacity-50">{num}</span>{' '}
                <span>{label}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-0 z-30 border-b border-border-subtle/50 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 lg:pl-72">
        <a
          href="#hero"
          onClick={() => track('nav_click', { target: 'hero', source: 'top_bar_logo' })}
          className="font-mono text-sm font-medium tracking-tight"
        >
          <span className="text-accent">$</span>{' '}
          <span className="text-foreground">petro.pavlov</span>
          <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-accent align-middle" />
        </a>
        <nav className="flex items-center gap-5">
          <Link
            href="/blog"
            onClick={() => track('nav_click', { target: 'blog', source: 'top_bar' })}
            className="font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-accent"
          >
            Blog
          </Link>
          <a
            href="#contact"
            onClick={() => track('nav_click', { target: 'contact', source: 'top_bar' })}
            className="font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-accent"
          >
            Get in touch &rarr;
          </a>
        </nav>
      </div>
    </header>
  )
}
