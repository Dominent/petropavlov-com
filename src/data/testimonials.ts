export type TestimonialSource = 'linkedin' | 'email' | 'other'

export type Testimonial = {
  id: string
  quote: string
  name: string
  title: string
  context?: string // e.g., "Managed Petro directly at TestGorilla"
  date?: string // e.g., "Jan 2025"
  source?: TestimonialSource
}

// Order: most-impactful signal first (a direct manager beats a peer for
// most readers), then mix of recency + complementary substance.
export const testimonials: Testimonial[] = [
  {
    id: 'facundo-calvento',
    quote:
      'I had the pleasure of working with Petromil for a year at TestGorilla, and I can say he is a talented and humble frontend developer. His skills in Angular and micro-frontend architecture are very good. He is a person you want on your team when you have complex projects and need someone who understands everything quickly.\n\nBut what makes Petromil special is his personality. He is not only great at writing code; he also brings humor and kindness to the team, making every day better. He is the type of person who can make a joke in a hard meeting, and suddenly everything feels less heavy, while still keeping everyone focused on the objective.\n\nPetromil is passionate about continuously learning and evolving with agile methodologies and knows how to use them in real life. He is always looking for things that can help the team perform better — removing problems, sharing ideas, or just being there to support.\n\nIf you need someone excellent at what they do, who cares about the team, and who knows how to keep the work fun and productive, Petromil is your person. I recommend him a lot!',
    name: 'Facundo Calvento',
    title: 'Engineering and Delivery Leader',
    context: 'Managed Petromil directly at TestGorilla',
    date: 'Jan 2025',
    source: 'linkedin',
  },
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
  {
    id: 'andres-milla',
    quote:
      'Petro has been an exceptional team member and a true asset to our team. His ability to consistently deliver high-quality features, even when facing challenges, is a testament to his dedication and professionalism. Petro\'s resilience and determination have been key in driving project success and overcoming obstacles along the way. Working alongside him has been a privilege, and I am confident he will continue to excel in any endeavor he undertakes.',
    name: 'Andrés Milla',
    title: 'Senior Software Engineer',
    context: 'Worked with Petromil on the same team at TestGorilla',
    date: 'Jan 2025',
    source: 'linkedin',
  },
]
