# petropavlov.com

Personal portfolio site for Petromil "Petro" Pavlov — Senior Full-Stack &
AI Engineer.

## Stack

- Vite + React 19 + TypeScript
- Tailwind v4 (with `@theme`)
- Framer Motion v12
- lucide-react
- Vercel serverless functions (`/api/*`) for the contact form (Resend)
  and "Ask Petro" chat (OpenAI `gpt-5-mini`)
- Vercel Analytics (cookieless)

## Local development

```bash
npm install
cp .env.example .env   # fill in OPENAI_API_KEY + RESEND_API_KEY
npm run dev            # http://localhost:5173
```

Without env vars the site still runs — `Ask Petro` falls back to canned
answers and the contact form returns a graceful error pointing to the
mailto link.

## Build

```bash
npm run build          # outputs to dist/
npm run preview        # serve dist/ locally
```

## Deploy

Wired to Vercel. See `vercel.json` for function config and security
headers.

```bash
vercel              # preview
vercel --prod       # production
```

## Project layout

```
api/               # Vercel serverless functions (chat, contact)
public/            # static assets (favicon, og.png, portrait, robots, sitemap)
src/
  components/     # Hero, About, AIEngineering, SelectedWork, Experience,
                  # AskPetro, Contact, ContactDialog, SideNav, ...
  data/           # ai.ts (stack + systems), work.ts (jobs + projects)
  index.css       # Tailwind v4 entry
  main.tsx        # React + Analytics root
index.html        # SEO meta, Open Graph, JSON-LD (Person + ProfessionalService)
```
