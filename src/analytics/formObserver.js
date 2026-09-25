// Zero-touch form instrumentation.
//
// Every marketing form is tracked through delegated listeners on `document`,
// so no form component, submit handler, validation path or reCAPTCHA flow is
// modified. The observer reads field *names* only - it never reads a value.

import { formNameForPath, isTrackedPath } from './config'
import { track } from './client'
import { safeFieldName } from './redact'

const forms = new Map()
let installed = false

const FIELD_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA'])
const IGNORED_TYPES = new Set(['hidden', 'submit', 'button', 'reset'])

function fieldName(element) {
  if (!element || !FIELD_TAGS.has(element.tagName)) return null
  if (IGNORED_TYPES.has(element.type)) return null
  const raw = element.name || element.id || element.getAttribute('aria-label') || element.getAttribute('placeholder')
  return safeFieldName(raw)
}

// Listeners are passive observers on live customer forms. They never call
// preventDefault or stopPropagation, and any error inside them is contained
// here so a tracking bug can never surface on a form a customer is filling in.
function safe(handler) {
  return (event) => {
    try {
      handler(event)
    } catch {
      // Intentionally silent.
    }
  }
}

function trackable() {
  return isTrackedPath(window.location.pathname)
}

function stateFor(form) {
  let state = forms.get(form)
  if (!state) {
    state = {
      name: formNameForPath(window.location.pathname),
      path: window.location.pathname,
      startedAt: Date.now(),
      lastField: null,
      touched: new Set(),
      started: false,
      submitted: false,
    }
    forms.set(form, state)
  }
  return state
}

function onFocusIn(event) {
  if (!trackable()) return
  const form = event.target?.form || event.target?.closest?.('form')
  if (!form) return
  const name = fieldName(event.target)
  if (!name) return

  const state = stateFor(form)
  if (!state.started) {
    state.started = true
    state.startedAt = Date.now()
    track('form_started', { form_name: state.name, path: state.path, first_field: name })
  }
  state.lastField = name
}

function onChange(event) {
  if (!trackable()) return
  const form = event.target?.form || event.target?.closest?.('form')
  if (!form) return
  const name = fieldName(event.target)
  if (!name) return
  const state = stateFor(form)
  state.touched.add(name)
  state.lastField = name
}

function onSubmit(event) {
  if (!trackable()) return
  const form = event.target
  if (!form || form.tagName !== 'FORM') return
  const state = stateFor(form)
  state.submitted = true

  track('form_submitted', {
    form_name: state.name,
    path: state.path,
    fields_completed: state.touched.size,
    seconds_spent: Math.round((Date.now() - state.startedAt) / 1000),
  })
}

/**
 * Reports every started-but-unsubmitted form, then clears tracked state.
 * Called on route change and when the tab is hidden or closed.
 */
export function flushFormAbandonment(reason, pathOverride) {
  try {
    for (const [form, state] of forms.entries()) {
      if (!state.started || state.submitted) {
        forms.delete(form)
        continue
      }

      track(
        'form_abandoned',
        {
          form_name: state.name,
          path: pathOverride || state.path,
          reason,
          last_field: state.lastField || 'none',
          fields_completed: state.touched.size,
          seconds_spent: Math.round((Date.now() - state.startedAt) / 1000),
        },
        // Sent on pagehide too, where a normal request would be cancelled.
        { beacon: true },
      )
      forms.delete(form)
    }
  } catch {
    forms.clear()
  }
}

export function installFormObserver() {
  if (installed || typeof document === 'undefined') return
  installed = true

  document.addEventListener('focusin', safe(onFocusIn), true)
  document.addEventListener('change', safe(onChange), true)
  // Capture phase, so an abandoned submit is still recorded if a handler throws.
  document.addEventListener('submit', safe(onSubmit), true)

  // `pagehide` is the reliable close/navigate signal on mobile Safari, where
  // `beforeunload` frequently does not fire.
  window.addEventListener('pagehide', () => flushFormAbandonment('left_site'))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushFormAbandonment('tab_hidden')
  })
}
