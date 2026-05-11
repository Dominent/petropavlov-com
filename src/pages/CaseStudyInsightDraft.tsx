import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Calendar, Mail } from 'lucide-react'
import { Mermaid } from '../components/Mermaid'

const TITLE = 'Building an AI meeting SaaS end-to-end while bots get banned'
const DESCRIPTION =
  'Insight Draft case study — Chrome extension recording without bots, 6+ parallel LLM calls per meeting, custom Hangfire fan-out/fan-in, statistical-voting speaker mapping. What was hard, what shipped, what I would do differently.'
const URL = 'https://petropavlov.dev/case-studies/insight-draft'
const PUBLISHED = '2026-05-10'

const ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  author: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
  },
  publisher: {
    '@type': 'Person',
    name: 'Petromil Pavlov',
    url: 'https://petropavlov.dev/',
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
  url: URL,
  about: [
    'AI meeting notes',
    'Chrome extension',
    'Manifest V3',
    'Deepgram',
    'OpenAI Responses API',
    'RAG',
    'Hangfire',
    'Stripe',
    '.NET',
    'Angular',
  ],
  keywords:
    'AI meeting notes, Chrome extension, Manifest V3, tabCapture, Deepgram, OpenAI Responses API, RAG, Hangfire, Stripe, .NET, Angular, no-bot recording',
}

function useArticleHead() {
  useEffect(() => {
    const prevTitle = document.title
    document.title = `${TITLE} · Petro Pavlov`

    const metas: HTMLMetaElement[] = []
    const link = document.createElement('link')

    function setMeta(attr: 'name' | 'property', key: string, value: string) {
      const m = document.createElement('meta')
      m.setAttribute(attr, key)
      m.setAttribute('content', value)
      document.head.appendChild(m)
      metas.push(m)
    }

    setMeta('name', 'description', DESCRIPTION)
    setMeta('property', 'og:type', 'article')
    setMeta('property', 'og:title', TITLE)
    setMeta('property', 'og:description', DESCRIPTION)
    setMeta('property', 'og:url', URL)
    setMeta('property', 'og:image', 'https://petropavlov.dev/og.png')
    setMeta('property', 'article:author', 'Petromil Pavlov')
    setMeta('property', 'article:published_time', PUBLISHED)
    setMeta('name', 'twitter:title', TITLE)
    setMeta('name', 'twitter:description', DESCRIPTION)

    link.setAttribute('rel', 'canonical')
    link.setAttribute('href', URL)
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(ARTICLE_SCHEMA)
    document.head.appendChild(script)

    return () => {
      document.title = prevTitle
      metas.forEach((m) => document.head.removeChild(m))
      document.head.removeChild(link)
      document.head.removeChild(script)
    }
  }, [])
}

const ARCH_DIAGRAM = `flowchart TB
    SPA["Angular 17 SPA<br/>NgRx + SignalR client"]
    EXT["Chrome extension (MV3)<br/>tabCapture + desktopCapture<br/>+ MAIN-world caption scrape<br/>Meet · Teams · Zoom (no bot)"]
    API[".NET 8 API + Hangfire<br/>Two PostgreSQL DBs<br/>Custom fan-out/fan-in · Stripe"]
    LLM["Node LLM service<br/>Express + tsoa<br/>OpenAI Responses API<br/>+ file_search"]
    DG["Deepgram<br/>Nova-3 multilingual"]
    BOT["Slack Huddle bot<br/>Playwright stealth"]

    SPA -- "REST + WebSocket" --> API
    EXT -- "recording chunks · live captions" --> API
    API -- "proxy / orchestrate" --> LLM
    API -- "transcribe" --> DG
    API -- "spawn + audio chunks" --> BOT`

export function InsightDraftCaseStudy() {
  useArticleHead()

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <header className="border-b border-border-subtle/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-dim transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            back to petro.pavlov
          </Link>
          <a
            href="https://cal.com/petropavlov/intro"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-3 py-1 text-xs text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10"
          >
            <Calendar className="h-3 w-3" />
            Book intro
          </a>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 pt-14 pb-24">
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-accent/90">
            <span>case study</span>
            <span className="h-px w-8 bg-border-strong" />
            <span className="text-faint">AI meeting SaaS</span>
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
            {TITLE}
          </h1>
          <p className="mb-6 text-xl leading-relaxed text-muted">
            What end-to-end AI product engineering actually looks like, in 2026, when the
            category is being reshaped by lawsuits and admin policies. The Insight Draft
            architecture &mdash; what&rsquo;s hard, what shipped, what I&rsquo;d do differently.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-faint">
            <span>by Petromil Pavlov</span>
            <span className="text-ghost">·</span>
            <span>May 2026</span>
            <span className="text-ghost">·</span>
            <span>~13 min read</span>
            <span className="text-ghost">·</span>
            <a
              href="https://app.insightdraft.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent/80 transition-colors hover:text-accent-bright"
            >
              app.insightdraft.com
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <span className="text-ghost">·</span>
            <a
              href="https://chromewebstore.google.com/detail/insight-draft-ai-meeting/ljdgclmpndcckebbncgafkcnnnallbnm"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent/80 transition-colors hover:text-accent-bright"
            >
              Chrome Web Store
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div
          className="
            prose prose-invert max-w-none
            prose-headings:font-medium prose-headings:tracking-tight prose-headings:text-foreground
            prose-h2:mt-16 prose-h2:mb-4 prose-h2:text-2xl prose-h2:md:text-3xl
            prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-xl
            prose-p:text-muted prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-medium
            prose-a:text-accent prose-a:no-underline hover:prose-a:text-accent-bright
            prose-code:rounded prose-code:border prose-code:border-border prose-code:bg-surface/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.85em] prose-code:text-accent-bright prose-code:before:content-none prose-code:after:content-none
            prose-pre:rounded-lg prose-pre:border prose-pre:border-border/80 prose-pre:bg-background prose-pre:text-[0.8rem] prose-pre:leading-relaxed
            prose-li:text-muted prose-li:my-1
            prose-ul:my-4
            prose-blockquote:border-l-accent-soft/40 prose-blockquote:bg-surface/30 prose-blockquote:text-muted prose-blockquote:not-italic prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r
            prose-hr:border-border
          "
        >
          <p>
            The AI meeting category has spent the last twelve months getting reshaped. In
            August 2025, Otter was hit with a CIPA (California Invasion of Privacy Act) class
            action over notetaker recordings. Microsoft is rolling out admin policies in
            May&ndash;June 2026 that let Teams tenants block third-party recording bots by
            default. Universities &mdash; UW, Chapman, UC Riverside &mdash; have banned
            non-native AI bots from their meeting estates. And in March 2026, Granola raised{' '}
            <a href="https://techcrunch.com/2026/03/25/granola-raises-125m-hits-1-5b-valuation-as-it-expands-from-meeting-notetaker-to-enterprise-ai-app/" target="_blank" rel="noreferrer">$125M Series C at a $1.5B valuation</a>{' '}
            on the bet that <em>botless</em> recording is the future. Granola did it for one
            platform; doing it across Google Meet, Microsoft Teams, Zoom, and Slack Huddles
            is the work I&rsquo;m about to describe.
          </p>
          <p>
            Meanwhile, every business meeting still needs an AI summary. So buyers are stuck.
            The bot-based incumbents (Otter, Fireflies, Chorus, Read.ai) are being procurement-
            blocked. The platform-native tools (Microsoft Copilot, Gemini for Meet, Zoom AI
            Companion) only cover the platform you&rsquo;re inside &mdash; useless if your team
            spans Meet, Teams, Zoom, and Slack Huddles. The Granola-style botless newcomers
            cover one or two platforms each.
          </p>
          <p>
            <strong>Insight Draft</strong> is a two-person founding team. My co-founder
            Francesco and I built it end-to-end. I owned the architecture and the systems
            described in this case study &mdash; the extension, the API, the LLM
            orchestration, the billing lifecycle, and the infrastructure. Francesco
            contributed engineering on the CMS and analytics paths in addition to product
            and business. Bot-free recording across Google Meet, Microsoft Teams, and Zoom
            via a Manifest V3 (MV3) Chrome extension I&rsquo;ve maintained for two years; a
            separate Slack Huddle bot for the case where there&rsquo;s no browser tab to
            capture; Deepgram speaker-attributed transcription enriched with live caption
            scraping; six LLM call types per meeting analysing summaries, chapters,
            highlights, behaviour mentions; RAG (retrieval-augmented generation) over
            transcripts with verifiable citations; Stripe billing with proper subscription
            lifecycle; observability and CI/CD.
          </p>

          <h2>Why this is interesting now</h2>
          <p>
            The buyer pressure is bipolar. On one side: the regulatory and platform pushback
            on bots. On the other: the&nbsp;feature bar set by venture-backed incumbents that
            users now expect &mdash; speaker-attributed transcripts, topic chapters,
            decision/action extraction, conversation analytics, multi-language support,
            grounded Q&A with citations.
          </p>
          <p>
            The architectural question is straightforward: <em>can a small team ship a
            product with the depth of a $30M-funded competitor</em>, by leaning hard on
            opinionated platform choices and avoiding work that doesn&rsquo;t differentiate?
            The answer that&rsquo;s in the code: yes, by buying the things that aren&rsquo;t
            differentiating (OpenAI-hosted vector store, Deepgram for transcription, Stripe
            for billing, Postmark for email) and building the things that are (recording
            capture across platforms, speaker resolution, the orchestration around the LLM
            calls).
          </p>

          <h2>What I built</h2>
          <p>
            The monorepo holds twelve services. Eight of them run together in production
            under one Docker Compose plus Traefik 2.5 (the proxy itself, the Angular SPA, the
            marketing site, the .NET API, the Node LLM service, Postgres, the DB-setup
            container, and the encrypted backup runner). The Chrome extension and the
            Slack-Huddle bot run on their own; the internal CMS and the E2E suite are
            tooling. The five services that do the work day-to-day:
          </p>
          <Mermaid chart={ARCH_DIAGRAM} caption="Insight Draft architecture · twelve services in the monorepo · how recording, processing, and AI flow through the system" />
          <ul>
            <li>
              <strong>Chrome extension</strong> (Manifest V3, multi-package monorepo) &mdash;
              records Meet/Teams/Zoom via <code>tabCapture</code> for browser meetings and{' '}
              <code>desktopCapture</code> for desktop apps. Has a content script running in
              MAIN world on Google Meet that scrapes the platform&rsquo;s own caption stream
              for live speaker attribution. Bidirectional messaging with the web app via{' '}
              <code>externally_connectable</code>.
            </li>
            <li>
              <strong>Slack Huddle bot</strong> (<code>meeting-bot/</code>) &mdash; Playwright
              with stealth plugin, joins Slack huddles where there&rsquo;s no browser tab to
              capture. Multiple flow variants (auth-cookie, invite, magic-link). Janus client
              for direct connection to Slack&rsquo;s WebRTC SFU as a fallback. Necessary
              because the extension can&rsquo;t reach Slack&rsquo;s desktop UI.
            </li>
            <li>
              <strong>.NET 8 API</strong> (<code>insight-draft-api/</code>) &mdash; ASP.NET
              Core, EF Core, Hangfire (background jobs), MediatR (in-process CQRS), Identity
              + JWT auth, two PostgreSQL databases (main app + a separate transcript DB to
              keep high-write <code>Word</code>/<code>Caption</code> tables off the metadata
              DB). Stripe.net 48, Deepgram SDK 6, AWS SDK, FFmpeg via CliWrap. This is where
              the recording pipeline, billing lifecycle, and tenant model live.
            </li>
            <li>
              <strong>Node.js LLM service</strong> (<code>insight-draft-api-llm/</code>) —
              Express + tsoa-generated routes, kept deliberately thin. Proxies and
              orchestrates the OpenAI Responses API with strict structured outputs,
              moderation passthrough, conversation persistence, and the assistant RAG path
              backed by OpenAI-hosted <code>file_search</code> vector stores. The .NET API
              calls this; the SPA never does.
            </li>
            <li>
              <strong>Angular 17 SPA</strong> (<code>insight-draft-ui/</code>) &mdash; NgRx
              (Redux for Angular), SignalR (.NET&rsquo;s real-time hub framework) client for
              status updates, vidstack/media-chrome video player consuming WebVTT files for
              subtitles/speakers/chapters/highlights, Toast UI editor for in-app notes,
              ngx-translate across six languages (en, it, fr, es, nl, bg).
            </li>
          </ul>
          <p>The other seven services round it out:</p>
          <ul>
            <li>
              <strong>Marketing site</strong> (Angular SSR), <strong>internal CMS</strong>{' '}
              (React 19 + Vite + shadcn), <strong>CMS API</strong> (clean-architecture .NET
              skeleton), <strong>Playwright E2E suite</strong> (extension + meetings projects),{' '}
              <strong>DB-setup container</strong> (one-shot bootstrap),{' '}
              <strong>deployment</strong> (Docker Compose + Traefik 2.5 with Let&rsquo;s
              Encrypt + AWS Secrets Manager), <strong>cookie-consent kit</strong>.
            </li>
          </ul>

          <h2>The hardest engineering parts</h2>

          <h3>1. Statistical-voting speaker mapping</h3>
          <p>
            Deepgram returns numeric diarization IDs &mdash; Speaker 0, 1, 2 &mdash; with no
            relation to actual participants. The mapper&rsquo;s job is to bind those numeric
            IDs to known users and external participant identifiers from the meeting&rsquo;s
            participant list. Naive approaches (count consecutive segments, longest-talker
            heuristic) fail on real meetings with overlap and short utterances.
          </p>
          <p>
            <code>StatisticalVotingSpeakerMapper</code> does it differently. It iterates every
            caption emitted by Deepgram, votes for the participant whose known speaking-time
            window overlaps it, weights by overlap duration, and then derives a confidence
            threshold per mapping. The threshold itself adapts to coverage &mdash; relaxed for
            short sample windows, stricter for longer ones &mdash; via a separate{' '}
            <code>ThresholdPolicy</code>. When confidence is below the threshold, the mapping
            falls back to the simpler <code>TimestampOnlySpeakerMapper</code> rather than
            making a high-confidence claim it can&rsquo;t back up.
          </p>
          <p>
            Around it: <code>VoteCollector</code>, <code>MappingBuilder</code>,{' '}
            <code>CoverageAnalyzer</code>, <code>SpeakerTimeLookup</code>. The whole stack is
            pluggable behind <code>ISpeakerMappingService</code> with separate strategies for
            different meeting providers (<code>SimulatedDiarizationMapper</code>,{' '}
            <code>ManualRecordingDiarizationStrategy</code>,{' '}
            <code>StatisticalVotingSpeakerMapper</code>).
          </p>

          <h3>2. The host-inference heuristic for Google Meet</h3>
          <p>
            For Google Meet specifically, the extension scrapes the platform&rsquo;s own
            caption stream from the page&rsquo;s JS context (MAIN-world content script), and
            the API matches caption <code>deviceId</code> to participant{' '}
            <code>ExternalUserId</code>. There&rsquo;s a real-world quirk: <strong>the meeting
            host never appears in their own RTC participants feed</strong>. Google&rsquo;s
            client-side state doesn&rsquo;t list the local user. So when the matcher runs
            after the meeting ends, the host&rsquo;s captions have no participant to bind to.
          </p>
          <p>
            The fix is inline in <code>RecordingCompletionService.CreateTranscriptWithLLM</code>{' '}
            (around lines 465&ndash;486): if exactly one <code>deviceId</code> remains
            unmatched after the regular pass, that <code>deviceId</code> is the host. A
            hand-engineered correction for a real Google API gap. The kind of fix you only
            build after watching real meeting traces fail and figuring out why.
          </p>

          <h3>3. Custom Hangfire fan-out/fan-in via Postgres atomic UPDATE</h3>
          <p>
            Hangfire ships single-job continuations out of the box. <em>Batches</em> (fan-out
            from N jobs to a single continuation when all complete) is a paid Hangfire Pro
            feature. So I built it. The three core files (<code>PgBatchCoordinator</code>,{' '}
            <code>BatchContinuationFilter</code>, <code>PgJobResultStorage</code>) are about
            280 lines together; the whole batching project including builders and DI plumbing
            is around 530.
          </p>
          <p>
            The mechanism is a Postgres <code>job_batch</code> row holding a{' '}
            <code>remaining_slots</code> counter. Each child job calls{' '}
            <code>SignalAsync</code>, which executes:
          </p>
          <pre>
            <code>{`UPDATE hangfire.job_batch
SET remaining_slots = remaining_slots - 1
WHERE batch_id = $1 AND remaining_slots > 0
RETURNING remaining_slots`}</code>
          </pre>
          <p>
            When the returned value hits 0, the global Hangfire filter fires the
            continuation. <code>PgJobResultStorage</code> lets the continuation consume typed
            results from earlier jobs in the batch (<code>GetBatchResultAsync&lt;VideoProcessingResult&gt;</code>).
          </p>
          <p>
            This is the spine of the recording-completion pipeline. Video processing,
            transcription, thumbnail generation, sprite-sheet generation, and{' '}
            speaker-attribution all run in parallel; <code>VideoCleanupJob</code> only fires
            after every one finishes, with access to all their typed outputs. The trade-off
            is real &mdash; we own the failure surface. The two risks are double-decrement
            on retry (mitigated by the atomic <code>WHERE remaining_slots &gt; 0</code> guard
            so the same retry can&rsquo;t take the counter below zero) and batches stuck above
            zero if a child job is permanently dropped (handled by Hangfire&rsquo;s standard
            failure callbacks). Worth knowing if you ever go this route: $500/mo of Hangfire
            Pro would have been a rational call too &mdash; the build-vs-buy was decided more
            on &ldquo;we already have Postgres, atomic SQL is the smaller new thing&rdquo;
            than on dollar savings.
          </p>

          <h3>4. PostMeetingAnalysisBackgroundJob &mdash; six parallel LLM call types per meeting</h3>
          <p>
            One file, 970 lines, 49KB. <code>PostMeetingAnalysisBackgroundJob</code>{' '}
            fans out across <strong>two parallel waves of <code>Task.WhenAll</code></strong>{' '}
            covering six distinct LLM call types, plus a sequential keywords follow-up if
            the behaviour-mentions wave returned content:
          </p>
          <ul>
            <li>Highlights extraction</li>
            <li>Behaviour-mentions extraction (against the org&rsquo;s declared values)</li>
            <li>Summary</li>
            <li>Tags</li>
            <li>Chapters</li>
            <li>Meeting classification</li>
          </ul>
          <p>
            Each call has its own strongly-typed C# <code>IPrompt</code> class extending{' '}
            <code>BasePrompt</code>, its own structured-output JSON schema, a 180-second
            timeout, and explicit <code>useStructuredOutputs: true, reasoningEffort: "minimal"</code>{' '}
            parameters tuned to gpt-5-mini. The job degrades gracefully: if the transcript
            refinement step fails, the orchestrator logs and continues with the un-refined
            text rather than failing the whole pipeline. If the org has no declared values,
            the behaviour-mentions call is skipped. If the meeting is under 120 seconds, VTT
            generation for chapters and highlights is skipped entirely.
          </p>
          <p>
            An internal README of the prompt-system refactor reports 25&ndash;30% fewer
            tokens, 20&ndash;25% better accuracy, and 75% fewer JSON parsing errors against
            the prior ad-hoc baseline. I&rsquo;d treat those as engineering-team estimates
            rather than benchmarked numbers &mdash; what actually matters for maintainability
            is the structural win (one consistent prompt class shape, strict-mode JSON
            schema everywhere, the model can&rsquo;t emit malformed JSON).
          </p>
          <p>
            The architecture also supports multi-provider routing &mdash; the LLM service has
            an enum slot for Anthropic and a Strategy interface for the model client &mdash;
            but currently routes everything through OpenAI. The plug point is there for when
            cost or latency makes a Claude or Gemini swap worth it.
          </p>

          <h3>5. Stripe webhook lifecycle with synthetic ClaimsPrincipal</h3>
          <p>
            Stripe webhooks arrive unauthenticated. But everything downstream &mdash; EF
            tenant-stamping (which reads <code>organization_id</code> from{' '}
            <code>HttpContext.User</code> claims), audit logging, subscription update logic
            &mdash; assumes an authenticated user is in scope.
          </p>
          <p>
            <code>BillingController</code> bridges the gap. The handler validates the Stripe
            signature, checks idempotency against a <code>StripeWebhookEvent</code> table
            with a unique constraint on the event id, resolves the org from the event payload
            (which lives in different fields per event type), then{' '}
            <strong>mounts a synthetic <code>ClaimsPrincipal</code> with the resolved
            organization id onto <code>HttpContext.User</code></strong>. Now the existing
            tenant-stamping handler in <code>SaveChangesAsync</code> works as if a real user
            had made the request.
          </p>
          <p>
            From there: MediatR dispatches a typed command (
            <code>SubscriptionCreatedCommand</code>, <code>SubscriptionUpdatedCommand</code>,
            etc.); a Strategy factory picks the right subscription-change strategy (
            <code>ImmediateUpgradeStrategy</code>, <code>ScheduledDowngradeStrategy</code>,{' '}
            <code>PaymentModeUpgradeStrategy</code>, <code>ZeroCostUpgradeStrategy</code>,{' '}
            <code>SetupPaymentMethodStrategy</code>) based on the diff between current and
            target subscription state; the result reconciles to a{' '}
            <code>SubscriptionStateHash</code> on the org so the SPA can detect drift and
            force a token refresh.
          </p>
          <p>
            Subscription permissions are baked into the JWT itself. The auth refresh
            recomputes them from the current subscription plan, so per-request authorization
            checks read JWT claims &mdash; zero Stripe API calls on the read path. Stripe is
            only called when the user actively manages their subscription or when a Stripe
            webhook fires.
          </p>

          <h2>Engineering choices worth calling out</h2>

          <h3>Two databases, on purpose</h3>
          <p>
            The transcript schema (<code>Transcript</code>, <code>Word</code>,{' '}
            <code>LiveCaption</code>) sits in its own physical Postgres database with its own
            EF context. Hot writes during transcription &mdash; potentially millions of
            words per long recording &mdash; don&rsquo;t compete with the metadata DB for
            connections, locks, or vacuum. Migrations are split too:{' '}
            <code>--context TranscriptDbContext</code> for one,{' '}
            <code>ApplicationDbContext</code> for the other. Costs slightly more in operational
            complexity (two backups, two connection strings), pays for itself when transcript
            volume grows.
          </p>

          <h3>OpenAI-hosted vector store, no self-hosted RAG</h3>
          <p>
            The assistant uses OpenAI&rsquo;s <code>file_search</code> tool against two
            vector store IDs &mdash; one general knowledge base, one app-specific. The
            citations the system returns are not free-form text references: they&rsquo;re a
            strict-typed JSON schema with seven discriminated action types (
            <code>navigate</code>, <code>open_video</code>, <code>open_settings</code>,{' '}
            <code>copy_text</code>, <code>open_external_link</code>,{' '}
            <code>open_meeting</code>, <code>contact_support</code>). Each action is bound to
            real navigable state, not text that could be hallucinated.
          </p>
          <p>
            The trade-off is honest: I don&rsquo;t run pgvector or qdrant or pinecone. I
            don&rsquo;t maintain an embedding pipeline or version embeddings on model
            changes. I get OpenAI&rsquo;s search quality and OpenAI&rsquo;s pricing, both
            good enough for this product. If the cost or quality calculus changes, the
            Strategy interface for retrieval is in place.
          </p>

          <h3>MediatR pre-save events for quota enforcement</h3>
          <p>
            <code>ApplicationDbContext.DispatchBeforeSaveEventsAsync</code> publishes
            domain notifications (<code>MeetingRecordingBeforeSaveEvent</code>,{' '}
            <code>PromptBeforeSaveEvent</code>, <code>RecordingDurationBeforeSaveEvent</code>)
            before the EF transaction commits. A subscription-quota handler can throw and
            roll back the entire transaction. This means quota enforcement isn&rsquo;t a
            decorator on every controller &mdash; it&rsquo;s a single integration point at
            the persistence layer that catches every code path including jobs, webhooks, and
            future GraphQL routes you haven&rsquo;t written yet.
          </p>

          <h3>Two-pass language alignment</h3>
          <p>
            The assistant&rsquo;s alignment prompt is wired for seven languages; the SPA
            ships translations for six today. The system prompt instructs the model to detect
            the user&rsquo;s question language and respond in it. In practice, models drift:
            a Bulgarian question gets an English answer because the UI lang is English and
            the system prompt is English.
          </p>
          <p>
            The fix is a second LLM call. After the first response, a{' '}
            <code>LanguageAlignmentPrompt</code> runs that detects the actual language of
            the question and the actual language of the response, and re-translates if they
            don&rsquo;t match. Costs an extra call. Eliminates an entire class of
            &ldquo;answered in the wrong language&rdquo; bugs. The model&rsquo;s
            self-declared <code>detected_question_language</code> and{' '}
            <code>detected_response_language</code> are part of the strict response schema,
            so they&rsquo;re queryable as telemetry.
          </p>

          <h3>JWT-baked subscription permissions</h3>
          <p>
            Around 80 base permissions of form <code>Resource.Action.Entity</code> plus 7
            space-scoped variants <code>Spaces.{'{spaceId}'}.Action.Entity</code> &mdash; ~87
            total across plans and roles. The authorisation check is a JWT claim lookup. When
            a webhook updates a subscription, the auth refresh recomputes permissions and a{' '}
            <code>SubscriptionStateHash</code> on the org gets bumped; the SPA compares the
            hash returned in API response headers against the one in its current token and
            triggers a silent re-auth on drift. Saves real Stripe API calls and real latency
            on the hot path.
          </p>

          <h3>WebSocket / track-element JWT-via-query-string allowlist</h3>
          <p>
            Browsers can&rsquo;t put custom headers on WebSocket handshakes or HTML{' '}
            <code>&lt;track&gt;</code> requests. So the JWT is allowed via{' '}
            <code>?access_token=</code> for exactly two paths:{' '}
            <code>/hubs/transcript-status</code> and <code>/api/v1/recordings/media</code>.
            Anywhere else, query-string JWTs are ignored. Practical accommodation for a
            real browser limitation, narrowly scoped.
          </p>

          <h3>Strict schemas + structured outputs everywhere</h3>
          <p>
            All gpt-5-mini calls in the post-meeting analysis use{' '}
            <code>useStructuredOutputs: true</code> with the OpenAI Responses API&rsquo;s
            strict-mode JSON schema. The conversation controller fails fast on parse errors
            when structured outputs are on, rather than swallowing a malformed response.
            The non-GPT-5 fallback path uses loose <code>json_object</code> mode for
            backward compatibility. The README claims this combination cut JSON parsing
            errors by 75%.
          </p>

          <h2>What I&rsquo;d do differently</h2>
          <p>
            <strong>Live transcription.</strong> Today, Deepgram is called post-call with
            the full recording. Live captions exist (Google Meet only, scraped by the
            extension) but feed only speaker attribution &mdash; not the displayed
            transcript. A WebSocket Deepgram stream during the meeting is the obvious
            upgrade: real-time transcript visible mid-meeting, more useful for live
            collaboration. I deferred it because post-call simplifies the failure model.
          </p>
          <p>
            <strong>Multi-provider for real.</strong> The Strategy is in place for
            Anthropic and Gemini. The plumbing isn&rsquo;t. Adding Claude as a fallback
            (when OpenAI rate-limits) and Gemini for cheap classification work would cut
            costs and improve resilience. Cost-benefit hasn&rsquo;t hit the threshold yet.
          </p>
          <p>
            <strong>Token tracking.</strong> The <code>LLMService.TrackTokenUsageAsync</code>{' '}
            method is currently logged-only. It would graduate to enforced quotas per plan
            tier &mdash; the right shape would be a budget per organization per billing
            period, with a soft warning at 80% and hard cutoff at 100%. The Strategy is in
            place; the implementation isn&rsquo;t.
          </p>
          <p>
            <strong>Observability.</strong> Serilog to Postgres + Slack works. For a SaaS at
            scale I&rsquo;d want OpenTelemetry traces flowing into Honeycomb or Tempo so the
            multi-service spans (extension → API → LLM service → Deepgram → Hangfire jobs →
            Stripe webhook → SPA) can be inspected end-to-end without correlating log lines
            by hand.
          </p>
          <p>
            <strong>Staging.</strong> Currently disabled to save costs. The right move is to
            spin it up only on PR merges, not 24/7.
          </p>

          <h2>What&rsquo;s live</h2>
          <ul>
            <li>
              <strong>Public Chrome Web Store extension</strong> &mdash;{' '}
              <a href="https://chromewebstore.google.com/detail/insight-draft-ai-meeting/ljdgclmpndcckebbncgafkcnnnallbnm" target="_blank" rel="noreferrer">install link</a>{' '}
              &mdash; Manifest V3, two years on the store, multi-package monorepo with E2E
              test suite
            </li>
            <li>
              <strong>Production SaaS</strong> at <code>app.insightdraft.com</code> with
              Stripe billing, multi-environment Jenkins CI/CD, AWS for compute and Hetzner
              for backups
            </li>
            <li>
              <strong>Eight production services</strong> orchestrated under one Docker
              Compose plus Traefik 2.5 with Let&rsquo;s Encrypt (twelve in the monorepo
              total, including the standalone Chrome extension and Slack-Huddle bot)
            </li>
            <li>
              <strong>Custom Hangfire fan-out/fan-in primitive</strong> that gives us
              Batches without paying for Hangfire Pro
            </li>
            <li>
              <strong>Six LLM call types per meeting</strong> across two parallel{' '}
              <code>Task.WhenAll</code> waves, with strict JSON schemas and graceful
              degradation
            </li>
            <li>
              <strong>End-to-end Playwright suite</strong> running against simulated meetings
              with real Deepgram callbacks
            </li>
          </ul>

          <h2>What this is not</h2>
          <ul>
            <li>
              <strong>Not real-time transcription via WebSocket.</strong> Deepgram is
              post-call. The &ldquo;live&rdquo; experience for users is status updates over
              SignalR plus extension-scraped Google Meet captions for speaker attribution.
            </li>
            <li>
              <strong>Not multi-provider LLM yet.</strong> The Strategy and enum scaffold
              for Anthropic exist; the wiring doesn&rsquo;t. Today, every call is to OpenAI.
            </li>
            <li>
              <strong>Not self-hosted RAG.</strong> Vector storage is OpenAI-hosted via
              <code>file_search</code>. Right call for now; will need to reconsider if cost
              or quality changes.
            </li>
            <li>
              <strong>Not solo across the whole company.</strong> Insight Draft is
              co-founded. I owned the architecture and the systems described in this case
              study; my co-founder Francesco contributed engineering on the CMS and analytics
              paths in addition to product and business.
            </li>
            <li>
              <strong>Not a finished product.</strong> Active development, real bug backlog,
              real shipping cadence. The Chrome extension is the oldest piece (two years on
              the Web Store); the rest of the platform is roughly eighteen months of focused
              work on top of it.
            </li>
          </ul>

          <hr />

          <h2>If you&rsquo;re hiring this kind of work</h2>
          <p>
            What this case study demonstrates: I&rsquo;ve owned the architecture and the
            full system surface for a meeting-AI product &mdash; the extension, the API, the
            LLM orchestration, the infrastructure, the subscription lifecycle &mdash; and
            watched it run for two years. Few engineers have done this combination
            end-to-end at a depth that survives operating it. Granola raised $125M to do
            botless capture for one platform; we built it for three plus Slack Huddles
            with a co-founding pair, on AWS plus Hetzner.
          </p>
          <p>
            I take on a small number of engagements per year for founders building AI
            products and companies that need a senior IC who can ship end-to-end. A typical
            engagement looks like:
          </p>
          <ul>
            <li>
              <strong>Weeks 1&ndash;2</strong> &mdash; I trace your existing
              capture/transcribe/summarise path end-to-end, identify the three most-likely
              failure modes under load, and write up the architecture recommendations
            </li>
            <li>
              <strong>Weeks 3&ndash;6</strong> &mdash; spike the most-uncertain piece
              (extension capture, LLM orchestration, RAG pipeline, payments lifecycle)
              end-to-end against your real stack
            </li>
            <li>
              <strong>Weeks 7&ndash;10</strong> &mdash; production hardening, observability,
              CI/CD, threat model. Pair with one or two of your senior engineers throughout
              so the codebase transfers
            </li>
            <li>
              <strong>Week 11+</strong> &mdash; handoff with documented runbooks; optional
              retainer for follow-up questions
            </li>
          </ul>
          <p>
            On conflict of interest: Insight Draft is an active SaaS in this category. I
            won&rsquo;t take engagements that overlap directly with its product surface
            (no work that competes with our roadmap, no IP from your project flows
            backwards). I&rsquo;m happy to scope this explicitly upfront so you know
            exactly what&rsquo;s in and out before we start.
          </p>
          <p>
            If that fits what you&rsquo;re scoping, the booking link below skips slides and
            goes straight to a 60-minute technical call.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-stretch gap-3 rounded-2xl border border-border/80 bg-surface/30 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-medium text-foreground">
              Building something AI-shaped end-to-end?
            </p>
            <p className="mt-1 text-sm text-dim">
              60-min technical call &mdash; no slides, no pitch. Architecture, trade-offs, what
              would actually work for your stack.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row">
            <a
              href="mailto:petromilpavlov@gmail.com"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-bright"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
            <a
              href="https://cal.com/petropavlov/intro"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent-soft/40 bg-accent-soft/5 px-4 py-2 text-sm font-medium text-accent-bright transition-colors hover:border-accent-soft/70 hover:bg-accent-soft/10"
            >
              <Calendar className="h-4 w-4" />
              Book a 20-min intro
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
