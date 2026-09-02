const tokenKey = 'godmsCustomerAccessToken'
const expiryKey = 'godmsCustomerTokenExpiry'
const primaryUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://pos.gotmsolutions.com/api').replace(/\/$/, '')
const fallbackUrl = 'https://pos.gotmsolutions.com/api'
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
  const expiryRaw = localStorage.getItem(expiryKey)
  if (!token || !expiryRaw) return null
  const expiry = Number(expiryRaw)
  return Number.isFinite(expiry) && expiry > Date.now() + 60_000 ? token : null
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
  if (!apiKey) {
    // If no customer API key is configured, return null rather than hard breaking the layout
    return ''
  }

  clearCustomerToken()

  const fetchTokenFrom = (url) => fetch(`${url}/token`, {
    method: 'GET',
    headers: { Accept: 'application/json', 'x-api-key': apiKey },
  })

  pendingTokenRequest = (async () => {
    let response
    try {
      response = await fetchTokenFrom(primaryUrl)
      if (!response.ok && response.status >= 500 && primaryUrl !== fallbackUrl) {
        response = await fetchTokenFrom(fallbackUrl)
      }
    } catch {
      if (primaryUrl !== fallbackUrl) {
        response = await fetchTokenFrom(fallbackUrl)
      } else {
        throw new Error('Unable to connect to the application service.')
      }
    }

    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.data?.accessToken) throw new Error(result.message || 'Unable to initialize the customer application.')
    
    const expiresInSeconds = Number(result.data.expiresIn) || 3600
    const expiryTimestamp = Date.now() + expiresInSeconds * 1000
    localStorage.setItem(tokenKey, result.data.accessToken)
    localStorage.setItem(expiryKey, String(expiryTimestamp))
    return result.data.accessToken
  })().finally(() => {
    pendingTokenRequest = null
  })

  return pendingTokenRequest
}
