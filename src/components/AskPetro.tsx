import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles } from 'lucide-react'
import { SectionLabel } from './SectionLabel'

const SAMPLE_PROMPTS = [
  'What kind of engagements does he take?',
  'What models has he shipped with?',
  'Tell me about CData Virtuality work',
  'Tell me about Insight Draft',
  'How does he use Claude Code & Cursor?',
]

// Stub answers used as a fallback when /api/chat is not reachable
// (e.g. during local Vite dev where Vercel functions don't run, or
// when OPENAI_API_KEY isn't configured on the deployment).
const STUB_ANSWERS: Record<string, string> = {
  'What kind of engagements does he take?':
    'Two flavours. (1) Consulting — architecture reviews, AI strategy, code reviews, fractional senior engineering for fast-moving teams. (2) Project work — end-to-end builds where he owns the stack from API → AI service → UI. Insight Draft (solo SaaS) and the Cursor-style SQL copilot inside Data Virtuality (solo feature in an enterprise platform) are recent examples. Strongest fit: AI products that need someone who can ship from prompt to production, plus the identity / payments / integrations layer to make them sellable. Open to EU and US clients.',
  'What models has he shipped with?':
    'Production work spans Claude (4.x at Insight Draft, TestGorilla, CData Virtuality), GPT-4o/GPT-5 (Insight Draft, TestGorilla, CData Virtuality), Whisper (Insight Draft transcription), and ElevenLabs for voice. He’s also fine-tuned Qwen3 with legal adapters and used Llama and DeepSeek in self-hosted setups. Comfortable both calling hosted APIs and self-hosting on Apple Silicon via MLX/llama.cpp.',
  'Tell me about CData Virtuality work':
    'Petro worked at Data Virtuality, the enterprise data-virtualization platform, and stayed through the April 2024 acquisition by CData. He was part of the AI research team and shipped two features into the Q3 2025 platform release. First — and authored solo — a Cursor-style SQL AI copilot built into the Data Virtuality Platform itself: users can author, edit, and steer SQL through natural language across federated sources. Second — co-built with one other engineer — "Talk to your Data": a natural-language → governed-SQL system that combines an LLM with a semantic vector DB and the platform’s Virtual SQL engine. CData demoed the platform at Gartner D&A Summit 2025.',
  'Tell me about Insight Draft':
    'Insight Draft is Petro’s solo-built AI meeting platform — live at app.insightdraft.com. Real-time speaker-attributed transcription via Deepgram, AI summaries with topic chapters, a RAG-powered Q&A assistant grounded in the transcript with verified citations, AI Quick Actions for decisions and action items, conversation analytics (speaking time, interruptions, turn-taking), and a custom prompt framework that runs as Hangfire background jobs. Multi-provider LLM orchestration in a dedicated Node.js service: GPT-5-mini primary, Claude 3.5 secondary, with separate RAG / zero-shot / moderation endpoints. .NET 8 + PostgreSQL backend, Angular 21 client, Jenkins CI/CD across 3 environments, Stripe billing, S3 storage.',
  'How does he use Claude Code & Cursor?':
    'Daily. Claude Code for repo-level work — multi-file refactors, feature scaffolds, debugging across services. Cursor for inline editing and quick exploration. He treats the Anthropic + OpenAI SDKs as a first-class part of his stack: prompt caching, streaming, structured outputs, tool use. This portfolio site itself was built with Claude Code.',
  'Has he led teams?':
    'Yes. At VMware he ran 20+ technical interviews for mid/senior Angular roles and introduced NGRX patterns adopted across the team. At TestGorilla he established state-management standards across a micro-frontend codebase. He leads embedded — through code, reviews, mentoring, and architectural decisions — rather than from above.',
}

type Mode = 'unknown' | 'live' | 'stub'

type Message = { role: 'user' | 'assistant'; text: string }

export function AskPetro() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('unknown')

  async function send(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', text: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6),
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        const text = data.text?.trim()
        if (text) {
          setMessages([...newMessages, { role: 'assistant', text }])
          setMode('live')
          return
        }
        throw new Error('empty')
      }
      // Non-OK: fall through to stub
      throw new Error('not ok')
    } catch {
      const fallback =
        STUB_ANSWERS[trimmed] ??
        'I don\'t have that on hand — best to email Petro directly at petromilpavlov@gmail.com.'
      setMessages([...newMessages, { role: 'assistant', text: fallback }])
      setMode('stub')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="ask" className="mx-auto max-w-5xl px-6 py-24 lg:px-0">
      <SectionLabel
        num="05"
        title="Ask Petro"
        caption="An AI assistant grounded in Petro's CV, projects, and writing. Recruiter, hiring manager, founder — ask anything."
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-900/20"
      >
        <div className="flex items-center gap-2 border-b border-zinc-800/60 px-6 py-3">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs tracking-wide text-zinc-400">
            ask-petro · v0.1{mode === 'live' ? ' · live' : ''}
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            grounded in CV + project docs
          </span>
        </div>

        <div className="min-h-72 space-y-4 p-6">
          {messages.length === 0 && (
            <div className="rounded-lg bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
              <span className="font-mono text-amber-400">petro:</span> Hi.
              I&rsquo;m Petro&rsquo;s AI assistant, grounded in his CV,
              project READMEs, and recent work. Ask me anything &mdash; I&rsquo;ll
              answer with what I actually know and tell you when I don&rsquo;t.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className="text-sm">
              {m.role === 'user' ? (
                <div className="ml-auto max-w-[85%] rounded-lg bg-amber-400/10 px-4 py-2.5 text-zinc-200">
                  {m.text}
                </div>
              ) : (
                <div className="max-w-[90%] rounded-lg bg-zinc-900/60 px-4 py-3 leading-relaxed text-zinc-300">
                  <span className="mr-2 font-mono text-amber-400">petro:</span>
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-zinc-900/60 px-4 py-3 text-zinc-400">
                <span className="font-mono text-amber-400">petro:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800/60 px-6 py-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                disabled={loading}
                className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1 font-mono text-[11px] text-zinc-400 transition-colors hover:border-amber-500/30 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Petro's work..."
              disabled={loading}
              maxLength={600}
              className="flex-1 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-amber-400 p-1.5 text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-2 text-[11px] text-zinc-600">
            {mode === 'stub'
              ? 'Live API unreachable — using grounded canned answers.'
              : 'Powered by GPT-5-mini, grounded in Petro\'s CV + projects. Rate-limited per IP.'}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
