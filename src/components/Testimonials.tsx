import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { testimonials } from '../data/testimonials'
import { SectionLabel } from './SectionLabel'
import { LinkedinIcon } from './BrandIcons'

export function Testimonials() {
  if (testimonials.length === 0) return null

  const single = testimonials.length === 1

  return (
    <section id="testimonials" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="06"
        title="What people say"
        caption="From past colleagues, in their own words."
      />

      <div
        className={
          single
            ? 'mx-auto max-w-4xl'
            : 'grid gap-6 md:grid-cols-2'
        }
      >
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className={`relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 ${
              single ? 'p-8 md:p-12' : 'p-6 md:p-8'
            }`}
          >
            <Quote
              className={`absolute top-6 right-6 text-amber-400/15 ${
                single ? 'h-14 w-14' : 'h-8 w-8'
              }`}
              aria-hidden="true"
            />

            <blockquote
              className={`font-serif italic leading-relaxed text-zinc-200 ${
                single ? 'text-xl md:text-2xl' : 'text-base md:text-lg'
              }`}
            >
              {t.quote}
            </blockquote>

            <figcaption className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-medium text-zinc-100">{t.name}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm text-zinc-400">{t.title}</span>
              {t.source === 'linkedin' && (
                <a
                  href="https://www.linkedin.com/in/petro-p-insight-draft/details/recommendations/"
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-amber-400"
                  aria-label={`View ${t.name}'s recommendation on LinkedIn (opens in a new tab)`}
                >
                  <LinkedinIcon className="h-3 w-3" />
                  LinkedIn
                </a>
              )}
              {(t.context || t.date) && (
                <span className="mt-1 basis-full text-xs text-zinc-500">
                  {[t.context, t.date].filter(Boolean).join(' · ')}
                </span>
              )}
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  )
}
