import { useEffect, useRef } from 'react'
import { APPLICATION_STEP_COUNT, stepLabel } from './config'
import { identifyLead, track } from './client'
import { wasApplicationSubmitted } from './applicationState'

// Below this, an unmount is a dev-mode remount or an instant bounce, not a
// person deciding to leave. React StrictMode double-mounts effects in dev.
const MIN_ABANDON_SECONDS = 2

/**
 * Records progress through the merchant application.
 *
 * Purely observational: it reads state the flow already keeps and never calls
 * back into it, so no validation, save or submit path is affected. Deleting
 * this hook leaves the application behaving identically.
 */
export default function useApplicationTracking({ step, values, errors, applicationIds }) {
  const enteredAt = useRef(Date.now())
  const mountedAt = useRef(Date.now())
  const furthestStep = useRef(0)
  const previousStep = useRef(null)
  const started = useRef(false)
  const abandonSent = useRef(false)
  const identified = useRef('')
  const lastErrorSignature = useRef('')

  // Mirror of the latest state, so the unload handler can report current
  // position without re-registering its listeners on every keystroke.
  const snapshot = useRef({ step: 0, applicationIds: [] })
  snapshot.current = { step, applicationIds: applicationIds || [] }

  // Step entry, exit and direction.
  useEffect(() => {
    if (!started.current) {
      started.current = true
      track('application_started', { step_name: stepLabel(step), step_index: step + 1 })
    }

    const previous = previousStep.current
    if (previous !== null && previous !== step) {
      track(step > previous ? 'application_step_completed' : 'application_step_back', {
        step_name: stepLabel(previous),
        step_index: previous + 1,
        seconds_spent: Math.round((Date.now() - enteredAt.current) / 1000),
      })
    }

    previousStep.current = step
    enteredAt.current = Date.now()
    furthestStep.current = Math.max(furthestStep.current, step)

    track('application_step_viewed', {
      step_name: stepLabel(step),
      step_index: step + 1,
      total_steps: APPLICATION_STEP_COUNT,
    })
  }, [step])

  // Validation failures explain *why* a step leaks. Reported once per distinct
  // set of failing fields, not on every keystroke that clears one of them.
  useEffect(() => {
    const failed = Object.entries(errors || {})
      .filter(([, message]) => Boolean(message))
      .map(([field]) => field)
      .sort()

    const signature = `${step}:${failed.join(',')}`
    if (!failed.length || signature === lastErrorSignature.current) return
    lastErrorSignature.current = signature

    track('application_step_error', {
      step_name: stepLabel(step),
      step_index: step + 1,
      error_count: failed.length,
      fields: failed,
    })
  }, [errors, step])

  // Attach contact details so an abandoned application can be followed up.
  //
  // These arrive as the Information step is filled in, business details first
  // and the owner's further down. Identifying only once would permanently miss
  // whatever had not been typed yet, so this re-sends whenever they change -
  // compared by value, not by object identity, since `values` is replaced on
  // every keystroke. Only allowlisted fields survive sanitizePerson.
  useEffect(() => {
    if (!values) return
    const email = String(values.email || values.ownerEmail || '').trim()
    if (!email.includes('@')) return

    const lead = {
      email,
      phone: values.contactNumber || values.dbaPhoneNumber || values.ownerPhoneNumber || '',
      businessName: values.businessName || values.legalName || '',
      name: [values.ownerFirstName, values.ownerLastName].filter(Boolean).join(' '),
    }

    const signature = JSON.stringify(lead)
    if (signature === identified.current) return
    identified.current = signature

    identifyLead(lead)
  }, [values])

  // Abandonment. Terminal signals only: closing or navigating away from the
  // site, and leaving the page inside the app. Backgrounding a tab is not
  // abandonment, and treating it as such would suppress the real outcome.
  useEffect(() => {
    const report = (reason) => {
      if (abandonSent.current || wasApplicationSubmitted()) return
      if (Date.now() - mountedAt.current < MIN_ABANDON_SECONDS * 1000) return
      abandonSent.current = true

      track('application_abandoned', {
        reason,
        step_name: stepLabel(snapshot.current.step),
        step_index: snapshot.current.step + 1,
        furthest_step_name: stepLabel(furthestStep.current),
        furthest_step_index: furthestStep.current + 1,
        seconds_on_step: Math.round((Date.now() - enteredAt.current) / 1000),
        seconds_in_application: Math.round((Date.now() - mountedAt.current) / 1000),
        has_saved_application: (snapshot.current.applicationIds || []).length > 0,
      })
    }

    // `pagehide` is the dependable close/navigate signal; `beforeunload`
    // frequently does not fire on mobile Safari.
    const onPageHide = () => report('left_site')
    window.addEventListener('pagehide', onPageHide)

    return () => {
      window.removeEventListener('pagehide', onPageHide)
      report('left_page')
    }
  }, [])
}
