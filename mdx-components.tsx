// Custom MDX components — global overrides for elements rendered from
// markdown. Lives at the project root per the Next.js App-Router MDX
// convention (next.js looks for ./mdx-components.tsx).
//
// Most styling is handled by the parent `prose prose-invert ...`
// classes in the blog post layout. We override here only when we want
// to inject something Markdown can't express — e.g. external links
// get the icon-and-target treatment we use elsewhere.

import type { MDXComponents } from 'mdx/types'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // Anchor tags — open external links in a new tab, keep internal
    // links rendering as-is so Next.js can hijack them later.
    a: ({ href, children, ...rest }) => {
      const external = typeof href === 'string' && /^https?:\/\//.test(href)
      if (external) {
        return (
          <a href={href} target="_blank" rel="noreferrer" {...rest}>
            {children}
          </a>
        )
      }
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      )
    },
  }
}
