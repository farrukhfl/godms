// PostHog client wrapper.
//
// Loaded lazily so the tracker never blocks first paint, and never at all when
// the visitor has opted out. Every capture routes through sanitizeProperties,
// so no call site can bypass the redaction guards in redact.js.

import { ANALYTICS_ENABLED, POSTHOG_HOST, POSTHOG_KEY } from './config'
import { sanitizePerson, sanitizeProperties } from './redact'

let posthogPromise = null
let posthog = null
const queue = []

/**
 * Honors browser-level opt-outs. Global Privacy Control is a legally
 * recognized opt-out signal under the CCPA/CPRA regulations, so we treat it
 * as binding rather than advisory.
 */
function visitorOptedOut() {
  if (typeof navigator === 'undefined') return true
  if (navigator.globalPrivacyControl === true) return true
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true
  try {
    return window.localStorage.getItem('dms_analytics_opt_out') === '1'
  } catch {
    return false
  }
}

export function initAnalytics() {
  if (!ANALYTICS_ENABLED || typeof window === 'undefined') return null
  if (visitorOptedOut()) return null
  if (posthogPromise) return posthogPromise

  posthogPromise = import('posthog-js')
    .then(({ default: client }) => {
      client.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        // Route changes are captured explicitly in usePageTracking.
        capture_pageview: false,
        capture_pageleave: true,
        // Autocapture reads the text and attributes of clicked elements. This
        // site renders SSN, EIN and bank fields, so it stays off and every
        // event is declared explicitly instead.
        autocapture: false,
        // Session replay is disabled at the source, not merely masked. US
        // wiretapping claims (CIPA, WESCA) target replay specifically, and the
        // application flow carries GLBA-regulated data.
        disable_session_recording: true,
        // Anonymous visitors cost nothing and stay anonymous; a person profile
        // is only created once a lead identifies itself in a form.
        person_profiles: 'identified_only',
        persistence: 'localStorage+cookie',
        secure_cookie: window.location.protocol === 'https:',
        respect_dnt: true,
        mask_all_text: true,
        mask_all_element_attributes: true,
      })

      posthog = client
      while (queue.length) queue.shift()()
      return client
    })
    .catch(() => {
      // Analytics must never break the site. A failed load is simply no data.
      posthogPromise = null
      return null
    })

  return posthogPromise
}

function withClient(run) {
  if (!ANALYTICS_ENABLED) return
  if (posthog) {
    try {
      run(posthog)
    } catch {
      // Swallowed on purpose: a tracking error must not surface to a customer.
    }
    return
  }
  if (!posthogPromise) return
  queue.push(() => {
    try {
      run(posthog)
    } catch {
      // As above.
    }
  })
}

/**
 * Records an event. Properties are sanitized before they leave the browser.
 *
 * Pass `{ beacon: true }` for anything captured while the page is going away.
 * The SDK's normal transport is XHR or fetch, and the browser cancels those
 * in-flight requests when a tab closes - our `pagehide` listener runs before
 * PostHog's own, so it does not benefit from the SDK's internal beacon switch.
 * `sendBeacon` is handed to the browser and survives the page's death, which is
 * the difference between recording an abandonment and losing it.
 */
export function track(event, properties = {}, options = {}) {
  withClient((client) => {
    const captureOptions = options.beacon
      ? { transport: 'sendBeacon', send_instantly: true }
      : undefined

    client.capture(event, sanitizeProperties(properties) || {}, captureOptions)

    // Drain anything still queued while the page is alive to do it.
    if (options.beacon && typeof client.flush === 'function') {
      try {
        client.flush('sendBeacon')
      } catch {
        // Older SDKs without flush(): the capture above already used a beacon.
      }
    }
  })
}

/** Records a page view against an explicit path. */
export function trackPageView(properties = {}) {
  withClient((client) => {
    client.capture('$pageview', sanitizeProperties(properties) || {})
  })
}

let identifiedAs = null

/**
 * Attaches a lead identity so an abandoned application can be followed up.
 * Only allowlisted contact fields survive sanitizePerson.
 *
 * Safe to call repeatedly. Contact details arrive across several steps - the
 * email on Business, the owner's name two steps later - so the first call
 * identifies and later ones fill in fields that did not exist yet.
 */
export function identifyLead(details = {}) {
  const person = sanitizePerson(details)
  if (!person.email) return
  const id = person.email.toLowerCase()

  withClient((client) => {
    if (identifiedAs === id) {
      client.setPersonProperties(person)
      return
    }
    identifiedAs = id
    client.identify(id, person)
  })
}

/** Lets a visitor turn tracking off from the privacy policy page. */
export function optOut() {
  try {
    window.localStorage.setItem('dms_analytics_opt_out', '1')
  } catch {
    // Storage unavailable; fall through to the client opt-out below.
  }
  withClient((client) => client.opt_out_capturing())
}

export function hasOptedOut() {
  return visitorOptedOut()
}
