# petropavlov.dev

Personal portfolio site for Petromil "Petro" Pavlov — Senior Full-Stack &
AI Engineer.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind v4 (with `@theme`), Sass for the global stylesheet
- MDX blog (`@next/mdx` + `remark-gfm`), Shiki for code, Mermaid for diagrams
- Framer Motion v12, lucide-react
- Route handlers under `app/api/*`: "Ask Petro" chat (OpenAI `gpt-5-mini`),
  contact form (Resend), PDF CV (`@react-pdf/renderer`)
- Pulse — self-hosted, cookieless analytics on Postgres
  (see `src/pulse/README.md`)

## Local development

```bash
npm install
cp .env.example .env   # fill in OPENAI_API_KEY + RESEND_API_KEY
npm run dev            # http://localhost:3000
```

Without env vars the site still runs — `Ask Petro` returns a "not
configured" error, the contact form points to the mailto link, and Pulse
logs a storage error per event instead of writing to Postgres.

## Build

```bash
npm run build
npm run start
```

## Deploy

Wired to Vercel. See `vercel.json` for rewrites, the daily-report cron,
and security headers.

## Content lives in data files

One source of truth, read by the page, the PDF CV, and the Ask Petro
system prompt — so they can't disagree:

- `src/data/work.ts` — projects, roles, skills. `featured` projects also
  appear on the CV.
- `src/data/ai.ts` — AI stack and shipped AI systems.
- `app/api/chat/system-prompt.ts` — renders the assistant's prompt from
  the three files above.

To add a project: add an entry to `projects` in `work.ts`, and (optionally)
a mini diagram in `src/components/ArchDiagram.tsx` and a screenshot via the
`image` field.

To add a blog post: create `app/blog/<slug>/page.mdx` (+ an
`opengraph-image.tsx` next to it) and register it in `app/blog/posts.ts`.
The sitemap and RSS feed pick it up from there.

## Project layout

```
app/               # routes: home, blog, case studies, api/*, sitemap, robots
  api/chat/        # Ask Petro — prompt generation + Postgres rate limit
  api/cv/          # PDF CV rendered from src/data
  blog/            # MDX posts + registry (posts.ts) + RSS feed
  case-studies/    # long-form write-ups
public/            # static assets (icons, og.png, portrait, llms.txt)
src/
  components/      # Hero (A/B), SelectedWork, AIEngineering, Experience,
                   # About, AskPetro, Testimonials, Contact, ...
  data/            # work.ts, ai.ts, testimonials.ts
  pulse/           # analytics: client SDK, server handlers, SQL schema
```
