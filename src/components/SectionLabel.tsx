type Props = {
  num: string
  title: string
  caption?: string
}

export function SectionLabel({ num, title, caption }: Props) {
  return (
    <div className="mb-12">
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent/80">
          {num}
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-accent/40 via-border-strong to-transparent" />
      </div>
      <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      {caption && (
        <p className="mt-2 max-w-xl text-sm text-faint">{caption}</p>
      )}
    </div>
  )
}
