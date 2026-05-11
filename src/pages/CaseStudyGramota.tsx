import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowUpRight, Calendar, Mail } from 'lucide-react'
import { Mermaid } from '../components/Mermaid'

const TITLE = 'Building a TypeScript SDK for the EU Digital Identity Wallet'
const DESCRIPTION =
  '15 published npm packages, 579 mock + 31 live conformance tests against EU reference infrastructure, end-to-end roundtrips with the patched EU Android wallet. The Gramota case study — what was hard, what I shipped, and what I would do differently.'
const URL = 'https://petropavlov.dev/case-studies/gramota'
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
    'EU Digital Identity Wallet',
    'eIDAS 2',
    'OID4VP',
    'OID4VCI',
    'SD-JWT VC',
    'DPoP',
    'DCQL',
    'TypeScript',
  ],
  keywords:
    'EU Digital Identity Wallet, eIDAS 2, OID4VP, OID4VCI, SD-JWT VC, DPoP, DCQL, TypeScript SDK, EUDIW, verifier, issuer',
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
    IDS["gramota-identity<br/>auth.gramota.eu<br/>ASP.NET Core 10 + Duende"]
    DEMO["demo-store<br/>(Solnce)"]
    API["apps/api<br/>(Fastify)"]
    DASH["apps/dashboard<br/>(Angular 21)"]
    GATEWAY["eudi-gateway monorepo<br/>15 @gramota/* npm pkgs"]
    WALLET["EU Reference Wallet<br/>(Android)"]

    IDS -- "OIDC + JWTs" --> API
    DEMO --> API
    DASH --> API
    GATEWAY -. "imports as deps" .-> API
    DEMO -- "OID4VP/VCI" --> WALLET
    GATEWAY -. "OID4VP/VCI" .-> WALLET`

export function GramotaCaseStudy() {
  useArticleHead()

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* top bar */}
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
        {/* article header */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-accent/90">
            <span>case study</span>
            <span className="h-px w-8 bg-border-strong" />
            <span className="text-faint">EU Digital Identity</span>
          </div>
          <h1 className="mb-6 text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
            {TITLE}
          </h1>
          <p className="mb-6 text-xl leading-relaxed text-muted">
            If you&rsquo;re a regulated business that has to accept EU Digital Identity Wallet
            credentials by December 2027, the situation you&rsquo;re walking into is messy. Here&rsquo;s
            what I&rsquo;ve learned building one of the few TypeScript-native SDKs for it &mdash;
            what&rsquo;s hard, what I shipped, and what I&rsquo;d still do differently.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-faint">
            <span>by Petromil Pavlov</span>
            <span className="text-ghost">·</span>
            <span>May 2026</span>
            <span className="text-ghost">·</span>
            <span>~12 min read</span>
            <span className="text-ghost">·</span>
            <a
              href="https://gramota.eu"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-accent/80 transition-colors hover:text-accent-bright"
            >
              gramota.eu
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* prose body */}
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
            The European Digital Identity Wallet has a deadline. By December 2026, every EU
            member state must offer one. By December 2027, banks, telcos, healthcare, fintech,
            mobility, and gatekeeper platforms have to accept it. That&rsquo;s a hard regulatory
            clock &mdash; <a href="https://eur-lex.europa.eu/eli/reg/2024/1183/oj" target="_blank" rel="noreferrer">Regulation (EU) 2024/1183</a> &mdash;
            for what is, today, still a moving target.
          </p>
          <p>
            Most production-grade tooling is JVM- or Rust-rooted. The TypeScript ecosystem has
            solid lower-level primitives but few opinionated, EUDIW-shaped SDKs that ship with
            batteries &mdash; wire-format validation, x5c chain validation, DPoP, JAR, IETF Token
            Status List revocation, and end-to-end tests against the EU reference wallet &mdash; in
            a form a Node/TypeScript backend team can adopt in an afternoon.
          </p>
          <p>
            So I built one. <strong>Gramota</strong> is an Apache-2.0 TypeScript SDK plus a
            hosted SaaS for verifiers and issuers. 15 published npm packages with Sigstore
            provenance, around 580 mock plus 31 live conformance tests, and end-to-end
            roundtrips against the EU Commission&rsquo;s reference wallet on Android with our dev
            verifier cert added to its bundled trust list. This is what&rsquo;s inside it, what was
            hard, and what I&rsquo;d do differently.
          </p>

          <h2>Why this needs to exist</h2>
          <p>
            ENISA noted in early 2026 that &ldquo;no EUDI Wallet has been deployed or certified,
            and the specification remains work in progress.&rdquo; Of 1,260 conformance tests run at
            the 2025 EUDIW Launchpad, peer-to-peer interop succeeded at 74%, but tests against the
            EU Reference Implementation succeeded at only <strong>44%</strong>. Member-state cohorts
            split four ways: a few have public sandboxes (Denmark, France, Germany, Ireland), most
            have repos but no sandbox, and the long tail is &ldquo;uncertain.&rdquo;
          </p>
          <p>
            So buyers are stuck. They have a 2027 acceptance deadline, a spec that&rsquo;s still
            being clarified, reference code maintained for conformance rather than developer
            experience, and a half-dozen open-source SDKs that each cover part of the surface
            but never the whole loop end-to-end with adversarial test coverage. If you&rsquo;re a
            fintech that needs to accept an EUDIW credential next year for KYC, you can&rsquo;t
            wait for the ecosystem to settle.
          </p>
          <p>A relying party stack needs to handle:</p>
          <ul>
            <li>The OAuth 2.0 layer underneath &mdash; PKCE, Pushed Authorization Requests (PAR, RFC 9126), DPoP (Demonstrating Proof of Possession, RFC 9449)</li>
            <li>OpenID for Verifiable Credential Issuance (OID4VCI) 1.0, where wallets in the wild straddle Draft 13 and Draft 14/15 wire shapes</li>
            <li>OpenID for Verifiable Presentations (OID4VP) 1.0, with Digital Credentials Query Language (DCQL) for query construction</li>
            <li>SD-JWT VC for the credential format, with selective disclosure and KB-JWT (Key Binding JWT)</li>
            <li>Per-organisation X.509 certificates for signed Authorization Requests (JAR &mdash; JWT-Secured Authorization Requests, RFC 9101)</li>
            <li>IETF Token Status List for revocation</li>
            <li>Trust chain resolution against issuer metadata</li>
            <li>Cross-format support (SD-JWT VC today, ISO 18013-5 mdoc tomorrow for mobile driving licence)</li>
            <li>Test coverage against the actual EU reference wallet, not just spec fixtures</li>
          </ul>
          <p>
            That list is most of why &ldquo;should be a weekend project&rdquo; turns into a
            year-and-a-half of work.
          </p>

          <h2>What I built</h2>
          <p>Five repositories.</p>
          <Mermaid chart={ARCH_DIAGRAM} caption="Gramota architecture · five repos · how the SDK, SaaS, identity service and demo connect" />
          <ul>
            <li>
              <strong><code>eudi-gateway</code></strong> &mdash; the open-source SDK monorepo. 15 published <code>@gramota/*</code> packages plus 2 internal. Apache 2.0. pnpm + Turborepo + vitest.
            </li>
            <li>
              <strong><code>gramota-saas</code></strong> &mdash; the hosted multi-tenant offering at <code>app.gramota.eu</code>. Fastify 5 API + Angular 21 dashboard. Imports the SDK as npm deps.
            </li>
            <li>
              <strong><code>gramota-identity</code></strong> &mdash; <code>auth.gramota.eu</code>. ASP.NET Core 10 + Duende IdentityServer + Angular 21. Custom multi-tenancy, super-admin impersonation with audit logs, PAT auth alongside cookies and JWTs.
            </li>
            <li>
              <strong><code>gramota-demo-store</code></strong> &mdash; Solnce, a fictional storefront. React + Vite. Live mode hits the API, mock mode runs offline. Drives the marketing demo.
            </li>
            <li>
              <strong><code>gramota-site</code></strong> &mdash; <code>gramota.eu</code>. Analog.js with build-time SSG. Pulls API docs from each <code>@gramota/*</code> package&rsquo;s TypeDoc output.
            </li>
          </ul>
          <p>
            The OSS SDK is the centerpiece. The public surface is namespaced as{' '}
            <code>client.&lt;resource&gt;.&lt;verb&gt;</code> &mdash;{' '}
            <code>verifier.presentations.verify()</code>, <code>issuer.credentials.issueBatch()</code>,{' '}
            <code>holder.credentials.*</code>, <code>holder.offers.*</code>. Six plug-in slots
            sit behind it: <code>AuthorizationTransport</code> (PAR / Direct / JAR),{' '}
            <code>Signer</code> (default <code>JwkSigner</code>, swap for HSM/KMS/WebAuthn),{' '}
            <code>TrustResolver</code>, <code>StatusResolver</code>,{' '}
            <code>CredentialStore</code>, plus a Registry for{' '}
            <code>CredentialFormatHandler</code> so new formats (mdoc next) plug in without
            changing core. MANIFEST principle 4 sets &ldquo;Stripe-grade DX&rdquo; as the
            explicit target.
          </p>
          <p>
            The 15 packages: <code>@gramota/sdk</code> (top-level facade), <code>verifier</code>,{' '}
            <code>issuer</code>, <code>holder</code> (the three domains), <code>oid4vp</code> and{' '}
            <code>oid4vci</code> (the wire protocols), <code>dcql</code> and{' '}
            <code>presentation-exchange</code> (the two query languages &mdash; DCQL is the new
            one, PE the legacy), <code>qr</code> (deep-link rendering), <code>jose</code>{' '}
            (JWS / x5c / JWK), <code>sd-jwt</code> (the credential format with KB-JWT),{' '}
            <code>credential-format</code> (registry for new formats), <code>trust</code>{' '}
            (issuer trust resolution), <code>status-list</code> (IETF revocation), and{' '}
            <code>core</code> (shared primitives).
          </p>

          <h2>The hardest engineering parts</h2>

          <h3>1. The 12-check verifier pipeline</h3>
          <p>
            Every inbound <code>vp_token</code> goes through twelve checks: structure parse → trust
            resolution → issuer signature → hash binding (with disclosure forgery detection) →
            KB-JWT presence → cnf-binding → KB signature → audience → nonce → time → transcript
            → optional status check. Each one records into a <code>SecurityCheck[]</code> audit
            trail that ships back with the verification response.
          </p>
          <p>
            The subtle bit is rule classification. <code>verifyKeyBinding</code> throws a single
            <code>Error</code>. The verifier&rsquo;s <code>classifyKbFailure</code> helper maps that one
            throw to one of seven specific check names by error message regex &mdash; so the audit
            trail says &ldquo;KB-JWT signature failed&rdquo; or &ldquo;KB nonce mismatch&rdquo;
            instead of &ldquo;key binding error.&rdquo; That&rsquo;s the difference between a
            debuggable system and one that makes auditors squint.
          </p>
          <p>
            The whole thing exposes a Stripe-shaped surface (<code>verifier.presentations.verify</code>,{' '}
            <code>verifier.requests.create</code>, <code>verifier.responses.verify</code>) but every path
            funnels through the same core method. The audit shape is identical regardless of
            which entry point you used.
          </p>

          <h3>2. OID4VCI Draft normalization with batch + DPoP</h3>
          <p>
            The EU reference wallet today sends OID4VCI Draft 14/15 (<code>proofs.jwt[]</code>,{' '}
            <code>credential_configuration_id</code>). My own synthetic holder sends Draft 13
            (<code>proof.jwt</code>, <code>format</code>, <code>vct</code>). Both shapes are
            valid in production &mdash; Drafts 14 and 15 share a wire shape with one extra field,
            so the normalizer is two branches, not three. It collapses both into a single{' '}
            <code>ParsedCredentialRequest</code> so downstream code never sees the draft version.
          </p>
          <p>
            DPoP enforcement (<a href="https://www.rfc-editor.org/rfc/rfc9449.html" target="_blank" rel="noreferrer">RFC 9449</a>) sits next door, and it&rsquo;s
            surprisingly easy to get wrong. The verifier checks <code>htm</code> and <code>htu</code>{' '}
            (with query and fragment stripped per &sect;4.2), enforces an <code>iat</code> skew
            window, replays via injectable <code>hasSeenJti</code>/<code>recordJti</code> (so you
            can swap in Redis), optionally verifies <code>ath = base64url(sha256(token))</code> for
            token-bound proofs, optionally accepts a server-provided <code>nonce</code>, and
            returns the <code>jkt</code> thumbprint for token binding. The crucial detail:{' '}
            <code>recordJti</code> only fires <em>after</em> every other check passes &mdash;
            otherwise a malformed or unsigned proof can poison the replay store.
          </p>
          <p>
            Token binding closes the loop. The token endpoint captures <code>jkt</code> at{' '}
            <code>/token</code>, then the credential endpoint re-verifies at <code>/credential</code>{' '}
            and rejects if <code>verified.jkt !== offer.dpopJkt</code>. That&rsquo;s the difference
            between &ldquo;DPoP supported&rdquo; and &ldquo;DPoP enforced.&rdquo;
          </p>
          <p>
            There&rsquo;s also a <code>postWithDpopRetry</code> helper that handles the
            server-issued <code>use_dpop_nonce</code> retry dance transparently &mdash; first
            request gets a 401 with a server nonce, you re-sign with the nonce included, second
            request succeeds. The retry helper sits in <code>@gramota/oid4vci</code>; the
            holder, issuer, and verifier all import it, so the nonce dance lives in exactly one
            place.
          </p>

          <h3>3. Per-org X.509 certificates and signed JAR</h3>
          <p>
            OID4VP authorization requests come in three flavours: unsigned (the bare URL), a
            signed JWS, or a JWS signed by a self-signed leaf cert with the cert embedded in the{' '}
            <code>x5c</code> header &mdash; the <code>x509_san_dns</code> client identifier scheme
            (called <code>client_id_scheme</code> in OID4VP Final 1.0, renamed to{' '}
            <code>client_id_prefix</code> in 2.0). The EU reference wallet only accepts the
            third. So <code>@gramota/oid4vp</code> generates an ES256 keypair plus a self-signed
            leaf via <code>@peculiar/x509</code> with: SAN-DNS for the verifier hostname (plus
            extras for wildcard tenants), <code>serverAuth + clientAuth</code> Extended Key Usage
            flags, <code>digitalSignature + keyEncipherment</code> Key Usage,{' '}
            <code>BasicConstraints CA:false</code>, and a 20-byte serial. Then the JAR signer
            wraps the request as a compact JWS with <code>typ: oauth-authz-req+jwt</code> and
            embeds the cert in the <code>x5c</code> header.
          </p>
          <p>
            The reference wallet&rsquo;s request authenticator is strict, based on what it accepts
            in the field. It rejects unsigned <code>request_uri</code> outright. It insists URL{' '}
            <code>client_id</code> byte-equals JWT <code>client_id</code>. It reads the leaf
            cert&rsquo;s SAN-DNS and refuses to proceed if the request&rsquo;s host doesn&rsquo;t
            match. So the SaaS persists the cert to disk between dev restarts (so the
            wallet&rsquo;s bundled trust list keeps trusting it) and embeds wildcard{' '}
            <code>*.&lt;base&gt;</code> SAN so one cert covers every per-tenant subdomain.
          </p>

          <h3>4. DCQL matching against SD-JWT-VC disclosures</h3>
          <p>
            DCQL (Digital Credentials Query Language) is a JSON query language baked into OID4VP
            1.0 that lets a verifier ask for credentials by format, claim, and combination &mdash;
            all in one document. The matcher traverses a query path that may target either a
            selectively-disclosable claim (single segment, look up by name in the parsed
            disclosures) or a directly-included claim (multi-segment JSONPath-ish), enforces
            optional <code>meta.vct_values</code> and <code>claim.values</code> constraints, and
            returns the <em>minimal</em> <code>disclose: string[]</code> set &mdash; so the wallet
            sends only what was asked for, not the whole credential.
          </p>
          <p>
            Format-handles both <code>vc+sd-jwt</code> (legacy) and <code>dc+sd-jwt</code> (the
            current IETF SD-JWT VC token type, what the EU verifier and OID4VP 2.0 emit today).
            Used by both the verifier (against an inbound vp_token) and the holder (to plan a
            presentation).
          </p>

          <h3>5. KB-JWT 9-rule verifier</h3>
          <p>
            Key binding is the part of SD-JWT VC that prevents a stolen credential from being
            replayed by anyone but the legitimate holder. <code>@gramota/sd-jwt</code> implements
            all nine rules from the IETF SD-JWT VC spec.
          </p>
          <p>
            Rule 9 (transcript) is the subtle one. The KB-JWT&rsquo;s <code>sd_hash</code>{' '}
            <em>must</em> equal the verifier&rsquo;s own{' '}
            <code>computeSdHash(parsed.presentationPrefix, hashAlg)</code> over{' '}
            <code>&lt;issuer-jws&gt;~&lt;d1&gt;~...~&lt;dN&gt;~</code>, where <code>hashAlg</code>{' '}
            is read from the parent SD-JWT&rsquo;s <code>_sd_alg</code> claim and defaults to{' '}
            <code>sha-256</code>. Mismatch means a disclosure was added, removed, or reordered in
            transit &mdash; adversarial behavior, fail closed.
          </p>
          <p>
            Rule 6 (audience) accepts an array because production EU wallets put either the
            verifier&rsquo;s audience URL (per the SD-JWT-VC spec) <em>or</em> the OID4VP{' '}
            <code>client_id</code> (e.g. <code>x509_san_dns:verifier.example</code>) into{' '}
            <code>aud</code>. Both are valid in the field. The verifier accepts either.
          </p>

          <h2>Engineering choices worth calling out</h2>

          <h3>Surface consistency over feature creep</h3>
          <p>
            Earlier versions of <code>@gramota/verifier</code> exposed both flat methods
            (<code>verify</code>, <code>response</code>, <code>request</code>) and namespaced
            ones. In 0.5.0 the flat methods were removed outright. <code>@gramota/issuer</code>{' '}
            still exposes both shapes (both call into the same impl) so callers can migrate at
            their pace. The principle: one canonical name per operation, deprecate or delete
            the rest, accept the breaking change cost.
          </p>

          <h3>Multi-tenant via subdomain in the SaaS</h3>
          <p>
            Each org gets <code>&lt;slug&gt;.gramota.eu</code>. The <code>slug</code> is validated
            as an <a href="https://www.rfc-editor.org/rfc/rfc1035" target="_blank" rel="noreferrer">RFC 1035</a>{' '}
            DNS label. Well-known endpoints mount at the standard{' '}
            <a href="https://www.rfc-editor.org/rfc/rfc8414" target="_blank" rel="noreferrer">RFC 8414</a> paths
            (no path prefix), so the metadata fetch URL byte-equals the <code>iss</code> claim
            &mdash; a requirement that&rsquo;s easy to violate when you &ldquo;namespace&rdquo;
            issuers behind path prefixes.
          </p>

          <h3>Tenant resolver as a Chain of Responsibility across three Strategies</h3>
          <p>
            In the identity service: <code>HostBasedTenantResolver</code> →{' '}
            <code>ClaimBasedTenantResolver</code> → <code>HeaderBasedTenantResolver</code>, run
            in priority order, first non-null wins. The host-based one peels the leftmost DNS
            label off the Host header, validates against an <code>apexDomain</code> (
            <code>gramota.eu</code>) plus a <code>reservedHosts</code> list of full hostnames (
            <code>auth.gramota.eu</code>, <code>app.gramota.eu</code>, <code>api.gramota.eu</code>,
            etc.), and looks up by <code>Tenant.Slug</code>. The combination of an apex-suffix
            check (so <code>evil.com</code> can&rsquo;t claim a tenant) and a no-multi-label check
            (so <code>evil.com.gramota.eu</code> doesn&rsquo;t get sliced into a label{' '}
            <code>evil.com</code>) prevents host-spoofing tenant hijack.
          </p>

          <h3>One consolidated EF DbContext</h3>
          <p>
            The identity service hosts ASP.NET Identity + Duende IdentityServer&rsquo;s{' '}
            <code>IConfigurationDbContext</code> + <code>IPersistedGrantDbContext</code> +
            Gramota&rsquo;s domain (Tenants, Memberships, PATs, ImpersonationLogs, LogEntries,
            Invitations) in a single <code>AppDbContext</code>. The comment justifies the
            deviation from the conventional 4-context layout (ASP.NET Identity + Duende&rsquo;s two
            contexts + your domain): atomic signup, FK enforcement across user↔membership,
            single migration history, single connection. Partial classes split the file by
            concern.
          </p>

          <h3>Two parallel auth schemes that produce the same <code>req.organization</code></h3>
          <p>
            User JWT prefix <code>eyJ*</code> (issued by <code>gramota-identity</code> for
            dashboard sessions and SDK calls) → JWT path, verified against IdentityServer JWKS
            with <code>tenant_id</code> claim resolving the org. Integrator API key prefix{' '}
            <code>gk_*</code> → API key path, SHA-256 hash lookup with{' '}
            <code>timingSafeEqual</code>. Route handlers don&rsquo;t know which scheme
            authenticated &mdash; <code>req.organization</code> is identical either way. Recently
            extended to multi-issuer JWT trust, so you can hang multiple identity servers off
            the same SaaS.
          </p>

          <h3>Two-tier test convention</h3>
          <p>
            Tier 1: ~580 mock + conformance tests, ~2 seconds, no network, gated on every push.
            Tier 2: 31 live tests under <code>packages/e2e/tests/interop/</code>, gated by{' '}
            <code>EUDI_LIVE=1</code>, run nightly and pre-release. Live tests hit{' '}
            <code>dev.{'{issuer-backend, authenticate, verifier-backend}'}.eudiw.dev</code> and{' '}
            <code>issuer.eudiw.dev</code>. The MANIFEST principle reads: &ldquo;we&rsquo;ve already
            caught the DCQL migration, the <code>dc+sd-jwt</code> format switch, and the
            PAR-required-per-client policy this way.&rdquo;
          </p>
          <p>
            One specific test is worth calling out: it issues a synthetic PID-shaped SD-JWT VC
            and submits it against the live EU verifier&rsquo;s DCQL query. The synthetic
            credential won&rsquo;t verify against an EU trust anchor &mdash; that&rsquo;s not the
            point. The point is to prove that <em>our</em> DCQL matcher accepts the same shapes
            the EU verifier accepts, independent of trust. <strong>Our query engine is
            independently verified against the EU&rsquo;s own.</strong> If a credential we
            construct passes our matcher and the EU&rsquo;s, we&rsquo;re structurally aligned.
          </p>

          <h2>What I&rsquo;d do differently</h2>

          <p>
            <strong>The OID4VCI draft churn.</strong> Building a normalizer for Drafts 13 / 14 / 15
            was the right move, but I&rsquo;d start with the canonical Draft 15 shape internally
            and treat older drafts as adapters rather than first-class branches. Same outcome,
            less branching in hot paths.
          </p>
          <p>
            <strong>Cert lifecycle.</strong> The current SaaS persists the dev cert to disk so
            wallet restart doesn&rsquo;t break trust. For production, this needs to graduate to a
            proper key vault (HSM / KMS / Vault) with rotation. The Strategy pattern is in place
            &mdash; <code>Signer</code> is pluggable &mdash; but the production-ready signer
            implementation is the next chunk of work.
          </p>
          <p>
            <strong>Observability.</strong> The DB-backed <code>ILogger</code> with bounded{' '}
            <code>Channel</code> and drainer <code>HostedService</code> works, indexes are in
            place. But for a SaaS at scale I&rsquo;d want OpenTelemetry traces flowing into
            something like Honeycomb or Tempo, not just structured logs. That&rsquo;s day-2.
          </p>
          <p>
            <strong>Single-format SDK.</strong> Today the SDK handles SD-JWT VC. ISO mdoc (mDL)
            is the other major credential format and is mandatory for some EUDIW use cases
            (mobile driving licence, anything ICAO-aligned). The <code>CredentialFormatHandler</code>{' '}
            registry is built for this &mdash; adding mdoc is a plug-in not a fork &mdash; but
            it&rsquo;s still a chunk of work and the second-best thing to do after shipping the
            production cert lifecycle.
          </p>

          <h2>What&rsquo;s live</h2>
          <ul>
            <li>
              <strong>15 npm packages</strong> published with Sigstore provenance attestations
            </li>
            <li>
              <strong>~580 mock + conformance tests + 31 live tests</strong> against EU
              reference infrastructure
            </li>
            <li>
              <strong>End-to-end roundtrip</strong> against the EU reference Android wallet,
              with our dev verifier cert added to its bundled trust list (issue → store →
              present → verify)
            </li>
            <li>
              <strong>Hosted SaaS</strong> at <code>app.gramota.eu</code>, identity at{' '}
              <code>auth.gramota.eu</code>, marketing + docs at <code>gramota.eu</code>
            </li>
            <li>
              <strong>Demo store</strong> &mdash; Solnce, fictional storefront with age,
              residency, and identity verification
            </li>
            <li>All source code on GitHub under <code>gramota-org</code>, Apache 2.0</li>
          </ul>

          <h2>What this is not</h2>
          <ul>
            <li>
              <strong>Not a wallet.</strong> Gramota is verifier-side and issuer-side. If you
              need to ship a wallet, you want the EU reference apps as a starting point, not
              this.
            </li>
            <li>
              <strong>Not a Trust Service Provider.</strong> Gramota doesn&rsquo;t notarize, doesn&rsquo;t
              run a trust anchor, doesn&rsquo;t qualify for the EU Trusted List.
            </li>
            <li>
              <strong>Not certified by any conformance scheme yet.</strong> No certification
              scheme exists yet. When one does, certifying against it is on the roadmap.
            </li>
            <li>
              <strong>Not yet running in production for a paying buyer.</strong> The SaaS
              exists, the SDK is published, the EU reference wallet roundtrip works, but the
              first paid integration is still ahead. If that&rsquo;s a dealbreaker for you, hire
              a vendor with SLA and indemnity. If you can pilot, this is the deepest
              TypeScript-native EUDIW expertise you&rsquo;ll find from one person.
            </li>
            <li>
              <strong>Not multi-format yet.</strong> SD-JWT VC today, ISO mdoc on the roadmap.
              The <code>CredentialFormatHandler</code> registry is built for this &mdash; mdoc is
              a plug-in, not a fork &mdash; but it&rsquo;s still a chunk of work.
            </li>
            <li>
              <strong>Not a one-person dependency forever.</strong> Apache 2.0, full source on
              GitHub, every architectural decision documented in MANIFEST.md and inline. If
              I&rsquo;m unavailable, your team can take over without losing a week.
            </li>
          </ul>

          <hr />

          <h2>If you&rsquo;re scoping this for 2027</h2>
          <p>
            I take on a small number of EUDIW integrations per year, typically 6&ndash;10 weeks
            each, embedded with one or two of your senior engineers so the codebase
            transfers. A typical engagement looks like:
          </p>
          <ul>
            <li>
              <strong>Weeks 1&ndash;2</strong> &mdash; audit your existing identity stack against
              EUDIW requirements, written architecture document, scope of integration work
            </li>
            <li>
              <strong>Weeks 3&ndash;5</strong> &mdash; spike one credential type end-to-end (PID
              for KYC is the most common), live against EU reference infra
            </li>
            <li>
              <strong>Weeks 6&ndash;8</strong> &mdash; production hardening: HSM/KMS-backed
              signer, observability, threat model review, runbooks
            </li>
            <li>
              <strong>Week 9+</strong> &mdash; handoff with documented playbooks; optional
              retainer for follow-up questions
            </li>
          </ul>
          <p>
            If that shape fits what you&rsquo;re scoping, here&rsquo;s how to start the
            conversation.
          </p>
        </div>

        {/* footer CTA */}
        <div className="mt-12 flex flex-col items-stretch gap-3 rounded-2xl border border-border/80 bg-surface/30 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-medium text-foreground">
              Scoping a 2027 EUDIW integration?
            </p>
            <p className="mt-1 text-sm text-dim">
              60-min technical call &mdash; no slides, no pitch. Answers your questions about
              how the integration would actually work for your stack.
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
