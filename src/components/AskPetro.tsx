'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Sparkles, AlertCircle } from 'lucide-react'
import { SectionLabel } from './SectionLabel'
import { track } from '../pulse/client'

const SAMPLE_PROMPTS = [
  'What kind of engagements does he take?',
  'What models has he shipped with?',
  'Tell me about CData Virtuality work',
  'Tell me about Insight Draft',
  'How does he use Claude Code & Cursor?',
]

type Message = {
  role: 'user' | 'assistant' | 'error'
  text: string
}

const GENERIC_ERROR =
  "Sorry — I couldn't reach the AI just now. Please try again in a moment, or email Petro directly at petromilpavlov@gmail.com."

export function AskPetro() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function send(prompt: string) {
    const trimmed = prompt.trim()
    if (!trimmed || loading) return

    // Track that someone asked a question. We deliberately don't store
    // the prompt text — only the length and whether it was a suggested
    // prompt or freeform input.
    track('ask_query', {
      length: trimmed.length,
      suggested: SAMPLE_PROMPTS.includes(trimmed),
    })

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
          history: messages
            .filter((m) => m.role !== 'error')
            .slice(-6),
        }),
      })

      if (res.ok) {
        const data = (await res.json()) as { text?: string }
        const text = data.text?.trim()
        if (text) {
          setMessages([...newMessages, { role: 'assistant', text }])
          return
        }
        setMessages([...newMessages, { role: 'error', text: GENERIC_ERROR }])
        return
      }

      // Non-OK — try to surface a useful message
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      const errText =
        res.status === 429
          ? data.error ||
            "You've hit the hourly limit. Try again later or email Petro at petromilpavlov@gmail.com."
          : GENERIC_ERROR
      track('ask_error', {
        kind: res.status === 429 ? 'rate_limit' : 'server_error',
        status: res.status,
      })
      setMessages([...newMessages, { role: 'error', text: errText }])
    } catch {
      track('ask_error', { kind: 'network' })
      setMessages([...newMessages, { role: 'error', text: GENERIC_ERROR }])
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
        className="overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-surface/60 to-surface/20"
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-6 py-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-mono text-xs tracking-wide text-dim">
            ask-petro · v0.1
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-ghost">
            grounded in CV + project docs
          </span>
        </div>

        <div className="min-h-72 space-y-4 p-6">
          {messages.length === 0 && (
            <div className="rounded-lg bg-surface/40 px-4 py-3 text-sm text-dim">
              <span className="font-mono text-accent">petro:</span> Hi.
              I&rsquo;m Petro&rsquo;s AI assistant, grounded in his CV,
              project READMEs, and recent work. Ask me anything &mdash; I&rsquo;ll
              answer with what I actually know and tell you when I don&rsquo;t.
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className="text-sm">
              {m.role === 'user' ? (
                <div className="ml-auto max-w-[85%] rounded-lg bg-accent/10 px-4 py-2.5 text-muted">
                  {m.text}
                </div>
              ) : m.role === 'error' ? (
                <div className="flex max-w-[90%] items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 leading-relaxed text-red-300/90">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>{m.text}</span>
                </div>
              ) : (
                <div className="max-w-[90%] rounded-lg bg-surface/60 px-4 py-3 leading-relaxed text-muted">
                  <span className="mr-2 font-mono text-accent">petro:</span>
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-sm">
              <div className="inline-flex items-center gap-2 rounded-lg bg-surface/60 px-4 py-3 text-dim">
                <span className="font-mono text-accent">petro:</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-faint" />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border/60 px-6 py-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  track('ask_prompt_click', { prompt: p })
                  send(p)
                }}
                disabled={loading}
                className="rounded-full border border-border bg-surface/40 px-3 py-1 font-mono text-[11px] text-dim transition-colors hover:border-accent-soft/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
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
            className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Petro's work..."
              disabled={loading}
              maxLength={600}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-ghost focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-accent p-1.5 text-accent-foreground transition-colors hover:bg-accent-bright disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <p className="mt-2 text-[11px] text-ghost">
            Powered by GPT-5-mini, grounded in Petro&rsquo;s CV + projects. Rate-limited per IP.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
