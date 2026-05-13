// Auto-detect clicks on outbound links and fire an `outbound` event
// with the target hostname.
//
// Uses event delegation on document so it works for dynamically-added
// links without re-registering. mousedown is the trigger (not click) —
// it gives us a few extra milliseconds before the browser navigates
// away, which improves delivery reliability when combined with
// sendBeacon's "survives page unload" guarantee.

import type { PulseConfig } from './types'
import { send } from './send'

let installed = false
let internalCfg: { endpoint: string; debug: boolean; internalHosts: Set<string> } | null = null

export function initOutbound(
  config: Required<Pick<PulseConfig, 'endpoint'>> & PulseConfig,
): void {
  if (installed) return
  installed = true

  const hosts = config.internalHosts || [window.location.hostname]
  internalCfg = {
    endpoint: config.endpoint,
    debug: !!config.debug,
    internalHosts: new Set(hosts),
  }

  // Use capture phase so we run before any other handlers might
  // intercept the event.
  document.addEventListener('mousedown', onMouseDown, { capture: true })

  // Touch devices skip mousedown for some gestures — also listen on
  // auxclick (middle-click for new tab).
  document.addEventListener('auxclick', onMouseDown, { capture: true })
}

function onMouseDown(e: MouseEvent) {
  if (!internalCfg) return

  // Walk up the DOM to find the nearest <a> ancestor — a click on an
  // <img> inside a link should still count as a link click.
  let el = e.target as HTMLElement | null
  while (el && el.tagName !== 'A') el = el.parentElement
  if (!el) return

  const href = (el as HTMLAnchorElement).href
  if (!href) return

  let url: URL
  try {
    url = new URL(href, window.location.origin)
  } catch {
    return // Malformed href
  }

  // Same-protocol external links only — skip mailto:, tel:, javascript:
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    // We DO want to record mailto + tel as outbound — they're meaningful
    // signals on a portfolio site. Strip the protocol prefix for cleanliness.
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
      send(
        internalCfg.endpoint,
        {
          event: 'outbound',
          page: window.location.pathname,
          props: { host: url.protocol.slice(0, -1), target: url.href },
        },
        internalCfg.debug,
      )
    }
    return
  }

  if (internalCfg.internalHosts.has(url.hostname)) return

  send(
    internalCfg.endpoint,
    {
      event: 'outbound',
      page: window.location.pathname,
      props: { host: url.hostname },
    },
    internalCfg.debug,
  )
}
