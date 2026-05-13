// Minimal user-agent parser.
//
// We bucket the UA into three coarse dimensions: device class, browser
// family, OS family. We deliberately don't track full version strings —
// they're noisy, change every week, and don't help answer the questions
// a dashboard answers ("are mobile users converting? does Safari render
// correctly?").
//
// Pattern order matters: more specific patterns must come first
// (Edge before Chrome, since Edge UAs contain "Chrome").

export type Device = 'mobile' | 'tablet' | 'desktop'
export type Browser = 'chrome' | 'safari' | 'firefox' | 'edge' | 'opera' | 'other'
export type OS = 'windows' | 'mac' | 'ios' | 'android' | 'linux' | 'other'

export function parseDevice(ua: string): Device {
  // iPad has its own marker. Generic "Android" without "Mobile" usually
  // means tablet. Modern iPadOS reports as Mac with touch points, which
  // we can't detect server-side — those land in 'desktop'.
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) return 'tablet'
  if (/Mobi|iPhone|iPod|Android.*Mobile|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

export function parseBrowser(ua: string): Browser {
  if (/Edg\//i.test(ua)) return 'edge'
  if (/OPR\/|Opera/i.test(ua)) return 'opera'
  if (/Firefox/i.test(ua)) return 'firefox'
  if (/Chrome\/|CriOS/i.test(ua)) return 'chrome'
  if (/Safari/i.test(ua)) return 'safari'
  return 'other'
}

export function parseOS(ua: string): OS {
  if (/iPhone|iPad|iPod|iOS/i.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'mac'
  if (/Windows/i.test(ua)) return 'windows'
  if (/Linux|X11/i.test(ua)) return 'linux'
  return 'other'
}

export function parseUA(ua: string | null | undefined): {
  device: Device
  browser: Browser
  os: OS
} {
  const s = ua || ''
  return {
    device: parseDevice(s),
    browser: parseBrowser(s),
    os: parseOS(s),
  }
}
