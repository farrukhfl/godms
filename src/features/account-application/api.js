import { clearCustomerToken, getCustomerAccessToken, getCustomerAgentId } from '../../utils/customerToken'

const baseUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://dev-derps.gotmsolutions.com/api').replace(/\/$/, '')

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '')

  if (!response.ok) {
    const baseMessage = typeof data === 'object' ? data.message || data.error : data
    const validationMessage = data && typeof data === 'object' && data.errors && typeof data.errors === 'object'
      ? Object.entries(data.errors).map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}`).join(' ')
      : ''
    const error = new Error([baseMessage, validationMessage].filter(Boolean).join(' ') || `Request failed (${response.status}).`)
    error.status = response.status
    error.fieldErrors = data?.errors || {}
    throw error
  }

  return data
}

export async function applicationRequest(path, options = {}) {
  const request = async (token) => fetch(`${baseUrl}/${String(path).replace(/^\//, '')}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
    },
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  let response
  try {
    response = await request(await getCustomerAccessToken())
    if (response.status === 401) {
      clearCustomerToken()
      response = await request(await getCustomerAccessToken({ force: true }))
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new Error('Unable to connect to the application service. Please try again shortly.')
  }

  return parseResponse(response)
}

export async function saveApplication(body) {
  await getCustomerAccessToken()
  return applicationRequest('application', { method: 'POST', body: { ...body, agentId: getCustomerAgentId() } })
}

export async function uploadApplicationFile(file, type) {
  const body = new FormData()
  body.append('file', file)
  body.append('type', type)
  return applicationRequest('files', { method: 'POST', body })
}

export function unwrapData(result) {
  return result?.data ?? result
}
