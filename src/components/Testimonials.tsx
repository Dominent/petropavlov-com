import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { testimonials } from '../data/testimonials'
import { SectionLabel } from './SectionLabel'

export function Testimonials() {
  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="06"
        title="What people say"
        caption="From past managers and colleagues, in their own words."
      />

      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-6 md:p-8"
          >
            <Quote
              className="absolute top-6 right-6 h-10 w-10 text-amber-400/15"
              aria-hidden="true"
            />

            <blockquote className="space-y-4 font-serif text-base leading-relaxed text-zinc-200 italic md:text-lg">
              {t.quote.split('\n\n').map((para, pi) => (
                <p key={pi}>{para}</p>
              ))}
            </blockquote>

            <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-medium text-zinc-100">{t.name}</span>
              <span className="text-zinc-600">·</span>
              <span className="text-sm text-zinc-400">{t.title}</span>
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
