const primaryUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://pos.gotmsolutions.com/api').replace(/\/$/, '')
const fallbackUrl = 'https://dev-derps.gotmsolutions.com/api'

export async function postForm(path, payload) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  let response

  const send = async (baseUrl) => {
    return fetch(`${baseUrl}${cleanPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  }

  try {
    response = await send(primaryUrl)
    if (!response.ok && response.status >= 500 && primaryUrl !== fallbackUrl) {
      try {
        const fallbackRes = await send(fallbackUrl)
        if (fallbackRes.ok || fallbackRes.status < 500) response = fallbackRes
      } catch {
        // keep primary response
      }
    }
  } catch {
    if (primaryUrl !== fallbackUrl) {
      try {
        response = await send(fallbackUrl)
      } catch {
        throw new Error('Unable to connect to the server. Please try again shortly.')
      }
    } else {
      throw new Error('Unable to connect to the server. Please try again shortly.')
    }
  }

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '')

  if (!response.ok) {
    const baseMsg = typeof data === 'object' ? data.message || data.error : data
    const error = new Error(baseMsg || 'Unable to submit the form. Please try again.')
    error.fieldErrors = typeof data === 'object' ? data.errors || {} : {}
    throw error
  }

  return data
}
