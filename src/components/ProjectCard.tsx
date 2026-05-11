import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
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
      className="group relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-surface/60 to-surface/20 p-8 transition-all duration-500 hover:border-border-strong md:p-10"
    >
      <div className="pointer-events-none absolute -top-32 -right-32 h-64 w-64 rounded-full bg-accent-soft/5 blur-3xl transition-opacity duration-700 group-hover:opacity-100 opacity-50" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:gap-12">
        <div>
          <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-faint">
            <span>0{index + 1}</span>
            <span className="h-px w-8 bg-border-strong" />
            <span>{project.tagline}</span>
          </div>

          <h3 className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            {project.title}
            {project.links?.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm font-normal text-accent/80 transition-colors hover:text-accent-bright"
              >
                {l.label}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))}
          </h3>

          <p className="mb-6 max-w-2xl text-base leading-relaxed text-dim">
            {project.description}
          </p>

          {project.caseStudyUrl && (
            <Link
              to={project.caseStudyUrl}
              className="group/cta mb-8 inline-flex items-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-4 py-2 text-sm font-medium text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground"
            >
              Read the case study
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-0.5" />
            </Link>
          )}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {project.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-border bg-background/50 p-4"
              >
                <div className="font-mono text-2xl font-medium text-accent">
                  {m.value}
                </div>
                <div className="mt-1 text-xs leading-snug text-faint">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-surface/60 px-2.5 py-1 font-mono text-xs text-dim"
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
