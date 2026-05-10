import { getCalApi } from '@calcom/embed-react'

/**
 * Initialize the Cal.com embed once at app boot. Buttons that open the
 * popup use the `data-cal-link="petropavlov/intro"` attribute — this
 * call configures the theme and layout for all of them.
 *
 * Calling getCalApi() is idempotent, so re-mounts during HMR are safe.
 */
export async function initCal() {
  const cal = await getCalApi()
  cal('ui', {
    theme: 'dark',
    cssVarsPerTheme: {
      dark: {
        'cal-brand': '#fbbf24', // amber-400 — matches portfolio accent
      },
    },
    hideEventTypeDetails: false,
    layout: 'month_view',
  })
}
