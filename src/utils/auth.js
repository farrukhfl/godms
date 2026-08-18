const tokenKey = 'godmsAccessToken'
const userKey = 'godmsUser'

export function getAccessToken() {
  return localStorage.getItem(tokenKey)
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(userKey) || 'null')
  } catch {
    return null
  }
}

export function saveSession(data) {
  localStorage.setItem(tokenKey, data.accessToken)
  localStorage.setItem(userKey, JSON.stringify(data.user || {}))
}

export function clearSession() {
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(userKey)
}
