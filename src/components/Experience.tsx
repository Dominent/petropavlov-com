import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { jobs } from '../data/work'
import { SectionLabel } from './SectionLabel'

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="03"
        title={"Where I’ve Built"}
        caption="Selected roles, ordered by relevance — not by date."
      />

      <div className="space-y-4">
        {jobs.map((job, i) => (
          <motion.article
            key={job.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group relative grid gap-6 rounded-xl border border-zinc-800/60 bg-zinc-900/20 p-6 transition-colors hover:border-zinc-700 md:grid-cols-[200px_1fr] md:p-8"
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                0{i + 1} &middot; role
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <h3 className="text-xl font-medium text-zinc-100">
                  {job.company}
                </h3>
                {job.link && (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Visit ${job.company} website (opens in a new tab)`}
                    className="text-zinc-500 transition-colors hover:text-amber-400"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="mt-1 text-sm text-zinc-400">{job.role}</div>
              {job.badge && (
                <div className="mt-3 inline-block rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-400">
                  {job.badge}
                </div>
              )}
            </div>

            <div>
              <p className="mb-4 text-sm leading-relaxed text-zinc-400">
                {job.context}
              </p>
              <ul className="mb-5 space-y-1.5">
                {job.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex gap-2 text-sm leading-relaxed text-zinc-300"
                  >
                    <span className="mt-2 h-px w-3 flex-shrink-0 bg-amber-400/60" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-4 flex items-baseline gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                <span className="font-mono text-2xl font-medium text-amber-400">
                  {job.metric.value}
                </span>
                <span className="text-xs text-zinc-500">
                  {job.metric.label}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {job.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 font-mono text-[11px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  )
}
