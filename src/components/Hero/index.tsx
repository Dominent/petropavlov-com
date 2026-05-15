'use client'

// Hero variant switcher. Reads useExperiment('hero') from the Pulse
// SDK and renders HeroA (control, default) or HeroB (test).
//
// LCP note: HeroB doesn't quite have the same shape as HeroA — by
// dropping the dense meta paragraph, the page is ~80 px shorter
// above the fold. The portrait image is the LCP element on desktop
// in BOTH variants, so the experiment shouldn't materially shift
// LCP measurements. Mobile users get LCP from one of the text lines;
// HeroB lands LCP slightly faster (less text to paint).
//
// Variant assignment is sticky per visitor — the same person always
// sees the same hero across reloads. Returns null until the active
// experiments fetch resolves, at which point the consumer renders
// the control branch (HeroA) by default, then re-renders with the
// assigned variant on the next React cycle. The flicker is well
// under 100 ms (assignment-fetch latency on a warm Pulse init) and
// invisible if the visitor's bucket is 'a'.

import { useExperiment } from '../../pulse/client/experiments'
import { HeroA } from './HeroA'
import { HeroB } from './HeroB'

export function Hero() {
  const variant = useExperiment('hero')
  if (variant === 'b') return <HeroB />
  return <HeroA />
}
