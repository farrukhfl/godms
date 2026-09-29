// Analytics configuration.
// The PostHog project key is a publishable ingestion key: it is safe in the bundle.
// No read/personal key is ever referenced here.
export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''
export const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com').replace(/\/$/, '')

export const ANALYTICS_ENABLED = Boolean(POSTHOG_KEY)

// Mirrors the `steps` array in features/account-application/ApplicationFlow.jsx.
// Index here is the wizard's internal step, and step_index reported to PostHog
// is that index + 1 - which is also the `currentStep` the application API takes.
export const APPLICATION_STEPS = [
  'Services',
  'Plan',
  'Information',
  'Hardware',
  'Shipment',
  'Submit',
]

export const APPLICATION_STEP_COUNT = APPLICATION_STEPS.length

export const stepLabel = (index) => APPLICATION_STEPS[index] || `Step ${index + 1}`

// Named forms on the marketing site, resolved from the page path.
export const FORM_NAMES = {
  '/contact': 'Contact inquiry',
  '/careers': 'Career application',
  '/referral-partner': 'Referral partner',
  '/partner-program': 'Partner program',
  '/sign-in': 'Customer sign-in',
}

export const formNameForPath = (pathname) => {
  if (FORM_NAMES[pathname]) return FORM_NAMES[pathname]
  if (pathname.startsWith('/store/product/') || pathname.startsWith('/product/')) return 'Product order'
  return `Form on ${pathname}`
}

// The internal dashboard is not part of the public site and must not appear in
// its own traffic figures.
// '/insight' rather than '/insights', so mistyped attempts to reach the
// dashboard ('/insight', '/insightz') are not recorded as site pages either.
const UNTRACKED_PREFIXES = ['/insight']

export function isTrackedPath(pathname) {
  const path = String(pathname || '')
  return !UNTRACKED_PREFIXES.some((prefix) => path.startsWith(prefix))
}
