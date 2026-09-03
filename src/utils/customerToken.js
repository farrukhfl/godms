const tokenKey = 'godmsCustomerAccessToken'
const expiryKey = 'godmsCustomerTokenExpiry'
const primaryUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://pos.gotmsolutions.com/api').replace(/\/$/, '')
const fallbackUrl = 'https://pos.gotmsolutions.com/api'
let pendingTokenRequest = null

function decodeToken(token) {
  if (!token || typeof token !== 'string') return {}
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return {}
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(encoded))
    return typeof decoded === 'object' && decoded !== null ? decoded : {}
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

  clearCustomerToken()

  pendingTokenRequest = (async () => {
    let response
    
    // 1. Try secure backend proxy first (keeps API key off frontend)
    try {
      const proxyRes = await fetch('/api/customer-token', {
        headers: { Accept: 'application/json' },
      })
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json().catch(() => ({}))
        if (proxyData?.data?.accessToken) {
          const expiresInSeconds = Number(proxyData.data.expiresIn) || 3600
          const expiryTimestamp = Date.now() + expiresInSeconds * 1000
          localStorage.setItem(tokenKey, proxyData.data.accessToken)
          localStorage.setItem(expiryKey, String(expiryTimestamp))
          return proxyData.data.accessToken
        }
      }
    } catch {
      // Fallback to client fetch if proxy unavailable
    }

    // 2. Direct fetch if client key is configured
    const apiKey = import.meta.env.VITE_DRMS_API_KEY
    if (!apiKey) {
      return ''
    }

    const fetchTokenFrom = (url) => fetch(`${url}/token`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'x-api-key': apiKey },
    })

    try {
      response = await fetchTokenFrom(primaryUrl)
      if (!response.ok && response.status >= 500 && primaryUrl !== fallbackUrl) {
        response = await fetchTokenFrom(fallbackUrl)
      }
    } catch {
      if (primaryUrl !== fallbackUrl) {
        response = await fetchTokenFrom(fallbackUrl)
      } else {
        return ''
      }
    }

    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.data?.accessToken) return ''
    
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
