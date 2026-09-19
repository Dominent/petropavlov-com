export type Project = {
  id: string
  title: string
  tagline: string
  // Two or three sentences — the card and the CV both lead with this.
  // Depth belongs in `highlights` (card only) or the case study.
  description: string
  highlights: string[]
  metrics: { value: string; label: string }[]
  tech: string[]
  links?: { label: string; url: string }[]
  github?: string
  // Featured projects also appear on the PDF CV; the rest are site-only.
  featured?: boolean
  caseStudyUrl?: string
  caseStudyLabel?: string
  // Extra depth for the Ask Petro assistant only — never rendered.
  assistantNotes?: string[]
  // Optional product screenshot, served from /public.
  image?: { src: string; alt: string; width: number; height: number }
}

export const projects: Project[] = [
  {
    id: 'insight-draft',
    title: 'Insight Draft',
    tagline: 'Production AI SaaS for meetings',
    description:
      'Insight Draft turns meeting recordings into searchable team knowledge — summaries, action items, and a Q&A assistant grounded in the transcript with verifiable citations. Its Manifest V3 Chrome extension records Google Meet, Microsoft Teams, and Zoom without a bot joining the call. Engineering led solo within a two-person founding team.',
    highlights: [
      "Bot-free capture — tabCapture for browser meetings, desktopCapture for desktop clients, and a separate Slack Huddle bot where tab capture doesn't apply",
      'Speaker-attributed transcription (Deepgram Nova-3) feeding summaries with topic chapters, RAG Q&A, AI Quick Actions, and conversation analytics',
      'Dedicated Node.js LLM service orchestrating OpenAI models through the Responses API with strict structured outputs',
      '.NET 8 API, Angular 17 client, Stripe billing, S3 storage, multi-environment Jenkins CI/CD, Playwright E2E',
    ],
    metrics: [
      { value: '2 yrs', label: 'on the Manifest V3 Chrome extension — bot-free Meet/Teams/Zoom recording' },
      { value: '6+', label: 'parallel LLM calls per meeting (summary, chapters, highlights, tags, behaviour mentions, classification)' },
      { value: 'Solo eng', label: 'extension · API · LLM service · UI · CI/CD · live in production' },
    ],
    tech: ['Chrome Extension MV3', 'tabCapture', 'desktopCapture', '.NET 8', 'Node.js', 'Angular 17', 'OpenAI Responses API', 'Deepgram', 'RAG', 'PostgreSQL', 'Stripe', 'Hangfire', 'AWS S3', 'Jenkins', 'Playwright'],
    links: [
      { label: 'app.insightdraft.com', url: 'https://app.insightdraft.com' },
      { label: 'Chrome Web Store', url: 'https://chromewebstore.google.com/detail/insight-draft-ai-meeting/ljdgclmpndcckebbncgafkcnnnallbnm' },
    ],
    featured: true,
    caseStudyUrl: '/case-studies/insight-draft',
    assistantNotes: [
      'The extension is a multi-package monorepo (content scripts, tooltip overlay, Next.js popup, shared utilities) with an E2E suite; it talks to the web app via externally_connectable and uses a MAIN-world content script for Google Meet',
      'Q&A uses the OpenAI Responses API with file_search vector stores; live Google Meet caption scraping backs up Deepgram for speaker attribution',
      'The LLM service has a provider strategy with an Anthropic scaffold, but production routes to OpenAI exclusively',
      'Custom Hangfire fan-out/fan-in coordinator built on Postgres atomic UPDATE...RETURNING, avoiding paid Hangfire Pro',
      'Two PostgreSQL databases — the main app, and a separate transcript DB for high-write word and caption tables; Stripe billing uses strategy-pattern subscription change handlers',
    ],
  },
  {
    id: 'magistrat',
    title: 'Magistrat',
    tagline: 'AI legal assistant · Bulgarian law',
    description:
      'Magistrat is an AI assistant for Bulgarian lawyers, built on its own legal corpus — court cases, consolidated laws, EU law, the State Gazette, and the commercial register — crawled from national registries into PostgreSQL and searched as one. Every citation is checkable down to the article and the case.',
    highlights: [
      'Every registry is the same shape — ingestion worker, append-only facts, idempotent upserts on natural keys, GraphQL API — so adding a source is a pattern, not a project',
      'Coverage is measured against the totals each source declares, because the recurring failure is not a crash — it is a crawl that returns HTTP 200, well-formed data, and the wrong answer',
      "Cross-registry retrieval doubles as the LLM agent's tool surface, and an MCP server exposes every database to coding agents as read-only SQL",
    ],
    metrics: [
      { value: '4.6M', label: 'court cases in the corpus' },
      { value: '1.37M', label: 'companies from the commercial register — ownership and filings' },
      { value: '607K', label: 'documents indexed for cross-registry search' },
    ],
    tech: ['.NET', 'PostgreSQL', 'Dapper / Npgsql', 'DbUp', 'Quartz', 'HotChocolate GraphQL', 'Angular', 'MCP', 'Docker', 'GitHub Actions'],
    links: [{ label: 'magistrat.bg', url: 'https://magistrat.bg' }],
    featured: true,
  },
  {
    id: 'switchboard',
    title: 'Switchboard',
    tagline: 'Open-source desktop tool · multi-account Claude',
    description:
      'Switchboard puts several Claude accounts in one window. It runs the real Claude desktop app once per profile — each with its own data directory and sign-in — and hosts every instance as a tab, or two side by side. Independent open-source project, not affiliated with Anthropic.',
    highlights: [
      "Windows: the guest becomes a frameless owned window kept over the shell's content area — reparenting it as a child looked tidier and silently ate every key press",
      "macOS: there is no supported way to embed another process's window, so the active guest is pinned in place through the Accessibility API and re-pinned on every move and resize",
      'Per-tab sign-in: owns the claude:// scheme on macOS; on Windows, where the MSIX package claims it, a WMI process-creation watch hands the link to the focused tab',
    ],
    metrics: [
      { value: '2 OSes', label: 'one TypeScript codebase — owned Win32 windows on Windows, Accessibility-API pinning on macOS' },
      { value: 'No C++', label: 'every native Win32 / macOS call goes through koffi FFI — nothing to compile' },
      { value: 'MIT', label: 'open source · v0.1.0 Windows installer on GitHub Releases' },
    ],
    tech: ['Electron', 'TypeScript', 'koffi FFI', 'Win32 API', 'macOS Accessibility API', 'claude:// deep links', 'WMI', 'electron-builder', 'node:test'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Dominent/claude-desk' },
      { label: 'Download for Windows', url: 'https://github.com/Dominent/claude-desk/releases/latest' },
    ],
    github: 'https://github.com/Dominent/claude-desk',
    featured: true,
    caseStudyUrl: '/blog/hosting-another-apps-window-inside-yours',
    caseStudyLabel: 'Read the write-up',
  },
  {
    id: 'beacon',
    title: 'Beacon',
    tagline: 'Angular 21 + Nx reference architecture',
    description:
      'Beacon is a small, deliberately built issue tracker that shows modern Angular — version 21, zoneless, signals — inside a scalable Nx 23 monorepo. The surface is modest on purpose, so that every architectural decision is explainable.',
    highlights: [
      'Domain × layer libraries with lint-enforced boundaries — a ui library physically cannot import a store, and CI fails if it tries',
      'NgRx SignalStore where a store earns its keep, plain-signal services where it would be ceremony, RxJS only for typeahead and the SSE feed',
      'Local Nx plugin — generator, executor, and task inference — plus SSR with incremental hydration and @defer-loaded charts',
    ],
    metrics: [
      { value: 'Zoneless', label: 'no zone.js — change detection driven by signal reads and events' },
      { value: 'Enforced', label: 'module boundaries across feature · ui · data-access · util, checked by lint in CI' },
      { value: 'CLS 0', label: 'by construction — every deferred view has a sized placeholder' },
    ],
    tech: ['Angular 21', 'Nx 23', 'NgRx SignalStore', 'Signals', 'RxJS', 'Angular CDK', 'SSR', 'Vitest', 'Playwright'],
    links: [
      { label: 'Live demo', url: 'https://beacon-petromilpavlovs-projects.vercel.app' },
      { label: 'GitHub', url: 'https://github.com/Dominent/beacon' },
    ],
    github: 'https://github.com/Dominent/beacon',
  },
]

export type Job = {
  id: string
  company: string
  role: string
  context: string
  bullets: string[]
  metric: { value: string; label: string }
  tech: string[]
  link?: string
  badge?: string // e.g. "returned as senior"
}

export const jobs: Job[] = [
  {
    id: 'vmware',
    company: 'VMware',
    role: 'Senior Frontend Engineer · Workspace ONE',
    context:
      'Returned to VMware as senior after starting as MTS Trainee out of Telerik Academy — shipped vRealize Automation health monitoring + auto-repair, presented to leadership.',
    bullets: [
      'Built a new Workspace ONE application from scratch — planning, design, CI/CD, deployment automation',
      'Introduced NGRX state-management patterns adopted across the team',
      'Led the AngularJS → Angular 8 migration of legacy features',
    ],
    metric: { value: '20+', label: 'technical interviews conducted for mid/senior Angular' },
    tech: ['Angular 8+', 'NGRX', 'Clarity', 'WebComponents', 'NX', 'Jest', 'Codecept'],
    link: 'https://www.vmware.com/',
    badge: 'returned as senior',
  },
  {
    id: 'data-virtuality',
    company: 'Data Virtuality · now CData',
    role: 'Senior Engineer · AI Research Team',
    context:
      'Joined Data Virtuality, an enterprise data-virtualization platform with 200+ connectors used by BSH, Crédit Agricole, and NYU. Stayed through the April 2024 acquisition by CData and the rebrand to CData Virtuality. Worked inside the AI research team on the next generation of AI features for the platform.',
    bullets: [
      'Solo-built a Cursor-style SQL AI copilot inside the Data Virtuality Platform — natural-language SQL authoring, edits, and exploration over federated data sources',
      'Co-built “Talk to your Data” with one other engineer — natural-language → governed SQL combining LLM + semantic vector DB + the platform’s Virtual SQL engine',
      'Both features shipped in the Q3 2025 platform release; CData demoed the platform at Gartner D&A Summit 2025',
    ],
    metric: { value: 'Solo', label: 'authored the SQL AI copilot; co-built Talk to your Data with 1 other engineer' },
    tech: ['OpenAI', 'RAG', 'Semantic Layer', 'Virtual SQL', 'TypeScript', 'Java'],
    link: 'https://www.cdata.com/virtuality/',
    badge: 'AI research team',
  },
  {
    id: 'testgorilla',
    company: 'TestGorilla',
    role: 'Senior Frontend Engineer',
    context:
      'Psychometric assessment platform helping companies hire fairly. Owned features end-to-end across the micro-frontend boundary.',
    bullets: [
      'Designed and shipped micro-frontend architecture using Module Federation',
      'Established NGRX Store + Component Store patterns across the app',
      'Built internal AI tooling for meeting analysis using ChatGPT and Claude APIs',
    ],
    metric: { value: '0.1%', label: 'critical-error rate after systematic triage' },
    tech: ['Angular 17', 'React', 'Module Federation', 'NGRX', 'TypeScript', 'Sentry'],
    link: 'https://www.testgorilla.com',
  },
  {
    id: 'walltopia',
    company: 'Walltopia',
    role: 'React Native + Full-Stack · interactive climbing walls',
    context:
      'Walltopia builds the climbing walls used at most major gyms worldwide. The e-walls system turns a static wall into an interactive surface — every hold is a smart RGB LED diode.',
    bullets: [
      'Built the React Native (Expo) mobile app — route creation, multi-board picker, offline mutation queue',
      'Designed the NestJS + Socket.IO backend for real-time multiplayer route activation',
      'Wired BLE communication and a MODBUS RTU protocol bridge to the wall hardware',
      'Authored a .NET 8 board simulator so the team could test 15×15 boards without physical hardware',
    ],
    metric: { value: 'Real-time', label: 'BLE + WebSockets, offline-first sync' },
    tech: ['React Native', 'Expo', 'NestJS', 'TypeORM', 'PostgreSQL', 'Socket.IO', 'BLE', 'MODBUS', '.NET 8'],
    link: 'https://walltopia.com',
  },
  {
    id: 'octopus',
    company: 'Octopus Energy Germany',
    role: 'Full-Stack Engineer · joined as 4hundred, stayed through the Octopus rebrand',
    context:
      'Munich-based green-energy retailer — joined when it was 4hundred GmbH (founded 2017), stayed through the September 2019 acquisition by Octopus Energy and rebrand to Octopus Energy Germany.',
    bullets: [
      'Built billing, invoice generation, and customer change-tracking systems',
      'Optimised hot API endpoints to handle 40,000+ users with substantially better latency',
      'Worked across the Angular front end and the ASP.NET / Entity Framework back end',
    ],
    metric: { value: '+150%', label: 'API endpoint performance gain on 40K-user systems' },
    tech: ['Angular 8+', 'C#', 'ASP.NET', 'Entity Framework', 'Azure', 'Docker', 'PostgreSQL', 'MSSQL'],
    link: 'https://octopusenergy.de',
  },
]

export const skills = {
  Frontend: ['Angular 8–21', 'React', 'Next.js', 'TypeScript', 'RxJS', 'Signals', 'NGRX', 'Module Federation', 'Tailwind', 'GraphQL'],
  Backend: ['.NET / C#', 'ASP.NET', 'Entity Framework', 'Node.js', 'NestJS', 'Express'],
  'AI / ML': ['Anthropic SDK', 'OpenAI SDK', 'RAG', 'Fine-tuning', 'Whisper', 'ElevenLabs', 'NL→SQL', 'Evals'],
  'Identity & Payments': ['Duende IdentityServer', 'OAuth 2.0 / OIDC', 'OID4VP / OID4VCI', 'eIDAS 2', 'Stripe', 'X.509 PKI'],
  Cloud: ['AWS (S3, CloudWatch)', 'Azure DevOps', 'Docker', 'Jenkins', 'CI/CD'],
  Mobile: ['React Native', 'Expo', 'BLE protocols'],
  'Browser Extensions': ['Manifest V3', 'Service workers', 'Content scripts (MAIN world)', 'tabCapture / desktopCapture', 'externally_connectable', 'Chrome Web Store'],
  Data: ['PostgreSQL', 'MSSQL', 'Redis'],
  Certifications: ['Scrum Alliance · Certified Scrum Master (Dec 2023)'],
  Education: ['Technical University of Sofia · BSc Industrial Engineering', 'Telerik Academy · Software Engineering'],
}
