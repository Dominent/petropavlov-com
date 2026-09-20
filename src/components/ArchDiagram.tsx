'use client'

type Props = { projectId: string }

export function ArchDiagram({ projectId }: Props) {
  if (projectId === 'insight-draft') return <InsightDraftArch />
  if (projectId === 'switchboard') return <SwitchboardArch />
  if (projectId === 'beacon') return <BeaconArch />
  return null
}

const boxClass =
  'rounded-md border border-border-strong/80 bg-surface/80 px-3 py-2 text-center text-[11px] font-mono text-muted shadow-sm'

function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={`h-3 w-6 text-ghost ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M0 6 L20 6 M16 2 L20 6 L16 10" />
    </svg>
  )
}

function InsightDraftArch() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
        <span>architecture</span>
        <span>insight-draft</span>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <div className={boxClass}>
          Angular 17 client
          <div className="mt-0.5 text-[9px] text-faint">SPA · Stripe</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-accent-soft/30 bg-accent-soft/10'}>
          .NET 8 API
          <div className="mt-0.5 text-[9px] text-faint">PostgreSQL · S3</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-accent-soft/30 bg-accent-soft/10'}>
          Node LLM service
          <div className="mt-0.5 text-[9px] text-faint">OpenAI · structured outputs</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] text-faint">
          <div className="rounded border border-border py-1">Deepgram</div>
          <div className="rounded border border-border py-1">RAG / KB</div>
          <div className="rounded border border-border py-1">Hangfire</div>
        </div>
      </div>
    </div>
  )
}

function BeaconArch() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
        <span>allowed imports</span>
        <span>beacon</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className={boxClass}>
          app shell
          <div className="mt-0.5 text-[9px] text-faint">routes · providers · SSR</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-accent-soft/30 bg-accent-soft/10'}>
          feature
          <div className="mt-0.5 text-[9px] text-faint">list · board · detail · dashboard</div>
        </div>
        <div className="flex items-center justify-center gap-6">
          <Arrow className="rotate-90" />
          <Arrow className="rotate-90" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={boxClass}>
            ui
            <div className="mt-0.5 text-[9px] text-faint">no store imports</div>
          </div>
          <div className={boxClass}>
            data-access
            <div className="mt-0.5 text-[9px] text-faint">SignalStore · SSE</div>
          </div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass}>
          util
          <div className="mt-0.5 text-[9px] text-faint">models</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] text-faint">
          <div className="rounded border border-border py-1">Nx plugin</div>
          <div className="rounded border border-border py-1">@defer</div>
          <div className="rounded border border-border py-1">CDK</div>
        </div>
      </div>
    </div>
  )
}

function SwitchboardArch() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-faint">
        <span>architecture</span>
        <span>switchboard</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className={boxClass + ' border-accent-soft/30 bg-accent-soft/10'}>
          Switchboard shell
          <div className="mt-0.5 text-[9px] text-faint">Electron · tabs · split view</div>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Arrow className="rotate-90" />
          <span className="font-mono text-[9px] text-faint">koffi FFI</span>
          <Arrow className="rotate-90" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={boxClass}>
            Windows
            <div className="mt-0.5 text-[9px] text-faint">owned window</div>
          </div>
          <div className={boxClass}>
            macOS
            <div className="mt-0.5 text-[9px] text-faint">Accessibility API</div>
          </div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-accent-soft/30 bg-accent-soft/10'}>
          Claude desktop × N
          <div className="mt-0.5 text-[9px] text-faint">--user-data-dir per profile</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] text-faint">
          <div className="rounded border border-border py-1">claude://</div>
          <div className="rounded border border-border py-1">WMI watch</div>
          <div className="rounded border border-border py-1">Hotkeys</div>
        </div>
      </div>
    </div>
  )
}
