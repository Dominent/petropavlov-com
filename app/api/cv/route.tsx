// CV PDF generation — GET /api/cv (served at /cv via vercel.json rewrite).
//
// Renders a 1–2 page A4 CV from the same data the portfolio uses
// (src/data/work.ts), so the moment you update a job's metrics or add
// a project, the next /cv download reflects it. No separate CV file
// to maintain.
//
// Serves a real PDF binary (Content-Type: application/pdf +
// Content-Disposition: attachment) so a single click downloads it.

import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer'
import { projects, jobs, skills } from '../../../src/data/work'

// Node runtime — @react-pdf needs Node APIs (Buffer, streams). Without
// this, Next.js would default to Edge for routes that look pure.
export const runtime = 'nodejs'

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────

const palette = {
  text: '#111827',
  muted: '#4b5563',
  dim: '#6b7280',
  rule: '#e5e7eb',
  accent: '#b45309', // amber-700 — prints well on b/w too
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 42,
    paddingRight: 42,
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: palette.text,
    lineHeight: 1.45,
  },

  // Header
  header: { marginBottom: 14 },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.2,
    color: palette.text,
    marginBottom: 12,
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: palette.muted,
  },
  contactLine: {
    marginTop: 6,
    fontSize: 9,
    color: palette.dim,
    lineHeight: 1.5,
  },
  contactLink: { color: palette.accent, textDecoration: 'none' },

  // Sections
  section: { marginTop: 14 },
  h2: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: palette.text,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingBottom: 3,
    marginBottom: 6,
    borderBottom: `0.5pt solid ${palette.rule}`,
  },

  paragraph: { fontSize: 9.5, color: palette.text, lineHeight: 1.5 },

  // Job entries
  jobRow: { marginBottom: 9 },
  jobHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  jobCompany: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  jobRole: { color: palette.muted, fontSize: 9 },
  jobBadge: {
    fontSize: 8,
    color: palette.accent,
    fontFamily: 'Helvetica-Oblique',
  },
  jobContext: { color: palette.dim, fontSize: 9, marginTop: 2 },
  bulletList: { marginTop: 3, paddingLeft: 0 },
  bullet: { flexDirection: 'row', marginBottom: 2 },
  bulletMark: { width: 10, color: palette.accent },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.45 },
  techRow: {
    marginTop: 3,
    fontSize: 8.5,
    color: palette.dim,
    fontFamily: 'Helvetica-Oblique',
  },

  // Projects
  project: { marginBottom: 8 },
  projectHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  projectTitle: { fontFamily: 'Helvetica-Bold', fontSize: 10 },
  projectTagline: { color: palette.muted, fontSize: 9, marginLeft: 6 },
  projectDesc: { fontSize: 9, color: palette.text, lineHeight: 1.45 },
  projectMeta: {
    fontSize: 8.5,
    color: palette.dim,
    fontFamily: 'Helvetica-Oblique',
    marginTop: 2,
  },

  // Skills
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillCategory: {
    width: 100,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: palette.text,
  },
  skillList: { flex: 1, fontSize: 9, color: palette.muted },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 42,
    right: 42,
    fontSize: 7.5,
    color: palette.dim,
    textAlign: 'center',
    fontFamily: 'Helvetica-Oblique',
  },
})

// ─────────────────────────────────────────────────────────────────────
// CV-specific copy (kept apart from portfolio marketing voice)
// ─────────────────────────────────────────────────────────────────────

const SUMMARY =
  '10+ years shipping production software — currently focused on AI products end-to-end. ' +
  'Most recently on CData Virtuality\'s AI research team, where I solo-built a Cursor-style ' +
  'SQL AI copilot inside the platform (Q3 2025 release, demoed at Gartner D&A Summit 2025). ' +
  'Previously at VMware, TestGorilla, Walltopia, and Octopus Energy Germany. Comfortable from ' +
  'prompt design through production billing, identity, and integrations. Available for ' +
  'consulting and project work — clients across Europe, Israel (Tel Aviv), US (NYC · SF · ' +
  'Boston), and Canada (Toronto · Montreal · Vancouver). Tel Aviv shares my timezone; ' +
  'afternoons overlap with North-American East-Coast mornings; late-day sync for Pacific ' +
  'time. Invoiced in USD, CAD, or EUR via Stripe and Wise.'

const SKILL_KEYS_FOR_CV: (keyof typeof skills)[] = [
  'Frontend',
  'Backend',
  'AI / ML',
  'Identity & Payments',
  'Cloud',
  'Mobile',
  'Browser Extensions',
  'Data',
]

// ─────────────────────────────────────────────────────────────────────
// React components
// ─────────────────────────────────────────────────────────────────────

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.name}>Petromil "Petro" Pavlov</Text>
    <Text style={styles.title}>Senior Full-Stack & AI Engineer</Text>
    <Text style={styles.contactLine}>
      {'Sofia, Bulgaria  ·  '}
      <Link src="mailto:petromilpavlov@gmail.com" style={styles.contactLink}>
        petromilpavlov@gmail.com
      </Link>
      {'  ·  '}
      <Link
        src="https://petropavlov.dev?utm_source=cv&utm_medium=pdf"
        style={styles.contactLink}
      >
        petropavlov.dev
      </Link>
      {'  ·  '}
      <Link src="https://github.com/Dominent" style={styles.contactLink}>
        github.com/Dominent
      </Link>
      {'  ·  '}
      <Link
        src="https://www.linkedin.com/in/petro-p-insight-draft/"
        style={styles.contactLink}
      >
        LinkedIn
      </Link>
    </Text>
  </View>
)

const Summary = () => (
  <View style={styles.section}>
    <Text style={styles.h2}>Summary</Text>
    <Text style={styles.paragraph}>{SUMMARY}</Text>
  </View>
)

const JobEntry = ({ job }: { job: (typeof jobs)[number] }) => (
  <View style={styles.jobRow} wrap={false}>
    <View style={styles.jobHead}>
      <Text>
        <Text style={styles.jobCompany}>{job.company}</Text>
        <Text style={styles.jobRole}> · {job.role}</Text>
      </Text>
      {job.badge ? <Text style={styles.jobBadge}>{job.badge}</Text> : null}
    </View>
    <Text style={styles.jobContext}>{job.context}</Text>
    <View style={styles.bulletList}>
      {job.bullets.map((b, i) => (
        <View key={i} style={styles.bullet}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
    </View>
    <Text style={styles.techRow}>Stack: {job.tech.join(' · ')}</Text>
  </View>
)

const Experience = () => (
  <View style={styles.section}>
    <Text style={styles.h2}>Experience</Text>
    {jobs.map((job) => (
      <JobEntry key={job.id} job={job} />
    ))}
  </View>
)

const ProjectEntry = ({
  project,
}: {
  project: (typeof projects)[number]
}) => (
  <View style={styles.project} wrap={false}>
    <View style={styles.projectHead}>
      <Text style={styles.projectTitle}>{project.title}</Text>
      <Text style={styles.projectTagline}>· {project.tagline}</Text>
    </View>
    <Text style={styles.projectDesc}>
      {trimToSentences(project.description, 2)}
    </Text>
    <Text style={styles.projectMeta}>
      Stack: {project.tech.slice(0, 8).join(' · ')}
      {project.links && project.links.length > 0
        ? `  ·  ${project.links.map((l) => l.label).join(' · ')}`
        : ''}
    </Text>
  </View>
)

const ProjectsSection = () => (
  <View style={styles.section}>
    <Text style={styles.h2}>Selected Projects</Text>
    {projects.map((p) => (
      <ProjectEntry key={p.id} project={p} />
    ))}
  </View>
)

const Skills = () => (
  <View style={styles.section}>
    <Text style={styles.h2}>Skills</Text>
    {SKILL_KEYS_FOR_CV.filter((k) => skills[k] && skills[k].length > 0).map((key) => (
      <View key={key} style={styles.skillRow}>
        <Text style={styles.skillCategory}>{key}</Text>
        <Text style={styles.skillList}>{skills[key].join(', ')}</Text>
      </View>
    ))}
  </View>
)

const EducationAndCerts = () => (
  <View style={styles.section}>
    <Text style={styles.h2}>Education & Certifications</Text>
    {skills.Education?.map((e, i) => (
      <Text key={`ed-${i}`} style={styles.paragraph}>
        • {e}
      </Text>
    ))}
    {skills.Certifications?.map((c, i) => (
      <Text key={`cert-${i}`} style={styles.paragraph}>
        • {c}
      </Text>
    ))}
  </View>
)

const Footer = () => (
  <Text
    style={styles.footer}
    fixed
    render={({ pageNumber, totalPages }) =>
      `Petromil Pavlov · petropavlov.dev · Page ${pageNumber} of ${totalPages}`
    }
  />
)

const CV = () => (
  <Document
    title="Petro Pavlov — CV"
    author="Petromil Pavlov"
    subject="Senior Full-Stack & AI Engineer · CV"
    keywords="full-stack, AI engineer, RAG, LLM, Angular, .NET, TypeScript, Sofia, Bulgaria"
  >
    <Page size="A4" style={styles.page}>
      <Header />
      <Summary />
      <Experience />
      <ProjectsSection />
      <Skills />
      <EducationAndCerts />
      <Footer />
    </Page>
  </Document>
)

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function trimToSentences(text: string, n: number): string {
  const parts = text.split(/(?<=\.)\s+/)
  if (parts.length <= n) return text
  return parts.slice(0, n).join(' ').trim()
}

// ─────────────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  try {
    // renderToBuffer() gives us a Node Buffer we can return as the
    // response body — simpler than wiring renderToStream() through
    // Web Streams in App Router. The CV PDF is small (~20-40 KB) so
    // buffering is fine.
    const buffer = await renderToBuffer(<CV />)
    // Convert to Uint8Array for the Response constructor.
    const bytes = new Uint8Array(buffer)

    return new Response(bytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="petro-pavlov-cv.pdf"',
        // Cache briefly on the edge — the CV doesn't change between every
        // deploy, and the function takes a few hundred ms to render.
        'Cache-Control': 'public, max-age=300, s-maxage=600',
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[cv] render failed:', msg)
    return Response.json(
      { error: 'cv_render_failed', message: msg },
      { status: 500 },
    )
  }
}

// HEAD support — same headers, no body. Useful for "is /cv up?" probes.
export async function HEAD(): Promise<Response> {
  return new Response(null, {
    headers: { 'Content-Type': 'application/pdf' },
  })
}
