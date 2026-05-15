// Generic markdown renderer — pass any markdown string and it renders.
//
// Same pattern as <Code> and <Mermaid>: explicit content prop, no
// children. Useful in MDX when you'd rather hand the parser a string
// than fight with how MDX-as-JSX escapes pipe characters, backticks,
// curly braces, indentation. Especially useful for tables — write
// them once as plain markdown and the component does the rest.
//
//   <Md source={`
//   | Lift  | Sessions | Days |
//   |-------|---------:|------|
//   | +5pp  | ~1,200   | 120  |
//   | +10pp | ~290     | 30   |
//   `} />
//
// Supports full GitHub Flavored Markdown via remark-gfm:
//   - tables (with column alignment via :--- / ---:)
//   - autolinks (http URLs become clickable without [text](url))
//   - strikethrough (~~text~~)
//   - task lists (- [ ] item / - [x] done)
//   - all of standard markdown (headings, bullets, bold, italic, code, links, blockquotes, hr)
//
// Server component — no 'use client'. react-markdown renders to React
// elements at SSG time, so the post HTML is fully static and the
// library never ships to the client. The parent's `prose prose-invert`
// classes (in BlogPostFrame, case study frame) style every rendered
// element automatically.

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = {
  /** The markdown source. Leading/trailing whitespace is trimmed. */
  source: string
}

export function Md({ source }: Props) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {source.trim()}
    </ReactMarkdown>
  )
}
