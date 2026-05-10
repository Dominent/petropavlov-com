import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../data/work'
import { ArchDiagram } from './ArchDiagram'

type Props = { project: Project; index: number }

export function ProjectCard({ project, index }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20 p-8 transition-all duration-500 hover:border-zinc-700 md:p-10"
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl transition-opacity duration-700 group-hover:opacity-100 opacity-50" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div>
          <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-zinc-500">
            <span>0{index + 1}</span>
            <span className="h-px w-8 bg-zinc-700" />
            <span>{project.tagline}</span>
          </div>

          <h3 className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-3xl font-medium tracking-tight text-zinc-50 md:text-4xl">
            {project.title}
            {project.links?.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-normal text-amber-400/80 transition-colors hover:text-amber-300"
              >
                {l.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </h3>

          <p className="mb-8 max-w-2xl text-base leading-relaxed text-zinc-400">
            {project.description}
          </p>

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4"
              >
                <div className="font-mono text-2xl font-medium text-amber-400">
                  {m.value}
                </div>
                <div className="mt-1 text-xs leading-snug text-zinc-500">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 font-mono text-xs text-zinc-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:w-72">
          <ArchDiagram projectId={project.id} />
        </div>
      </div>
    </motion.article>
  )
}
