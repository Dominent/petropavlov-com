// Channel categorization for referrer hosts.
//
// Maps a `referrer_host` value to one of four traffic channels —
// `search`, `social`, `referral`, or `direct` (when the host is null).
//
// Pattern matching is substring-based and case-insensitive, which is
// good enough for the long tail of subdomains and TLDs (google.com,
// google.co.uk, google.de, etc. all match the `google.` pattern).
//
// The lists are deliberately opinionated — for a developer portfolio,
// `github.com` and `news.ycombinator.com` are SOCIAL because they're
// where peers discover and share work. Adjust to your audience if
// you fork this library.

export type Channel = 'direct' | 'search' | 'social' | 'referral'

const SEARCH_PATTERNS = [
  'google.',
  'bing.',
  'duckduckgo.',
  'yandex.',
  'baidu.',
  'ecosia.',
  'startpage.',
  'kagi.',
  'brave.com/search',
]

const SOCIAL_PATTERNS = [
  // Social networks
  'linkedin.',
  'lnkd.in',
  'twitter.com',
  'x.com',
  't.co',
  'facebook.',
  'l.facebook.com',
  'instagram.',
  'tiktok.',
  'youtube.',
  'youtu.be',
  'mastodon.',
  'bsky.app',
  'threads.net',
  'discord.',
  // Developer communities (act as social for a dev portfolio)
  'news.ycombinator.com',
  'reddit.com',
  'lobste.rs',
  'github.com',
  'gist.github.com',
  'dev.to',
  'devto',
  'producthunt.com',
  'indiehackers.com',
  'medium.com',
  'substack.com',
  'hashnode.',
  'stackoverflow.com',
]

export function categorize(host: string | null | undefined): Channel {
  if (!host) return 'direct'
  const h = host.toLowerCase()
  if (SEARCH_PATTERNS.some((p) => h.includes(p))) return 'search'
  if (SOCIAL_PATTERNS.some((p) => h.includes(p))) return 'social'
  return 'referral'
}
