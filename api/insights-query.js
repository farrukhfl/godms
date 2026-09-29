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

import { createHash, timingSafeEqual } from 'node:crypto'

const POSTHOG_HOST = (process.env.POSTHOG_API_HOST || 'https://us.posthog.com').replace(/\/$/, '')
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const READ_KEY = process.env.POSTHOG_READ_KEY
const PASSWORD = process.env.INSIGHTS_PASSWORD

const since = (days) => `timestamp > now() - INTERVAL ${days} DAY`

// The application has been restructured before, and step numbers were reused
// for entirely different steps: step 2 was Business, now it is Plan. Grouping by
// step number alone stacks two different forms into one chart and invents rows
// for steps that no longer exist, which is worse than showing nothing.
//
// `total_steps` on application_step_viewed identifies the structure in use, and
// the current one is simply whichever was seen most recently - so this keeps
// working after the next restructure with nothing to remember.
const CURRENT_TOTAL_STEPS = `(
  SELECT argMax(toInt(properties.total_steps), timestamp) FROM events
  WHERE event = 'application_step_viewed' AND isNotNull(properties.total_steps)
)`

// Matching on the number *and* name together is what makes this retroactive:
// events recorded before total_steps was stamped on them are still placed
// correctly, and names shared between versions ('Submit') cannot cross over.
const CURRENT_FLOW_STEPS = `
  SELECT
    toInt(properties.step_index) AS step_index,
    toString(properties.step_name) AS step_name
  FROM events
  WHERE event = 'application_step_viewed'
    AND toInt(properties.total_steps) = ${CURRENT_TOTAL_STEPS}
  GROUP BY step_index, step_name`

const inCurrentFlow = `(toInt(properties.step_index), toString(properties.step_name)) IN (${CURRENT_FLOW_STEPS})`

// How long an application must be untouched before it counts as abandoned
// rather than still in progress. Someone mid-form who steps away for coffee
// should not appear in a follow-up list.
const IDLE_MINUTES = 30

// Abandonment is derived, not captured.
//
// Any event fired as a page dies is unreliable: a crash, a flat battery, a
// force-quit or a dropped connection sends nothing at all, and browsers cancel
// in-flight requests during unload. Step views, by contrast, are recorded while
// the page is alive and healthy.
//
// So an abandoned application is defined as a person who reached a step, never
// submitted, and has not been seen since. Nothing can be missed, because the
// evidence was already collected before they left.
// `currentFlowOnly` is for the step-shaped chart of where people give up:
// a step number means nothing across two different structures of the form.
// Person-level figures leave it off on purpose, because someone who abandoned
// an older version of the form is still a real lost lead worth calling.
const abandonedPeople = (days, { currentFlowOnly = false } = {}) => `
  SELECT
    person_id,
    max(toInt(properties.step_index)) AS furthest_step,
    argMax(properties.step_name, toInt(properties.step_index)) AS furthest_step_name,
    min(timestamp) AS first_seen,
    max(timestamp) AS last_seen
  FROM events
  WHERE event = 'application_step_viewed' AND ${since(days)}
    ${currentFlowOnly ? `AND ${inCurrentFlow}` : ''}
  GROUP BY person_id
  HAVING last_seen < now() - INTERVAL ${IDLE_MINUTES} MINUTE
    AND person_id NOT IN (
      SELECT person_id FROM events
      WHERE event = 'application_submitted' AND ${since(days)}
    )`

/**
 * Constant-time password comparison.
 *
 * A plain `!==` returns as soon as two strings differ, so how long it takes
 * leaks how much of the password was correct. Hashing first normalizes length
 * (timingSafeEqual throws on mismatched buffers, which would leak length too).
 */
function passwordMatches(supplied) {
  if (typeof supplied !== 'string' || !supplied) return false
  const a = createHash('sha256').update(supplied).digest()
  const b = createHash('sha256').update(PASSWORD).digest()
  return timingSafeEqual(a, b)
}

/**
 * Per-IP throttle on failed sign-ins.
 *
 * Serverless instances are ephemeral and not shared, so this is a speed bump
 * rather than a guarantee - an attacker spread across many cold starts sees a
 * weaker limit. Combined with a long random password it makes online guessing
 * impractical, which is the threat that matters here. It is not a substitute
 * for that password being strong.
 */
const FAILURE_WINDOW_MS = 10 * 60 * 1000
const MAX_FAILURES = 8
const failures = new Map()

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim()
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown'
}

function isLockedOut(ip) {
  const record = failures.get(ip)
  if (!record) return false
  if (Date.now() - record.first > FAILURE_WINDOW_MS) {
    failures.delete(ip)
    return false
  }
  return record.count >= MAX_FAILURES
}

function recordFailure(ip) {
  const record = failures.get(ip)
  if (!record || Date.now() - record.first > FAILURE_WINDOW_MS) {
    failures.set(ip, { count: 1, first: Date.now() })
    return
  }
  record.count += 1

  // Bound memory on a long-lived warm instance.
  if (failures.size > 5000) {
    for (const [key, value] of failures) {
      if (Date.now() - value.first > FAILURE_WINDOW_MS) failures.delete(key)
    }
  }
}

const QUERIES = {
  overview: (d) => `
    SELECT
      countIf(event = '$pageview') AS pageviews,
      uniq(distinct_id) AS visitors,
      uniq(properties.$session_id) AS sessions,
      countIf(event = 'form_started') AS form_starts,
      countIf(event = 'form_submitted') AS form_submits,
      countIf(event = 'form_abandoned') AS form_abandons
    FROM events WHERE ${since(d)}`,

  // Application totals, counted per person rather than per event, with
  // abandonment derived from inactivity instead of a departure signal.
  application_summary: (d) => `
    SELECT
      (SELECT uniq(person_id) FROM events
        WHERE event = 'application_step_viewed' AND ${since(d)}) AS started,
      (SELECT uniq(person_id) FROM events
        WHERE event = 'application_submitted' AND ${since(d)}) AS submitted,
      (SELECT count() FROM (${abandonedPeople(d)})) AS abandoned,
      (SELECT count() FROM (
        SELECT person_id, max(timestamp) AS last_seen
        FROM events WHERE event = 'application_step_viewed' AND ${since(d)}
        GROUP BY person_id
        HAVING last_seen >= now() - INTERVAL ${IDLE_MINUTES} MINUTE
          AND person_id NOT IN (
            SELECT person_id FROM events
            WHERE event = 'application_submitted' AND ${since(d)}
          )
      )) AS in_progress`,

  daily_trend: (d) => `
    SELECT toDate(timestamp) AS day,
      countIf(event = '$pageview') AS pageviews,
      uniq(distinct_id) AS visitors,
      countIf(event = 'application_started') AS app_starts,
      countIf(event = 'application_submitted') AS app_submits
    FROM events WHERE ${since(d)}
    GROUP BY day ORDER BY day`,

  // Dashboard paths are filtered here as well as at collection time, so rows
  // recorded before the exclusion existed stay out of the site's page figures.
  top_pages: (d) => `
    SELECT properties.$pathname AS path,
      count() AS views,
      uniq(distinct_id) AS visitors
    FROM events WHERE event = '$pageview' AND ${since(d)}
      AND properties.$pathname NOT LIKE '/insight%'
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

  // One row per application step: how many people reached it.
  //
  // Step views alone are enough - how many moved on is simply how many reached
  // the next step, which the funnel derives. Reading one event type also lets
  // this filter on total_steps directly instead of the step-pair match, which
  // is the difference between a query that returns and one that times out.
  application_funnel: (d) => `
    SELECT
      toInt(properties.step_index) AS step_index,
      any(properties.step_name) AS step_name,
      uniq(person_id) AS reached
    FROM events
    WHERE event = 'application_step_viewed' AND ${since(d)}
      AND toInt(properties.total_steps) = ${CURRENT_TOTAL_STEPS}
    GROUP BY step_index ORDER BY step_index`,

  // Where people give up, by the furthest step they reached.
  application_dropoff: (d) => `
    SELECT
      furthest_step AS step_index,
      furthest_step_name AS step_name,
      count() AS abandons,
      round(avg(dateDiff('second', first_seen, last_seen))) AS avg_seconds
    FROM (${abandonedPeople(d, { currentFlowOnly: true })})
    GROUP BY step_index, step_name
    ORDER BY abandons DESC`,

  // How long each step actually takes. A step that is slow is a step that is
  // hard, and the funnel alone cannot tell the difference.
  application_step_timing: (d) => `
    SELECT
      toInt(properties.step_index) AS step_index,
      any(properties.step_name) AS step_name,
      round(avg(toFloat(properties.seconds_spent))) AS avg_seconds,
      round(median(toFloat(properties.seconds_spent))) AS median_seconds,
      round(max(toFloat(properties.seconds_spent))) AS slowest_seconds,
      count() AS completions
    FROM events
    WHERE event = 'application_step_completed' AND ${since(d)}
      AND ${inCurrentFlow}
      AND toFloat(properties.seconds_spent) > 0
    GROUP BY step_index ORDER BY step_index`,

  // The individual fields people get wrong, not just the step they were on.
  // Array properties arrive as nullable JSON strings, hence the unwrapping.
  application_error_fields: (d) => `
    SELECT
      replaceAll(arrayJoin(JSONExtractArrayRaw(coalesce(toString(properties.fields), '[]'))), '"', '') AS field,
      any(properties.step_name) AS step_name,
      count() AS failures,
      uniq(person_id) AS people
    FROM events WHERE event = 'application_step_error' AND ${since(d)}
      AND ${inCurrentFlow}
    GROUP BY field ORDER BY failures DESC LIMIT 25`,

  // Going back means something earlier was unclear or entered wrongly.
  application_back_steps: (d) => `
    SELECT
      toInt(properties.step_index) AS step_index,
      any(properties.step_name) AS step_name,
      count() AS times_back,
      uniq(person_id) AS people
    FROM events WHERE event = 'application_step_back' AND ${since(d)}
      AND ${inCurrentFlow}
    GROUP BY step_index ORDER BY times_back DESC`,

  // Completion split by device. A multi-step form with document uploads behaves
  // very differently on a phone, and an averaged funnel hides that entirely.
  //
  // Deliberately free of step numbers: it reports how far people got and
  // whether they finished, so restructuring the flow cannot silently break it.
  funnel_by_device: (d) => `
    SELECT
      device,
      count() AS started,
      round(avg(furthest_step), 1) AS avg_step_reached,
      countIf(has_submitted) AS completed
    FROM (
      SELECT
        person_id,
        argMax(coalesce(nullIf(properties.$device_type, ''), 'Unknown'), timestamp) AS device,
        max(toInt(properties.step_index)) AS furthest_step,
        person_id IN (
          SELECT person_id FROM events
          WHERE event = 'application_submitted' AND ${since(d)}
        ) AS has_submitted
      FROM events
      WHERE event = 'application_step_viewed' AND ${since(d)}
      GROUP BY person_id
    )
    GROUP BY device ORDER BY started DESC`,

  // Requests that failed on the applicant. These are outages, not indecision.
  application_failures: (d) => `
    SELECT
      any(properties.step_name) AS step_name,
      toInt(properties.step_index) AS step_index,
      properties.message AS message,
      count() AS occurrences,
      uniq(person_id) AS people,
      max(timestamp) AS last_seen
    FROM events WHERE event = 'application_failure' AND ${since(d)}
    GROUP BY step_index, message
    ORDER BY occurrences DESC LIMIT 25`,

  // What applicants are actually asking for.
  application_services: (d) => `
    SELECT
      replaceAll(arrayJoin(JSONExtractArrayRaw(coalesce(toString(properties.services), '[]'))), '"', '') AS service,
      uniq(person_id) AS applicants
    FROM events WHERE event = 'application_services_selected' AND ${since(d)}
    GROUP BY service ORDER BY applicants DESC`,

  application_plans: (d) => `
    SELECT
      replaceAll(arrayJoin(JSONExtractArrayRaw(coalesce(toString(properties.plans), '[]'))), '"', '') AS plan,
      uniq(person_id) AS applicants
    FROM events WHERE event = 'application_plan_selected' AND ${since(d)}
    GROUP BY plan ORDER BY applicants DESC`,

  // JavaScript errors real visitors hit.
  site_errors: (d) => `
    SELECT
      properties.$exception_message AS message,
      properties.$pathname AS path,
      count() AS occurrences,
      uniq(person_id) AS people,
      max(timestamp) AS last_seen
    FROM events WHERE event = '$exception' AND ${since(d)}
    GROUP BY message, path ORDER BY occurrences DESC LIMIT 25`,

  // Validation errors are the usual reason a step leaks.
  application_errors: (d) => `
    SELECT
      any(properties.step_name) AS step_name,
      toInt(properties.step_index) AS step_index,
      count() AS error_events,
      uniq(distinct_id) AS people
    FROM events WHERE event = 'application_step_error' AND ${since(d)}
      AND ${inCurrentFlow}
    GROUP BY step_index ORDER BY error_events DESC`,

  // Identified drop-offs for follow-up. Derived the same way, so a lead is
  // listed even if their browser never got to report leaving.
  abandoned_leads: (d) => `
    SELECT
      argMax(person.properties.email, timestamp) AS email,
      argMax(person.properties.name, timestamp) AS name,
      argMax(person.properties.phone, timestamp) AS phone,
      argMax(person.properties.businessName, timestamp) AS business,
      max(toInt(properties.step_index)) AS furthest_step,
      argMax(properties.step_name, toInt(properties.step_index)) AS furthest_step_name,
      max(timestamp) AS last_seen
    FROM events
    WHERE event = 'application_step_viewed' AND ${since(d)}
    GROUP BY person_id
    HAVING isNotNull(email) AND email != ''
      AND last_seen < now() - INTERVAL ${IDLE_MINUTES} MINUTE
      AND person_id NOT IN (
        SELECT person_id FROM events
        WHERE event = 'application_submitted' AND ${since(d)}
      )
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

  const ip = clientIp(req)
  if (isLockedOut(ip)) {
    res.setHeader('Retry-After', '600')
    return res.status(429).json({ error: 'Too many attempts. Try again later.' })
  }

  if (!passwordMatches(req.headers['x-dashboard-password'])) {
    recordFailure(ip)
    // Slow automated guessing without noticeably affecting a real mistype.
    await new Promise((resolve) => setTimeout(resolve, 400))
    return res.status(401).json({ error: 'Invalid dashboard password.' })
  }

  failures.delete(ip)

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
