import { motion } from 'framer-motion'
import { ArrowDownRight, Calendar, Mail, MapPin } from 'lucide-react'
import { GithubIcon } from './BrandIcons'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center px-6 pt-24 pb-16 lg:px-0"
    >
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative flex w-full items-center gap-10 lg:gap-16">
        <div className="max-w-3xl flex-1">
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 font-mono text-xs text-dim backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          open for consulting & project work
        </motion.div>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-3 font-mono text-sm tracking-wide text-faint"
        >
          Hey, I&rsquo;m
        </motion.p>

        <motion.h1
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 text-6xl font-medium tracking-tight text-foreground md:text-7xl lg:text-8xl"
        >
          Petro<span className="text-accent">.</span>
        </motion.h1>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-2 text-2xl text-muted md:text-3xl"
        >
          Senior Full-Stack Engineer
          <span className="text-faint"> · </span>
          <span className="font-serif italic text-accent-bright/90">ships AI products end-to-end</span>
        </motion.p>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 max-w-xl text-lg leading-relaxed text-dim"
        >
          10+ years shipping production software at{' '}
          <span className="text-muted">VMware</span>,{' '}
          <span className="text-muted">TestGorilla</span>, and{' '}
          <span className="text-muted">Octopus Energy</span>. Most
          recently on the{' '}
          <span className="text-muted">AI research team at CData Virtuality</span>{' '}
          shipping{' '}
          <span className="text-accent">RAG</span>,{' '}
          <span className="text-accent">NL&rarr;SQL</span>, and a{' '}
          <span className="text-accent">Cursor-style SQL copilot</span> into
          the platform. Daily Claude Code &amp; Cursor user.
        </motion.p>

        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#work"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all hover:bg-accent-bright"
          >
            See selected work
            <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
          <button
            type="button"
            data-cal-link="petropavlov/intro"
            data-cal-namespace=""
            data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
            className="inline-flex items-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-5 py-2.5 text-sm text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground"
          >
            <Calendar className="h-4 w-4" />
            Book a call
          </button>
          <a
            href="https://github.com/Dominent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-5 py-2.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="mailto:petromilpavlov@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-5 py-2.5 text-sm text-muted transition-colors hover:border-border-strong hover:text-white"
          >
            <Mail className="h-4 w-4" />
            Email
          </a>
        </motion.div>

        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-faint"
        >
          <MapPin className="h-3 w-3" />
          Sofia, Bulgaria
          <span className="mx-2 text-ghost">/</span>
          remote-first
        </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden flex-shrink-0 lg:block"
        >
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-accent-soft/30 via-accent-soft/5 to-transparent opacity-60 blur-2xl" />
          <div className="relative">
            <picture>
              <source srcSet="/petro.webp" type="image/webp" />
              <img
                src="/petro.jpg"
                alt="Portrait of Petro Pavlov"
                width={288}
                height={288}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-72 w-72 rounded-2xl border border-border object-cover shadow-2xl shadow-black/50"
              />
            </picture>
            <div className="absolute -right-2 -bottom-2 flex items-center gap-1.5 rounded-full border border-border bg-background/90 px-2.5 py-1 font-mono text-[10px] text-muted backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              available
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
