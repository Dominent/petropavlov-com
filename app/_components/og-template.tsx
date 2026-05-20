// Shared JSX template for per-route OG images (rendered via
// next/og's ImageResponse). Used by every opengraph-image.tsx file
// in app/ so all the cards have a consistent visual identity.
//
// ImageResponse is a CSS-subset renderer. Only inline `style` objects,
// flexbox, basic typography. No Tailwind classes, no CSS variables,
// no animations. Anything that's not a clear style prop will be
// silently ignored at the edge.

import type { CSSProperties } from 'react'

type Props = {
  /** Eyebrow above the title — e.g. "blog post", "case study". */
  tag: string
  /** Main heading. Keep under ~80 chars for legibility at 1200×630. */
  title: string
  /** Optional one-liner under the title. */
  subtitle?: string
}

const PALETTE = {
  bg: '#09090b',
  surface: '#18181b',
  fg: '#fafafa',
  muted: '#a1a1aa',
  dim: '#71717a',
  accent: '#fbbf24',
}

export function OgTemplate({ tag, title, subtitle }: Props) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: PALETTE.bg,
        // Subtle amber radial gradient — same vibe as the site's body
        // background. Inline because ImageResponse doesn't run CSS
        // custom properties.
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.16), transparent), linear-gradient(180deg, ${PALETTE.bg} 0%, #0c0c10 100%)`,
        padding: 64,
        color: PALETTE.fg,
        fontFamily: '"system-ui", "Segoe UI", "Helvetica", sans-serif',
      }}
    >
      {/* Top brand row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 22,
          color: PALETTE.muted,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: PALETTE.accent,
            boxShadow: `0 0 24px ${PALETTE.accent}`,
          }}
        />
        <span style={{ fontWeight: 600, color: PALETTE.fg }}>Petro Pavlov</span>
        <span style={{ color: PALETTE.dim }}>·</span>
        <span style={{ fontFamily: 'monospace' }}>petropavlov.dev</span>
      </div>

      {/* Tag — small uppercase label above the title */}
      <div
        style={{
          marginTop: 'auto',
          fontFamily: 'monospace',
          fontSize: 20,
          color: PALETTE.accent,
          textTransform: 'uppercase',
          letterSpacing: 4,
          display: 'flex',
        }}
      >
        {tag}
      </div>

      {/* Title — the LCP equivalent of the card */}
      <div
        style={{
          marginTop: 16,
          fontSize: title.length > 60 ? 56 : 64,
          fontWeight: 500,
          color: PALETTE.fg,
          letterSpacing: -1,
          lineHeight: 1.1,
          maxWidth: 1000,
          display: 'flex',
        } as CSSProperties}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle ? (
        <div
          style={{
            marginTop: 24,
            fontSize: 26,
            color: PALETTE.muted,
            lineHeight: 1.4,
            maxWidth: 980,
            display: 'flex',
          }}
        >
          {subtitle}
        </div>
      ) : null}

      {/* Bottom hairline */}
      <div
        style={{
          marginTop: 32,
          width: 96,
          height: 3,
          background: PALETTE.accent,
          display: 'flex',
        }}
      />
    </div>
  )
}

/** Standard OG export shape — width/height/contentType + alt. */
export const ogSize = { width: 1200, height: 630 } as const
export const ogContentType = 'image/png' as const
