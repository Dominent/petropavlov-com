import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Mail, MessageSquare } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './BrandIcons'
import { SectionLabel } from './SectionLabel'
import { ContactDialog } from './ContactDialog'
import { track } from '../pulse/client'

export function Contact() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel num="07" title="Get in touch" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="mb-2 max-w-xl text-2xl text-foreground md:text-3xl">
            I take on{' '}
            <span className="font-serif italic text-accent-bright/90">
              consulting engagements
            </span>{' '}
            and{' '}
            <span className="font-serif italic text-accent-bright/90">
              end-to-end project builds
            </span>{' '}
            &mdash; most often around AI products, identity systems, and
            senior full-stack work.
          </p>
          <p className="text-faint">
            Remote-first &mdash; clients across{' '}
            <span className="text-muted">
              🇪🇺 Europe, 🇮🇱 Israel (Tel Aviv), 🇺🇸 US (NYC · SF), and 🇨🇦
              Canada (Toronto · Montreal · Vancouver)
            </span>
            . Tel Aviv shares my timezone; East-Coast mornings overlap
            with my afternoons; Pacific via late-day sync. Invoiced in
            USD, CAD, or EUR via Stripe and Wise.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <a
            href="mailto:petromilpavlov@gmail.com"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-bright"
          >
            <Mail className="h-4 w-4" />
            petromilpavlov@gmail.com
          </a>
          <button
            type="button"
            data-cal-link="petropavlov/intro"
            data-cal-namespace=""
            data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
            onClick={() => track('cal_click', { source: 'contact' })}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-5 py-3 text-sm font-medium text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
            Book a 20-min intro
          </button>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-surface/40 px-5 py-2 text-xs text-dim transition-colors hover:border-border-strong hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Or send via form
          </button>
        </div>
      </motion.div>

      <ContactDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <div className="mt-12 grid gap-4 rounded-xl border border-border/60 bg-surface/20 p-5 sm:grid-cols-3">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent/80">
            How I work
          </div>
          <div className="text-sm leading-relaxed text-muted">
            Embedded with your team &mdash; async-first, weekly written
            updates, scoped checkpoints. NDAs welcome.
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent/80">
            Engagement length
          </div>
          <div className="text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">Open-ended</span> &mdash;
            single review sessions, scoped projects, multi-month builds,
            or long-running retainers / fractional roles. Whatever the
            work needs.
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-accent/80">
            Time to start
          </div>
          <div className="text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">Right away</span> or
            within a few days &mdash; drop a line and we&rsquo;ll sync this week.
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 border-t border-border-subtle pt-8 font-mono text-xs text-faint">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href="https://github.com/Dominent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            github.com/Dominent
          </a>
          <a
            href="https://www.linkedin.com/in/petro-p-insight-draft/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-accent"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
            linkedin.com/in/petro-p-insight-draft
          </a>
          <span className="ml-auto">
            built with React, TypeScript &amp; Tailwind &middot; designed &amp;
            coded by Petro
          </span>
        </div>
        <p className="max-w-3xl text-[11px] leading-relaxed text-ghost">
          Privacy: this site uses{' '}
          <span className="text-dim">Pulse</span>, a self-hosted
          privacy-first analytics library — aggregate page views, Core
          Web Vitals, and a few interaction events only. No cookies. No
          IPs stored. No fingerprinting. Sessions are deduplicated via a
          server-side daily-rotating hash that becomes unlinkable after
          24 hours. A non-personal random ID is stored in your browser&rsquo;s
          localStorage to support multi-touch attribution — first-party
          only, never shared, easily cleared via your browser&rsquo;s
          site-data settings. Contact-form submissions go to
          petromilpavlov@gmail.com via Resend and aren&rsquo;t stored
          anywhere else. Email Petro to delete any data.
        </p>
      </div>
    </section>
  )
}
