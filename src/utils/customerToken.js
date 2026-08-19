const tokenKey = 'godmsCustomerAccessToken'
const expiryKey = 'godmsCustomerTokenExpiry'
const drmsBaseUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://dev-derps.gotmsolutions.com/api').replace(/\/$/, '')
let pendingTokenRequest = null

function decodeToken(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(encoded))
  } catch {
    return {}
  }
}

function hasUsableToken() {
  const token = localStorage.getItem(tokenKey)
  const expiry = Date.parse(localStorage.getItem(expiryKey) || '')
  return token && Number.isFinite(expiry) && expiry > Date.now() + 60_000 ? token : null
}

export function clearCustomerToken() {
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(expiryKey)
}

export function getCustomerAgentId() {
  const payload = decodeToken(localStorage.getItem(tokenKey) || '')
  return payload.userId ?? payload.id ?? null
}

export async function getCustomerAccessToken({ force = false } = {}) {
  if (!force) {
    const storedToken = hasUsableToken()
    if (storedToken) return storedToken
    if (pendingTokenRequest) return pendingTokenRequest
  }

  const apiKey = import.meta.env.VITE_DRMS_API_KEY
  if (!apiKey) throw new Error('The customer application service is not configured.')

  clearCustomerToken()
  pendingTokenRequest = fetch(`${drmsBaseUrl}/token`, {
    method: 'GET',
    headers: { Accept: 'application/json', 'x-api-key': apiKey },
  }).then(async (response) => {
    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.data?.accessToken) throw new Error(result.message || 'Unable to initialize the customer application.')
    localStorage.setItem(tokenKey, result.data.accessToken)
    localStorage.setItem(expiryKey, result.data.expiresIn)
    return result.data.accessToken
  }).finally(() => {
    pendingTokenRequest = null
  })

  return pendingTokenRequest
}
