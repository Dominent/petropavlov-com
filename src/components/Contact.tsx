import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageSquare } from 'lucide-react'
import { GithubIcon, LinkedinIcon } from './BrandIcons'
import { SectionLabel } from './SectionLabel'
import { ContactDialog } from './ContactDialog'

export function Contact() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel num="06" title="Get in touch" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="mb-2 max-w-xl text-2xl text-zinc-100 md:text-3xl">
            I take on{' '}
            <span className="font-serif italic text-amber-200/90">
              consulting engagements
            </span>{' '}
            and{' '}
            <span className="font-serif italic text-amber-200/90">
              end-to-end project builds
            </span>{' '}
            &mdash; most often around AI products, identity systems, and
            senior full-stack work.
          </p>
          <p className="text-zinc-500">
            Remote-first &mdash; available for{' '}
            <span className="text-zinc-300">EU and US clients</span>,
            comfortable across timezones.
          </p>
        </div>
        <div className="flex flex-col items-stretch gap-2 md:items-end">
          <a
            href="mailto:petromilpavlov@gmail.com"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 px-5 py-3 text-sm font-medium text-zinc-950 transition-all hover:bg-amber-300"
          >
            <Mail className="h-4 w-4" />
            petromilpavlov@gmail.com
          </a>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-5 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Or send via form
          </button>
        </div>
      </motion.div>

      <ContactDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />

      <div className="mt-12 grid gap-4 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-5 sm:grid-cols-3">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
            How I work
          </div>
          <div className="text-sm leading-relaxed text-zinc-300">
            Embedded with your team, async-friendly, weekly written updates.
            NDAs welcome.
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
            Engagement length
          </div>
          <div className="text-sm leading-relaxed text-zinc-300">
            Typical projects run <span className="font-medium text-zinc-100">4&ndash;12 weeks</span>;
            consulting from a single review session up to fractional retainers.
          </div>
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
            Time to start
          </div>
          <div className="text-sm leading-relaxed text-zinc-300">
            <span className="font-medium text-zinc-100">Right away</span> or a couple
            of days &mdash; drop a line and we can sync this week.
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-4 border-t border-zinc-900 pt-8 font-mono text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href="https://github.com/Dominent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-amber-400"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            github.com/Dominent
          </a>
          <a
            href="https://www.linkedin.com/in/petro-p-insight-draft/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-amber-400"
          >
            <LinkedinIcon className="h-3.5 w-3.5" />
            linkedin.com/in/petro-p-insight-draft
          </a>
          <span className="ml-auto">
            built with React, TypeScript &amp; Tailwind &middot; designed &amp;
            coded by Petro
          </span>
        </div>
        <p className="max-w-3xl text-[11px] leading-relaxed text-zinc-600">
          Privacy: this site uses{' '}
          <span className="text-zinc-400">cookieless analytics by Vercel</span>
          {' '}— aggregate page views and referrers only, no tracking cookies,
          no fingerprinting. Contact-form submissions are delivered to
          petromilpavlov@gmail.com via Resend and are not stored anywhere
          else. Email Petro to delete any data.
        </p>
      </div>
    </section>
  )
}
