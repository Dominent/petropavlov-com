import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  chart: string
  /** Optional alt text for accessibility / fallback. */
  caption?: string
}

/**
 * Renders a Mermaid diagram to SVG. The mermaid library (~200 KB gzipped) is
 * dynamically imported on mount so it only ships to the page that actually
 * uses a diagram — currently the two case study routes, both of which are
 * lazy-loaded already, so this never touches the home page bundle.
 *
 * Theme is hand-tuned to match the site's semantic tokens. If we add a light
 * mode later, swap the theme variables based on a prop or a global theme.
 */
export function Mermaid({ chart, caption }: Props) {
  const rawId = useId()
  const id = `mermaid-${rawId.replace(/:/g, '')}`
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default

        if (cancelled) return

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            // Bound to the site's semantic tokens.
            background: '#09090b',          // --color-background
            mainBkg: '#18181b',              // --color-surface
            secondBkg: '#1f1f23',            // --color-border-subtle
            tertiaryColor: '#27272a',        // --color-surface-elevated

            primaryColor: '#fbbf24',         // --color-accent
            primaryTextColor: '#09090b',     // --color-accent-foreground (text on accent)
            primaryBorderColor: '#fbbf24',   // --color-accent

            secondaryColor: '#27272a',       // --color-surface-elevated
            secondaryTextColor: '#fafafa',   // --color-foreground
            secondaryBorderColor: '#3f3f46', // --color-border-strong

            tertiaryTextColor: '#fafafa',
            tertiaryBorderColor: '#3f3f46',

            textColor: '#fafafa',            // --color-foreground
            lineColor: '#71717a',            // --color-faint
            nodeBorder: '#3f3f46',           // --color-border-strong

            edgeLabelBackground: '#18181b',  // --color-surface

            fontFamily: 'JetBrains Mono, ui-monospace, monospace',
            fontSize: '13px',
          },
          flowchart: {
            curve: 'basis',
            useMaxWidth: true,
            htmlLabels: true,
            padding: 12,
          },
        })

        const { svg } = await mermaid.render(id, chart)
        if (cancelled) return

        if (ref.current) {
          ref.current.innerHTML = svg
        }
        setState('ready')
      } catch (err) {
        if (cancelled) return
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
        setState('error')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (state === 'error') {
    return (
      <figure className="my-8 rounded-lg border border-error/30 bg-error/5 p-4 text-sm text-error">
        <p className="font-mono text-xs uppercase tracking-wider">Diagram failed to render</p>
        {errorMsg && <p className="mt-2 font-mono text-xs">{errorMsg}</p>}
      </figure>
    )
  }

  return (
    <figure className="my-8 overflow-x-auto rounded-lg border border-border bg-surface/40 p-4 md:p-6">
      {state === 'loading' && (
        <div className="flex items-center justify-center py-12">
          <span className="font-mono text-xs uppercase tracking-wider text-faint">
            Rendering diagram…
          </span>
        </div>
      )}
      <div
        ref={ref}
        className="flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
        role="img"
        aria-label={caption || 'Architecture diagram'}
      />
      {caption && state === 'ready' && (
        <figcaption className="mt-4 text-center font-mono text-xs text-faint">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
