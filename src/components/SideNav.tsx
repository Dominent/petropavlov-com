import { useEffect, useState } from 'react'
import clsx from 'clsx'

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="fixed top-0 left-0 z-40 hidden h-screen w-56 flex-col justify-center px-10 lg:flex">
      <ul className="space-y-3">
        {sections.map(({ id, label, num }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(
                'group flex items-center gap-3 font-mono text-xs uppercase tracking-wider transition-all',
                active === id
                  ? 'text-amber-400'
                  : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              <span
                className={clsx(
                  'h-px transition-all',
                  active === id
                    ? 'w-12 bg-amber-400'
                    : 'w-6 bg-zinc-700 group-hover:w-10 group-hover:bg-zinc-400'
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
    <header className="fixed top-0 right-0 left-0 z-30 border-b border-zinc-900/50 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6 lg:pl-72">
        <a href="#hero" className="font-mono text-sm font-medium tracking-tight">
          <span className="text-amber-400">$</span>{' '}
          <span className="text-zinc-100">petro.pavlov</span>
          <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-amber-400 align-middle" />
        </a>
        <a
          href="#contact"
          className="font-mono text-xs uppercase tracking-wider text-zinc-400 transition-colors hover:text-amber-400"
        >
          Get in touch &rarr;
        </a>
      </div>
    </header>
  )
}
