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
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 font-mono text-xs text-zinc-400 backdrop-blur"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
          </span>
          open for consulting & project work
        </motion.div>

        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-3 font-mono text-sm tracking-wide text-zinc-500"
        >
          Hey, I&rsquo;m
        </motion.p>

        <motion.h1
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6 text-6xl font-medium tracking-tight text-zinc-50 md:text-7xl lg:text-8xl"
        >
          Petro<span className="text-amber-400">.</span>
        </motion.h1>

        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-2 text-2xl text-zinc-300 md:text-3xl"
        >
          Senior Full-Stack Engineer
          <span className="text-zinc-500"> · </span>
          <span className="font-serif italic text-amber-200/90">ships AI products end-to-end</span>
        </motion.p>

        <motion.p
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-10 max-w-xl text-lg leading-relaxed text-zinc-400"
        >
          10+ years shipping production software at{' '}
          <span className="text-zinc-200">VMware</span>,{' '}
          <span className="text-zinc-200">TestGorilla</span>, and{' '}
          <span className="text-zinc-200">Octopus Energy</span>. Most
          recently on the{' '}
          <span className="text-zinc-200">AI research team at CData Virtuality</span>{' '}
          shipping{' '}
          <span className="text-amber-400">RAG</span>,{' '}
          <span className="text-amber-400">NL&rarr;SQL</span>, and a{' '}
          <span className="text-amber-400">Cursor-style SQL copilot</span> into
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
            className="group inline-flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-medium text-zinc-950 transition-all hover:bg-amber-300"
          >
            See selected work
            <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
          </a>
          <button
            type="button"
            data-cal-link="petropavlov/intro"
            data-cal-namespace=""
            data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
            className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/5 px-5 py-2.5 text-sm text-amber-200 transition-colors hover:border-amber-500/70 hover:bg-amber-500/10 hover:text-amber-100"
          >
            <Calendar className="h-4 w-4" />
            Book a call
          </button>
          <a
            href="https://github.com/Dominent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href="mailto:petromilpavlov@gmail.com"
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/40 px-5 py-2.5 text-sm text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
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
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-zinc-500"
        >
          <MapPin className="h-3 w-3" />
          Sofia, Bulgaria
          <span className="mx-2 text-zinc-700">/</span>
          remote-first
        </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden flex-shrink-0 lg:block"
        >
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-amber-500/30 via-amber-500/5 to-transparent opacity-60 blur-2xl" />
          <div className="relative">
            <img
              src="/petro.jpg"
              alt="Portrait of Petro Pavlov"
              width={288}
              height={288}
              loading="eager"
              decoding="async"
              className="h-72 w-72 rounded-2xl border border-zinc-800 object-cover shadow-2xl shadow-black/50"
            />
            <div className="absolute -right-2 -bottom-2 flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/90 px-2.5 py-1 font-mono text-[10px] text-zinc-300 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              available
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
