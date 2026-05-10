export type TestimonialSource = 'linkedin' | 'email' | 'other'

export type Testimonial = {
  id: string
  quote: string
  name: string
  title: string
  context?: string // e.g., "Worked with Petro on the same team"
  date?: string // e.g., "Feb 2026"
  source?: TestimonialSource
}

export const testimonials: Testimonial[] = [
  {
    id: 'francesco-lisandro',
    quote:
      'Petro is an exceptionally sharp and thoughtful professional. His ability to break down complex problems and get to the real root cause is genuinely impressive, and it proved critical at several key moments across the projects we worked on together. What really sets him apart is that he pairs this analytical strength with strong execution — he doesn’t just spot the right answer, he turns it into real progress. That combination makes him a rare, high-impact teammate, and someone I’d gladly work with again.',
    name: 'Francesco Lisandro',
    title: 'AI Founder · Software Engineer',
    context: 'Worked with Petro on the same team',
    date: 'Feb 2026',
    source: 'linkedin',
  },
]
