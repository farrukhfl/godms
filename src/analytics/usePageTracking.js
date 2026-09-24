import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { isTrackedPath } from './config'
import { trackPageView } from './client'
import { flushFormAbandonment } from './formObserver'

/**
 * Captures a page view on every route change. Mounted once in Layout, so no
 * page component needs to know that analytics exists.
 */
export default function usePageTracking() {
  const location = useLocation()
  const previousPath = useRef(null)

  useEffect(() => {
    const path = location.pathname
    if (!isTrackedPath(path)) return

    // Leaving a route abandons any form still open on it.
    if (previousPath.current && previousPath.current !== path) {
      flushFormAbandonment('navigated_away', previousPath.current)
    }
    previousPath.current = path

    trackPageView({
      $current_url: window.location.href,
      path,
      search: location.search || '',
      title: document.title,
      referrer: document.referrer || '',
    })
  }, [location.pathname, location.search])
}
