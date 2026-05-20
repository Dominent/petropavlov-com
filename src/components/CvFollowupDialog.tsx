'use client'

// Post-CV-download follow-up dialog. Listens globally for clicks on
// any <a href="/cv" download> link (currently just the Hero buttons,
// but auto-installs for any future CV link). After a 1.2s delay
// (long enough that the browser's own download chrome appears first
// so the modal doesn't feel disconnected from the click), shows a
// soft modal offering two next steps: book a call, or quick email.
//
// Why this exists: Pulse data showed the "drive-by CV grabber"
// pattern — mostly mobile Safari visitors who download the CV from
// the hero and then leave with no return path. This dialog gives
// them a one-tap upgrade from CV-grab to actual conversation.
//
// Shown ONCE per session (sessionStorage flag). Multiple dismissal
// paths — X button, backdrop click, "Not now" link. Every interaction
// tracked: cv_followup_shown / _clicked (with cta) / _dismissed
// (with reason). Future analytics question: of N visitors shown the
// dialog, what fraction converted to cal_click vs email vs dismiss?

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Mail } from 'lucide-react'
import { track } from '../pulse/client'

const SESSION_KEY = '__pulse_cv_followup_seen'
// Delay between the CV-download click and the dialog appearing.
// 1200ms is long enough that the browser's download notification has
// already animated in and the user has read it — the dialog then feels
// like a logical follow-up, not an interruption.
const DELAY_MS = 1200

export function CvFollowupDialog() {
  const [open, setOpen] = useState(false)
  // Prevent double-firing if the user somehow triggers two clicks in
  // the delay window (e.g. double-tap on mobile).
  const armedRef = useRef(false)

  useEffect(() => {
    function onClick(e: MouseEvent): void {
      const target = e.target as HTMLElement | null
      if (!target || typeof target.closest !== 'function') return
      const link = target.closest('a[href="/cv"]') as HTMLAnchorElement | null
      if (!link) return
      // Only on actual download intent (not <a href="/cv"> used for nav)
      if (!link.hasAttribute('download')) return
      if (armedRef.current) return
      // Once-per-session check
      try {
        if (sessionStorage.getItem(SESSION_KEY)) return
      } catch {
        // Private mode — fall through and show this time
      }
      armedRef.current = true
      window.setTimeout(() => {
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          /* private mode — accept that we'll show again next visit */
        }
        setOpen(true)
        track('cv_followup_shown', { delay_ms: DELAY_MS })
      }, DELAY_MS)
    }
    // capture: true so we run before any link-level onClick from the
    // Hero (and so our handler still fires if a child element of the
    // link was clicked).
    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])

  function dismiss(reason: 'backdrop' | 'close_button' | 'no_thanks' | 'escape'): void {
    track('cv_followup_dismissed', { reason })
    setOpen(false)
  }

  function ctaClicked(cta: 'cal' | 'email'): void {
    track('cv_followup_clicked', { cta })
    // For Cal, the data-cal-link button opens its own modal on top;
    // closing this dialog after a short delay keeps the back-stack
    // clean when they close Cal. For email, the mailto: opens their
    // mail app and they may not come back — closing is also fine.
    window.setTimeout(() => setOpen(false), 350)
  }

  // ESC to close
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') dismiss('escape')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) dismiss('backdrop')
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-followup-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-t-2xl border border-border bg-surface shadow-2xl shadow-black/50 sm:rounded-2xl"
          >
            <button
              type="button"
              onClick={() => dismiss('close_button')}
              aria-label="Close"
              className="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-faint transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-7 pt-7 pb-6">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-accent">
                Thanks for grabbing the CV →
              </div>
              <h2
                id="cv-followup-title"
                className="text-2xl font-medium tracking-tight text-foreground"
              >
                Want to keep going?
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                If anything on the page looked relevant &mdash; even
                half-relevant &mdash; the highest-bandwidth next step is
                a 20-min call. No slides, no pitch &mdash; just whether
                there&rsquo;s a fit.
              </p>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  data-cal-link="petropavlov/intro"
                  data-cal-namespace=""
                  data-cal-config='{"theme":"dark","ui.color-scheme":"dark"}'
                  onClick={() => ctaClicked('cal')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-bright"
                >
                  <Calendar className="h-4 w-4" />
                  Book a 20-min intro call
                </button>
                <a
                  href="mailto:petromilpavlov@gmail.com?subject=Saw%20your%20CV"
                  onClick={() => ctaClicked('email')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-5 py-3 text-sm text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10 hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  Drop a quick email instead
                </a>
              </div>

              <button
                type="button"
                onClick={() => dismiss('no_thanks')}
                className="mt-4 w-full text-center text-xs text-faint transition-colors hover:text-dim"
              >
                Not now &mdash; close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
