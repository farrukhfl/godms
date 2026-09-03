const sensitiveKeys = new Set([
  'password',
  'ssn',
  'socialsecuritynumber',
  'accountnumber',
  'routingnumber',
  'cardnumber',
  'cvv',
  'cardcode',
  'token',
  'accesstoken',
  'apikey',
  'dlfiles',
  'bankfiles',
  'secret',
  'taxcode',
  'pin',
])

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sanitizeObject)

  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase().replace(/[^a-z]/g, '')
    if (sensitiveKeys.has(lowerKey)) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

function anonymizeIp(ip) {
  if (!ip || typeof ip !== 'string') return '0.0.0.0'
  // IPv4: mask last octet (e.g. 192.168.1.xxx)
  if (ip.includes('.')) {
    const parts = ip.split('.')
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`
    }
  }
  // IPv6: mask host bits
  if (ip.includes(':')) {
    const parts = ip.split(':')
    return `${parts.slice(0, 3).join(':')}:xxxx:xxxx:xxxx`
  }
  return 'anonymized-ip'
}

export function logSubmission(type, submission, req) {
  const rawIp = req.ip || req.socket?.remoteAddress
  console.log(JSON.stringify({
    event: type,
    receivedAt: new Date().toISOString(),
    ip: anonymizeIp(rawIp),
    submission: sanitizeObject(submission),
  }, null, 2))
}
