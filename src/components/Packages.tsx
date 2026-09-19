'use client'

import { motion } from 'framer-motion'
import { Calendar, Check, Download } from 'lucide-react'
import { packages, type Package } from '../data/packages'
import { SectionLabel } from './SectionLabel'
import { track } from '../pulse/client'

export function Packages() {
  return (
    <section id="packages" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="07"
        title="Work with me"
        caption="Fixed-scope, fixed-price ways to start — pick a lane, or book a call and we'll shape the scope together."
      />

      <div className="grid items-stretch gap-6 md:grid-cols-3">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.id} pkg={pkg} index={i} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-10 flex flex-col gap-5 rounded-xl border border-border/60 bg-surface/20 p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Not sure which fits?{' '}
          <span className="text-foreground">
            Book a 20-min call and we&rsquo;ll shape the scope together.
          </span>{' '}
          Fixed scope agreed up front · invoiced in USD / CAD / EUR via Stripe
          &amp; Wise · NDAs welcome.
        </p>
        <div className="flex flex-shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            data-cal-link="petropavlov/intro"
            data-cal-namespace=""
            data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
            onClick={() => track('cal_click', { source: 'packages', pack: 'general' })}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-bright"
          >
            <Calendar className="h-4 w-4" />
            Book a 20-min call
          </button>
          <a
            href="/cv"
            download="petro-pavlov-cv.pdf"
            onClick={() => track('cv_download', { source: 'packages' })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-5 py-2.5 text-sm text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Download CV
          </a>
        </div>
      </motion.div>
    </section>
  )
}

function PackageCard({ pkg, index }: { pkg: Package; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={
        pkg.featured
          ? 'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-accent-soft/50 bg-gradient-to-b from-accent-soft/[0.07] to-surface/20 p-6 shadow-[0_0_50px_-16px] shadow-accent-soft/30'
          : 'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-surface/60 to-surface/20 p-6 transition-colors hover:border-border-strong'
      }
    >
      {pkg.featured && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-accent-soft/10 blur-3xl"
          />
          <span className="absolute top-0 right-6 -translate-y-1/2 rounded-full border border-accent-soft/40 bg-background px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-bright">
            Recommended
          </span>
        </>
      )}

      <div className="relative flex items-center justify-between gap-3">
        <h3 className="text-lg font-medium tracking-tight text-foreground">
          {pkg.name}
        </h3>
        <span className="flex-shrink-0 rounded border border-border bg-background/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-faint">
          {pkg.timeline}
        </span>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        <span
          className={
            pkg.featured
              ? 'font-mono text-3xl font-medium text-accent-bright'
              : 'font-mono text-3xl font-medium text-accent'
          }
        >
          {pkg.price}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-faint">
          {pkg.priceNote}
        </span>
      </div>

      <p className="relative mt-3 text-sm leading-relaxed text-muted">
        {pkg.tagline}
      </p>

      <ul className="relative mt-5 space-y-2.5 border-t border-border/60 pt-5">
        {pkg.includes.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent/70" />
            <span className="text-[13px] leading-relaxed text-dim">{item}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-6">
        <div className="mb-4 font-mono text-[11px] uppercase tracking-wider text-faint">
          For {pkg.idealFor}
        </div>
        <button
          type="button"
          data-cal-link="petropavlov/intro"
          data-cal-namespace=""
          data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
          onClick={() => track('cal_click', { source: 'packages', pack: pkg.id })}
          className={
            pkg.featured
              ? 'inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-bright'
              : 'inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-5 py-2.5 text-sm font-medium text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground'
          }
        >
          <Calendar className="h-4 w-4" />
          {pkg.cta}
        </button>
      </div>
    </motion.div>
  )
}
