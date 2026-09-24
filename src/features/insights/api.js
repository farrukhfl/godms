// Dashboard data access.
//
// The password is held in sessionStorage only: it is never written into the
// bundle, never persisted to disk, and is gone when the tab closes. It buys
// access to read-only analytics and nothing else - the proxy behind it holds
// no merchant credential.

const STORAGE_KEY = 'dms_insights_password'
const ENDPOINT = '/api/insights-query'

export function getPassword() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

export function setPassword(value) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Private mode: the value stays in memory for this render only.
  }
}

export function clearPassword() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing to clear.
  }
}

export class InsightsError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

/** Runs one named query. The client never sends SQL. */
export async function runQuery(name, days, signal) {
  const password = getPassword()
  if (!password) throw new InsightsError('Not signed in.', 401)

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-dashboard-password': password,
      },
      body: JSON.stringify({ query: name, days }),
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new InsightsError('Could not reach the analytics endpoint.', 0)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new InsightsError(data.error || `Request failed (${response.status}).`, response.status)
  }

  return toRecords(data.columns || [], data.results || [])
}

/** PostHog returns positional rows; the dashboard reads named fields. */
function toRecords(columns, rows) {
  return rows.map((row) => {
    const record = {}
    columns.forEach((column, index) => {
      record[String(column)] = row[index]
    })
    return record
  })
}
