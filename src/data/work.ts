export type Project = {
  id: string
  title: string
  tagline: string
  description: string
  metrics: { value: string; label: string }[]
  tech: string[]
  links?: { label: string; url: string }[]
  github?: string
  featured?: boolean
  caseStudyUrl?: string
}

export const projects: Project[] = [
  {
    id: 'insight-draft',
    title: 'Insight Draft',
    tagline: 'Production AI SaaS for meetings',
    description:
      'Insight Draft turns meeting recordings into searchable team knowledge — instant summaries, action items, and a Q&A assistant grounded in the transcript with verifiable citations. The Chrome extension (Manifest V3, 2 years\' work, published on the Chrome Web Store) records Google Meet, Microsoft Teams, and Zoom without bots joining the call — uses tabCapture for browser-based meetings and desktopCapture for desktop clients, plus manual recording. A separate Slack Huddle bot covers the case where tab capture doesn\'t apply. Speaker-attributed transcription via Deepgram (Nova-3 multilingual) feeds AI summaries with topic chapters, RAG-powered Q&A, AI Quick Actions for decisions, and conversation analytics (speaking time, interruptions, turn-taking). Engineered end-to-end (engineering led solo within a two-person founding team): .NET 8 backend, dedicated Node.js LLM service orchestrating multiple OpenAI models via the Responses API with strict structured outputs, Angular 17 client. Multi-environment Jenkins CI/CD, Stripe billing, S3 storage, Playwright E2E.',
    metrics: [
      { value: '2 yrs', label: 'on the Manifest V3 Chrome extension — bot-free Meet/Teams/Zoom recording' },
      { value: '12+', label: 'parallel LLM calls per meeting (summary, chapters, highlights, tags, behaviour mentions, classification)' },
      { value: 'Solo eng', label: 'extension · API · LLM service · UI · CI/CD · live in production' },
    ],
    tech: ['Chrome Extension MV3', 'tabCapture', 'desktopCapture', '.NET 8', 'Node.js', 'Angular 17', 'OpenAI Responses API', 'Deepgram', 'RAG', 'PostgreSQL', 'Stripe', 'Hangfire', 'AWS S3', 'Jenkins', 'Playwright'],
    links: [
      { label: 'app.insightdraft.com', url: 'https://app.insightdraft.com' },
      { label: 'Chrome Web Store', url: 'https://chromewebstore.google.com/detail/insight-draft-ai-meeting/ljdgclmpndcckebbncgafkcnnnallbnm' },
    ],
    featured: true,
    caseStudyUrl: '/case-studies/insight-draft',
  },
  {
    id: 'gramota',
    title: 'Gramota',
    tagline: 'EU Digital Identity Wallet SDK · eIDAS 2',
    description:
      'A multi-package SDK and SaaS layer for the EU Digital Identity Wallet. Implements OID4VP Final 1.0, OID4VCI Draft 15, DPoP, DCQL, and X.509 per-organisation certificate management. Tested against the European Commission reference infrastructure. Includes a hosted gateway, multi-tenant SaaS, an ASP.NET Core 10 + Duende IdentityServer auth server, and a marketing site with auto-generated TypeDoc API docs.',
    metrics: [
      { value: '12+', label: 'published npm packages w/ provenance' },
      { value: 'eIDAS 2', label: 'compliant against EU reference infra' },
      { value: '5 repos', label: 'gateway · SaaS · identity · demo · site' },
    ],
    tech: ['TypeScript', 'ASP.NET Core 10', 'Duende IdentityServer', 'Angular', 'Analog.js', 'OID4VP/VCI', 'PostgreSQL'],
    links: [{ label: 'gramota.eu', url: 'https://gramota.eu' }],
    featured: true,
    caseStudyUrl: '/case-studies/gramota',
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
  Frontend: ['Angular 8–18', 'React', 'Next.js', 'TypeScript', 'RxJS', 'Signals', 'NGRX', 'Module Federation', 'Tailwind', 'GraphQL'],
  Backend: ['.NET / C#', 'ASP.NET', 'Entity Framework', 'Node.js', 'NestJS', 'Express'],
  'AI / ML': ['Anthropic SDK', 'OpenAI SDK', 'RAG', 'Fine-tuning', 'Whisper', 'ElevenLabs', 'NL→SQL', 'Evals'],
  'Identity & Payments': ['Duende IdentityServer', 'OAuth 2.0 / OIDC', 'OID4VP / OID4VCI', 'eIDAS 2', 'Stripe', 'X.509 PKI'],
  Cloud: ['AWS (S3, CloudWatch)', 'Azure DevOps', 'Docker', 'Jenkins', 'CI/CD'],
  Mobile: ['React Native', 'Expo', 'BLE protocols'],
  'Browser Extensions': ['Manifest V3', 'Service workers', 'Content scripts (MAIN world)', 'tabCapture / desktopCapture', 'externally_connectable', 'Chrome Web Store'],
  Data: ['PostgreSQL', 'MSSQL', 'Redis'],
}
