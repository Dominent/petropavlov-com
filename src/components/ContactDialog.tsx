import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Sparkles, Check, AlertTriangle } from 'lucide-react'

type Status = 'idle' | 'submitting' | 'success' | 'error'

type Props = {
  open: boolean
  onClose: () => void
}

export function ContactDialog({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus the first field on open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => firstFieldRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  // ESC to close + lock body scroll
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  // Reset state shortly after closing
  useEffect(() => {
    if (open) return
    const t = setTimeout(() => {
      if (status === 'success') {
        setName('')
        setEmail('')
        setMessage('')
      }
      setStatus('idle')
      setErrorMessage(null)
    }, 300)
    return () => clearTimeout(t)
  }, [open, status])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(
          data.error ||
            'Couldn\'t send the message. Please email petromilpavlov@gmail.com directly.'
        )
      }
    } catch {
      setStatus('error')
      setErrorMessage(
        'Network error. Please email petromilpavlov@gmail.com directly.'
      )
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-dialog-title"
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 px-6 py-4">
              <h2
                id="contact-dialog-title"
                className="flex items-center gap-2 text-base font-medium text-zinc-100"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                Send me a message
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {status === 'success' ? (
              <div className="flex flex-col items-center px-6 py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
                  <Check className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-zinc-100">
                  Message sent
                </h3>
                <p className="max-w-sm text-sm text-zinc-400">
                  I typically reply within a day &mdash; you&rsquo;ll hear
                  back on the email you provided.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-full bg-amber-400 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-300"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                <p className="text-sm text-zinc-400">
                  Tell me what you&rsquo;re working on and how I can help.
                  I&rsquo;ll reply within a day.
                </p>

                <Field label="Your name">
                  <input
                    ref={firstFieldRef}
                    type="text"
                    required
                    minLength={2}
                    maxLength={200}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/50 focus:bg-zinc-900/70 focus:outline-none"
                    placeholder="Jane Cooper"
                  />
                </Field>

                <Field label="Your email">
                  <input
                    type="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/50 focus:bg-zinc-900/70 focus:outline-none"
                    placeholder="jane@company.com"
                  />
                </Field>

                <Field label="How can I help?">
                  <textarea
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-y rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400/50 focus:bg-zinc-900/70 focus:outline-none"
                    placeholder="Building an AI feature into our SaaS — looking for someone to lead the architecture and ship a working slice in 4 weeks..."
                  />
                </Field>

                {status === 'error' && errorMessage && (
                  <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2">
                  <p className="text-[11px] text-zinc-600">
                    By sending you agree your email is used to reply. Nothing
                    else is stored.
                  </p>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'submitting' ? (
                      <>
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-950 border-t-transparent" />
                        Sending
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
        {label}
      </span>
      {children}
    </label>
  )
}
