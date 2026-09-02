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

export function logSubmission(type, submission, req) {
  console.log(JSON.stringify({
    event: type,
    receivedAt: new Date().toISOString(),
    ip: req.ip || req.socket?.remoteAddress,
    submission: sanitizeObject(submission),
  }, null, 2))
}
