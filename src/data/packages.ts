// Productized engagement packages — three fixed-scope lanes shown in
// the "Work with me" section. Prices are calibrated to senior
// full-stack + AI freelance market rates (fixed-price tiers sit above
// the hourly-math because they absorb scope risk). "from $X" framing
// keeps room to quote up for heavier production builds.
//
// `featured` marks the anchor tier (the one most buyers should pick).
// `contact` marks the top tier as a "let's talk" lane — the monthly
// scope varies too much to pin a single number, so we anchor with a
// floor and route to a call.

export type Package = {
  id: 'sprint' | 'build' | 'partner'
  name: string
  price: string
  priceNote: string
  timeline: string
  tagline: string
  idealFor: string
  includes: string[]
  /** CTA button label. All CTAs open the Cal.com intro booking. */
  cta: string
  /** Anchor tier — rendered with accent border + "Most popular" badge. */
  featured?: boolean
  /** Top tier — "contact us" styling, anchored by a floor price. */
  contact?: boolean
}

export const packages: Package[] = [
  {
    id: 'sprint',
    name: 'Sprint',
    price: 'from $3.5k',
    priceNote: 'fixed price',
    timeline: '~1 week',
    tagline: 'One focused thing, shipped to production in a week.',
    idealFor: 'Small teams & quick validation',
    includes: [
      'A single AI feature, working prototype, or polished marketing site',
      'Scoped on a kickoff call, then shipped — not a slide deck',
      'Daily async updates, one revision round',
      'Clean handoff: code, docs, and a live deploy',
    ],
    cta: 'Start a Sprint',
  },
  {
    id: 'build',
    name: 'Build',
    price: 'from $9k',
    priceNote: 'fixed price',
    timeline: '2–4 weeks',
    tagline: 'A production-ready feature or MVP your users can actually use.',
    idealFor: 'Funded startups shipping their first version',
    includes: [
      'Production RAG assistant, internal AI tool, or app MVP',
      'Real auth, integrations, and tests — built to ship, not to demo',
      'Fixed scope agreed up front, weekly checkpoints',
      'Deploy + two weeks of post-launch support',
    ],
    cta: 'Book a call',
    featured: true,
  },
  {
    id: 'partner',
    name: 'Partner',
    price: 'from $6k',
    priceNote: 'per month',
    timeline: 'Monthly',
    tagline: 'A senior engineer embedded on your roadmap, month to month.',
    idealFor: 'Teams shipping continuously',
    includes: [
      'Senior IC embedded with your team, async-first',
      'Design → ship on your priorities, weekly written updates',
      'Flexible scope month to month, NDAs welcome',
      'Pause or stop anytime — no long lock-in',
    ],
    cta: "Let's talk",
    contact: true,
  },
]
