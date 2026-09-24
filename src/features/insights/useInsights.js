import { useCallback, useEffect, useState } from 'react'
import { InsightsError, runQuery } from './api'

/**
 * Loads one named query. Each panel owns its own request so a single failing
 * query degrades that panel instead of blanking the dashboard.
 */
export default function useInsights(name, days, { enabled = true } = {}) {
  const [state, setState] = useState({ rows: [], loading: enabled, error: '' })
  const [nonce, setNonce] = useState(0)

  const refresh = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    if (!enabled) {
      setState({ rows: [], loading: false, error: '' })
      return undefined
    }

    const controller = new AbortController()
    let active = true
    setState((current) => ({ ...current, loading: true, error: '' }))

    runQuery(name, days, controller.signal)
      .then((rows) => {
        if (active) setState({ rows, loading: false, error: '' })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') return
        const message = error instanceof InsightsError ? error.message : 'Something went wrong.'
        setState({ rows: [], loading: false, error: message })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [name, days, enabled, nonce])

  return { ...state, refresh }
}
