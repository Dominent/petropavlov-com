import { useEffect, useState } from 'react'

type Props = {
  /** The code to highlight. Indentation preserved as-is. */
  code: string
  /** Language identifier — `typescript`, `sql`, `bash`, `json`, etc. Default `plaintext`. */
  language?: string
  /** Optional filename or path shown in a header bar above the code. */
  filename?: string
  /** Override the default Shiki theme (`github-dark-dimmed`). */
  theme?: string
}

/**
 * Syntax-highlighted code block. Powered by Shiki (VS Code's tokenizer +
 * themes — same TextMate grammars VS Code uses, byte-identical output).
 *
 * Shiki is dynamically imported on mount so the ~50 KB gz core bundle plus
 * language grammar only ship to the page that actually renders code — the
 * home page never touches them.
 *
 * Renders inside a <figure> with a border and optional filename header. The
 * loading state shows the unhighlighted code in a plain `<pre>` to avoid
 * layout shift.
 */
export function Code({
  code,
  language = 'plaintext',
  filename,
  theme = 'github-dark-dimmed',
}: Props) {
  const [html, setHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const { codeToHtml } = await import('shiki/bundle/web')
        if (cancelled) return

        const result = await codeToHtml(code, {
          lang: language,
          theme,
        })
        if (cancelled) return
        setHtml(result)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'highlight failed')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [code, language, theme])

  return (
    <figure className="my-6 overflow-hidden rounded-lg border border-border bg-surface">
      {filename && (
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="font-mono text-xs text-faint">{filename}</span>
          {language !== 'plaintext' && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-ghost">
              {language}
            </span>
          )}
        </div>
      )}

      {html ? (
        // Shiki injects <pre style="background-color:..."><code>...</code></pre>.
        // The parent case study uses Tailwind Typography prose styles which
        // add background/border/padding/color to ALL <code> and <pre> tags.
        // We must override those so Shiki's per-span inline colors are the
        // only colors visible. Using `!important` via Tailwind's bang prefix
        // because prose styles also use !important via the typography plugin.
        <div
          className="
            text-sm overflow-x-auto
            [&_pre]:!my-0 [&_pre]:!p-4 [&_pre]:!rounded-none [&_pre]:!border-0
            [&_pre]:leading-relaxed [&_pre]:font-mono
            [&_code]:!bg-transparent [&_code]:!border-0 [&_code]:!p-0
            [&_code]:!rounded-none [&_code]:!text-[1em] [&_code]:!text-inherit
            [&_code]:!font-mono
          "
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : error ? (
        <pre className="!my-0 !p-4 !rounded-none !border-0 overflow-x-auto text-sm leading-relaxed text-muted font-mono">
          <code className="!bg-transparent !border-0 !p-0 !text-inherit !text-[1em]">{code}</code>
        </pre>
      ) : (
        <pre className="!my-0 !p-4 !rounded-none !border-0 overflow-x-auto text-sm leading-relaxed text-muted font-mono opacity-60">
          <code className="!bg-transparent !border-0 !p-0 !text-inherit !text-[1em]">{code}</code>
        </pre>
      )}
    </figure>
  )
}
