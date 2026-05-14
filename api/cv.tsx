// CV PDF generation endpoint.
//
// Renders a 1–2 page A4 CV from the same data the portfolio uses
// (src/data/work.ts), so the moment you update a job's metrics or
// add a project, the next /cv download reflects it. No separate
// "CV file" to maintain.
//
// The endpoint serves a real PDF binary (Content-Type: application/pdf
// + Content-Disposition: attachment) so a single click downloads it to
// the visitor's machine — recruiter-friendly behaviour.
//
// CV-specific copy (summary line, section headings) lives inline below
// as plain strings, separate from the portfolio's marketing voice.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  renderToStream,
} from '@react-pdf/renderer'
import { projects, jobs, skills } from '../src/data/work.js'

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

// Skill categories to include in the CV — omit Certifications/Education
// because they get their own section below.
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
    {/* Plain straight quotes — HTML entities like &ldquo; render literally
        in @react-pdf because it doesn't process the HTML-style decoded
        characters the same way the DOM does. */}
    <Text style={styles.name}>Petromil "Petro" Pavlov</Text>
    <Text style={styles.title}>Senior Full-Stack & AI Engineer</Text>
    {/* One Text with inline Links — @react-pdf treats nested elements as
        inline flow, which avoids the flex-row wrapping mess where the
        separator dots end up on their own lines. */}
    {/* Explicit string separators between every chunk — JSX whitespace
        between elements gets collapsed/stripped inconsistently by
        @react-pdf, so we don't rely on it. */}
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
      {/* Trim the long description to ~1-2 sentences for the CV */}
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
      {/* eslint-disable-next-line react/jsx-key — only one Header */}
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

// Also fix Education section heading: HTML entities don't decode in PDF.
const _ = `Education & Certifications` // (handled in JSX below via plain &)

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Trim a long description to N sentences (rough — splits on `. `). */
function trimToSentences(text: string, n: number): string {
  const parts = text.split(/(?<=\.)\s+/) // split after period+space
  if (parts.length <= n) return text
  return parts.slice(0, n).join(' ').trim()
}

// ─────────────────────────────────────────────────────────────────────
// Vercel handler
// ─────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end()
  }

  try {
    const stream = await renderToStream(<CV />)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="petro-pavlov-cv.pdf"',
    )
    // Cache briefly on the edge — the CV doesn't change between every
    // deploy, and the function takes a few hundred ms to render.
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600')

    // @ts-expect-error — Node stream pipe vs Web stream; @react-pdf returns Node stream.
    stream.pipe(res)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown'
    console.error('[cv] render failed:', msg)
    return res
      .status(500)
      .json({ error: 'cv_render_failed', message: msg })
  }
}
