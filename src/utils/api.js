const apiBaseUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://dev-derps.gotmsolutions.com/api').replace(/\/$/, '')

export async function postForm(path, payload) {
  let response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Unable to connect to the server. Please try again shortly.')
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Unable to submit the form. Please try again.')
    error.fieldErrors = data.errors || {}
    throw error
  }

  return data
}
