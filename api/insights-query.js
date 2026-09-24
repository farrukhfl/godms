// Read-only analytics proxy.
//
// The dashboard cannot reach PostHog directly: personal API keys are not
// CORS-enabled for browsers, and shipping one in the bundle would publish it.
// This function holds the key server-side and exposes only the fixed queries
// defined below.
//
// Deliberate properties:
//   - It accepts a query *name*, never SQL from the caller, so no query can be
//     crafted from the browser.
//   - It holds no DRMS or merchant credential of any kind. A stolen dashboard
//     password reaches read-only analytics and nothing else. No customer
//     record can be read, changed or deleted through this endpoint.
//   - It is POST-only and returns rows. It never writes.

const POSTHOG_HOST = (process.env.POSTHOG_API_HOST || 'https://us.posthog.com').replace(/\/$/, '')
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const READ_KEY = process.env.POSTHOG_READ_KEY
const PASSWORD = process.env.INSIGHTS_PASSWORD

const since = (days) => `timestamp > now() - INTERVAL ${days} DAY`

const QUERIES = {
  overview: (d) => `
    SELECT
      countIf(event = '$pageview') AS pageviews,
      uniq(distinct_id) AS visitors,
      uniq(properties.$session_id) AS sessions,
      countIf(event = 'form_started') AS form_starts,
      countIf(event = 'form_submitted') AS form_submits,
      countIf(event = 'form_abandoned') AS form_abandons,
      countIf(event = 'application_started') AS app_starts,
      countIf(event = 'application_submitted') AS app_submits,
      countIf(event = 'application_abandoned') AS app_abandons
    FROM events WHERE ${since(d)}`,

  daily_trend: (d) => `
    SELECT toDate(timestamp) AS day,
      countIf(event = '$pageview') AS pageviews,
      uniq(distinct_id) AS visitors,
      countIf(event = 'application_started') AS app_starts,
      countIf(event = 'application_submitted') AS app_submits
    FROM events WHERE ${since(d)}
    GROUP BY day ORDER BY day`,

  top_pages: (d) => `
    SELECT properties.$pathname AS path,
      count() AS views,
      uniq(distinct_id) AS visitors
    FROM events WHERE event = '$pageview' AND ${since(d)}
    GROUP BY path ORDER BY views DESC LIMIT 25`,

  // PostHog records direct traffic as the literal string '$direct', so it is
  // relabelled here rather than leaking an internal token into the dashboard.
  traffic_sources: (d) => `
    SELECT
      multiIf(
        properties.$referring_domain IN ('$direct', '', NULL), 'Direct',
        properties.$referring_domain
      ) AS source,
      uniq(distinct_id) AS visitors,
      count() AS events
    FROM events WHERE event = '$pageview' AND ${since(d)}
    GROUP BY source ORDER BY visitors DESC LIMIT 20`,

  campaigns: (d) => `
    SELECT
      coalesce(nullIf(properties.utm_source, ''), 'none') AS utm_source,
      coalesce(nullIf(properties.utm_campaign, ''), 'none') AS utm_campaign,
      uniq(distinct_id) AS visitors
    FROM events WHERE event = '$pageview' AND ${since(d)}
    GROUP BY utm_source, utm_campaign
    HAVING utm_source != 'none' ORDER BY visitors DESC LIMIT 20`,

  devices: (d) => `
    SELECT coalesce(nullIf(properties.$device_type, ''), 'Unknown') AS device,
      uniq(distinct_id) AS visitors
    FROM events WHERE event = '$pageview' AND ${since(d)}
    GROUP BY device ORDER BY visitors DESC`,

  countries: (d) => `
    SELECT coalesce(nullIf(properties.$geoip_country_name, ''), 'Unknown') AS country,
      uniq(distinct_id) AS visitors
    FROM events WHERE event = '$pageview' AND ${since(d)}
    GROUP BY country ORDER BY visitors DESC LIMIT 15`,

  // One row per application step: how many reached it, how many moved on.
  application_funnel: (d) => `
    SELECT
      toInt(properties.step_index) AS step_index,
      any(properties.step_name) AS step_name,
      uniqIf(distinct_id, event = 'application_step_viewed') AS reached,
      uniqIf(distinct_id, event = 'application_step_completed') AS completed
    FROM events
    WHERE event IN ('application_step_viewed', 'application_step_completed')
      AND ${since(d)}
    GROUP BY step_index ORDER BY step_index`,

  // Where people give up, by the furthest step they reached before leaving.
  application_dropoff: (d) => `
    SELECT
      toInt(properties.furthest_step_index) AS step_index,
      any(properties.furthest_step_name) AS step_name,
      count() AS abandons,
      round(avg(toFloat(properties.seconds_in_application))) AS avg_seconds
    FROM events WHERE event = 'application_abandoned' AND ${since(d)}
    GROUP BY step_index ORDER BY abandons DESC`,

  // Validation errors are the usual reason a step leaks.
  application_errors: (d) => `
    SELECT
      any(properties.step_name) AS step_name,
      toInt(properties.step_index) AS step_index,
      count() AS error_events,
      uniq(distinct_id) AS people
    FROM events WHERE event = 'application_step_error' AND ${since(d)}
    GROUP BY step_index ORDER BY error_events DESC`,

  // Identified drop-offs for follow-up. Anyone who later submitted is excluded.
  abandoned_leads: (d) => `
    SELECT
      person.properties.email AS email,
      person.properties.name AS name,
      person.properties.phone AS phone,
      person.properties.businessName AS business,
      max(toInt(properties.furthest_step_index)) AS furthest_step,
      any(properties.furthest_step_name) AS furthest_step_name,
      max(timestamp) AS last_seen
    FROM events
    WHERE event = 'application_abandoned' AND ${since(d)}
      AND person.properties.email != ''
      AND person.properties.email NOT IN (
        SELECT person.properties.email FROM events
        WHERE event = 'application_submitted' AND ${since(d)}
      )
    GROUP BY email, name, phone, business
    ORDER BY last_seen DESC LIMIT 100`,

  form_performance: (d) => `
    SELECT properties.form_name AS form_name,
      countIf(event = 'form_started') AS started,
      countIf(event = 'form_submitted') AS submitted,
      countIf(event = 'form_abandoned') AS abandoned
    FROM events
    WHERE event IN ('form_started', 'form_submitted', 'form_abandoned') AND ${since(d)}
    GROUP BY form_name ORDER BY started DESC`,

  form_dropoff_fields: (d) => `
    SELECT properties.form_name AS form_name,
      properties.last_field AS last_field,
      count() AS abandons
    FROM events WHERE event = 'form_abandoned' AND ${since(d)}
    GROUP BY form_name, last_field ORDER BY abandons DESC LIMIT 25`,
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!PASSWORD || !READ_KEY || !PROJECT_ID) {
    return res.status(503).json({ error: 'Dashboard is not configured on this deployment.' })
  }

  const supplied = req.headers['x-dashboard-password']
  if (typeof supplied !== 'string' || supplied !== PASSWORD) {
    return res.status(401).json({ error: 'Invalid dashboard password.' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})
  const build = QUERIES[body.query]
  if (!build) {
    return res.status(400).json({ error: 'Unknown query.' })
  }

  // Bounded and coerced, so the only value reaching the query string is an integer.
  const days = Math.min(Math.max(parseInt(body.days, 10) || 30, 1), 365)

  try {
    const response = await fetch(`${POSTHOG_HOST}/api/projects/${PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${READ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: { kind: 'HogQLQuery', query: build(days) } }),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.detail || data?.error || `PostHog returned ${response.status}.`,
      })
    }

    return res.status(200).json({
      columns: data.columns || [],
      results: data.results || [],
    })
  } catch {
    return res.status(502).json({ error: 'Could not reach PostHog.' })
  }
}
