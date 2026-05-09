import { motion } from 'framer-motion'
import { aiStack, aiSystems, statusColors } from '../data/ai'
import { SectionLabel } from './SectionLabel'

export function AIEngineering() {
  return (
    <section id="ai" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="02"
        title="AI Engineering"
        caption="The AI part of the stack isn't a side project — it's where I spend most of my building time."
      />

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 max-w-3xl text-lg leading-relaxed text-zinc-300"
      >
        I ship AI products{' '}
        <span className="font-serif italic text-amber-200/90">
          end-to-end
        </span>{' '}
        — from foundation models through fine-tuned adapters and production
        RAG up to the Angular UI on top. I write Anthropic and OpenAI SDK
        code daily and I&rsquo;m a daily Claude Code + Cursor user — this
        very portfolio was built that way.
      </motion.p>

      <div className="mb-12 grid gap-6 md:grid-cols-3">
        {Object.entries(aiStack).map(([group, items], gi) => (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: gi * 0.1 }}
            className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400">
                0{gi + 1}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">
                {group}
              </span>
            </div>
            <ul className="space-y-1.5">
              {items.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-2 font-mono text-[13px] text-zinc-400"
                >
                  <span className="text-zinc-700">›</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center gap-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            AI systems shipped
          </h3>
          <span aria-hidden="true" className="h-px flex-1 bg-zinc-800" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {aiSystems.map((sys, i) => (
            <motion.div
              key={sys.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium leading-tight text-zinc-100">{sys.title}</h4>
                <span
                  className={`flex-shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusColors[sys.status]}`}
                >
                  {sys.status}
                </span>
              </div>
              <p className="mb-3 text-[13px] leading-relaxed text-zinc-400">
                {sys.oneLiner}
              </p>
              <div className="flex flex-wrap gap-1">
                {sys.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-zinc-800/70 bg-zinc-950/50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
