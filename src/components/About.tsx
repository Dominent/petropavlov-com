import { motion } from 'framer-motion'
import { skills } from '../data/work'
import { SectionLabel } from './SectionLabel'

export function About() {
  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel num="04" title="About" />

      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5 text-lg leading-relaxed text-muted">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            I&rsquo;ve been a senior engineer for{' '}
            <span className="text-accent">10+ years</span> &mdash; deepest
            on the frontend (Angular 8&ndash;18, TypeScript, RxJS, NGRX),
            always paired with the backend (C#/.NET and Node.js). At VMware I
            built Workspace ONE features from scratch; at TestGorilla I
            designed the micro-frontend architecture; at Octopus Energy
            Germany I shipped billing systems for 40,000+ users.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            For the last few years I&rsquo;ve focused on{' '}
            <span className="font-serif italic text-accent-bright/90">
              shipping AI products end-to-end
            </span>
            . I&rsquo;ve fine-tuned a Qwen3-4B legal model on Apple Silicon,
            built hybrid RAG over 116K court cases, orchestrated multi-model
            OpenAI calls through a dedicated Node service, and shipped
            Deepgram-powered speech-to-text pipelines for Insight Draft &mdash;
            including the{' '}
            <span className="text-muted">Manifest V3 Chrome extension</span>
            {' '}I&rsquo;ve worked on for 2 years that captures Meet, Teams,
            and Zoom without bots joining the call. I write a lot of code with{' '}
            <span className="text-muted">Claude Code</span> and{' '}
            <span className="text-muted">Cursor</span>, and I think about
            evals and prompt caching the way I used to think about test
            coverage and bundle size.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Outside of AI I have deep work in{' '}
            <span className="text-muted">identity</span> &mdash; Duende
            IdentityServer, OAuth/OIDC, the EU&rsquo;s OID4VP/VCI standards,
            and X.509 PKI &mdash;{' '}
            <span className="text-muted">Stripe</span> billing across
            multiple SaaS products, and{' '}
            <span className="text-muted">fintech / regulatory</span> work
            (billing systems for Octopus Energy DE serving 40K+ users).
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            I&rsquo;ve{' '}
            <span className="text-muted">led teams</span> &mdash;
            mentoring mid and senior engineers, owning architectural
            decisions, and conducting 20+ technical interviews for senior
            Angular roles at VMware. I lead embedded in the work: through
            code, reviews, and patterns the team adopts &mdash; not from
            above. Open to{' '}
            <span className="font-serif italic text-accent-bright/90">
              EU and US clients
            </span>
            ; comfortable across timezones.
          </motion.p>
        </div>

        <div className="space-y-5">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-faint">
            What I work with
          </h3>
          {Object.entries(skills).map(([group, items]) => (
            <div key={group}>
              <div className="mb-1.5 text-[11px] font-medium tracking-wider text-accent/90 uppercase">
                {group}
              </div>
              <div className="flex flex-wrap gap-1">
                {items.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-border/70 bg-surface/40 px-2 py-0.5 font-mono text-[11px] text-dim"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
