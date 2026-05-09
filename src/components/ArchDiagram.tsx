type Props = { projectId: string }

export function ArchDiagram({ projectId }: Props) {
  if (projectId === 'insight-draft') return <InsightDraftArch />
  if (projectId === 'gramota') return <GramotaArch />
  return null
}

const boxClass =
  'rounded-md border border-zinc-700/80 bg-zinc-900/80 px-3 py-2 text-center text-[11px] font-mono text-zinc-300 shadow-sm'

function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 12"
      className={`h-3 w-6 text-zinc-600 ${className}`}
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
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        <span>architecture</span>
        <span>insight-draft</span>
      </div>
      <div className="flex flex-col items-stretch gap-2">
        <div className={boxClass}>
          Angular 21 client
          <div className="mt-0.5 text-[9px] text-zinc-500">SPA · Stripe</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-amber-700/40 bg-amber-950/20'}>
          .NET 8 API
          <div className="mt-0.5 text-[9px] text-zinc-500">PostgreSQL · S3</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-amber-700/40 bg-amber-950/20'}>
          Node LLM service
          <div className="mt-0.5 text-[9px] text-zinc-500">GPT-5-mini · Claude 3.5</div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] text-zinc-500">
          <div className="rounded border border-zinc-800 py-1">Deepgram</div>
          <div className="rounded border border-zinc-800 py-1">RAG / KB</div>
          <div className="rounded border border-zinc-800 py-1">Hangfire</div>
        </div>
      </div>
    </div>
  )
}

function GramotaArch() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        <span>architecture</span>
        <span>gramota</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div className={boxClass}>EU Wallet</div>
          <div className={boxClass}>Verifier app</div>
        </div>
        <div className="flex items-center justify-center gap-1">
          <Arrow className="rotate-90" />
          <span className="font-mono text-[9px] text-zinc-500">OID4VP</span>
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-amber-700/40 bg-amber-950/20'}>
          Gramota Gateway
          <div className="mt-0.5 text-[9px] text-zinc-500">DPoP · DCQL</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass + ' border-amber-700/40 bg-amber-950/20'}>
          Multi-tenant SaaS
          <div className="mt-0.5 text-[9px] text-zinc-500">X.509 per org</div>
        </div>
        <div className="flex justify-center">
          <Arrow className="rotate-90" />
        </div>
        <div className={boxClass}>
          ASP.NET Core 10 + Duende
          <div className="mt-0.5 text-[9px] text-zinc-500">auth.gramota.eu</div>
        </div>
      </div>
    </div>
  )
}
