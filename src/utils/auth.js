const tokenKey = 'godmsAccessToken'
const userKey = 'godmsUser'
const sessionExpiryKey = 'godmsSessionExpiry'
const SESSION_DURATION_MS = 30 * 60 * 1000 // 30 minutes inactivity timeout

export function clearSession() {
  localStorage.removeItem(tokenKey)
  localStorage.removeItem(userKey)
  localStorage.removeItem(sessionExpiryKey)
}

function isSessionValid() {
  const expiry = Number(localStorage.getItem(sessionExpiryKey))
  if (!expiry || Date.now() > expiry) {
    clearSession()
    return false
  }
  return true
}

export function touchSession() {
  if (localStorage.getItem(tokenKey)) {
    localStorage.setItem(sessionExpiryKey, String(Date.now() + SESSION_DURATION_MS))
  }
}

export function getAccessToken() {
  if (!isSessionValid()) return null
  touchSession()
  return localStorage.getItem(tokenKey)
}

export function getCurrentUser() {
  if (!isSessionValid()) return null
  try {
    return JSON.parse(localStorage.getItem(userKey) || 'null')
  } catch {
    return null
  }
}

export function saveSession(data) {
  if (!data?.accessToken) return
  localStorage.setItem(tokenKey, data.accessToken)
  
  // Sanitize user object (keep only non-sensitive profile identifiers)
  const rawUser = data.user || {}
  const safeUser = {
    id: rawUser.id || rawUser.userId,
    username: rawUser.username || rawUser.email,
    name: rawUser.name,
    role: rawUser.role || 'user',
  }
  localStorage.setItem(userKey, JSON.stringify(safeUser))
  localStorage.setItem(sessionExpiryKey, String(Date.now() + SESSION_DURATION_MS))
}
