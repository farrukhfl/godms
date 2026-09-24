// Capture-boundary redaction.
//
// Nothing reaches PostHog without passing through this module. It enforces two
// independent guards so a single mistake upstream cannot leak regulated data:
//
//   1. Key guard   - property/field names that look sensitive are dropped.
//   2. Value guard - values that look like an SSN, EIN, bank account, routing
//                    number or card number are dropped regardless of their key.
//
// The merchant application collects SSN, EIN, routing and account numbers and
// drawn signatures. Under GLBA that is non-public personal information and it
// must never leave the browser for a third-party analytics vendor.

// Every pattern is word-anchored, and keys are normalized before matching.
// Without both, fragments match innocent keys: an unanchored `ssn` matches
// "bu[ssN]ame" and an unanchored `age` matches "page" and "message".
const SENSITIVE_KEY = /\b(ssn|social.?security|tax.?id|ein|fein|routing|account.?(number|no)|bank|banking|iban|swift|cards?|cardholder|cvv|cvc|expiry|exp.?date|passport|licen[cs]e|dl.?files?|driver.?licen[cs]e|signature|birth.?date|date.?of.?birth|dob|age|password|passcode|secret|tokens?|api.?key|auth|credential|salary|income)\b/i

/**
 * Splits camelCase and separator-delimited keys into words so anchored
 * patterns match reliably. Both the spaced form ("bankName" -> "bank name")
 * and the compact form ("dLFiles" -> "dlfiles") are checked, since neither
 * alone catches every naming style used across the application.
 */
function keyForms(key) {
  const raw = String(key || '')
  const spaced = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_.-]+/g, ' ')
    .toLowerCase()
    .trim()
  const compact = raw.replace(/[^a-z0-9]/gi, '').toLowerCase()
  return [spaced, compact]
}

// Values that must never be transmitted, whatever field they arrived in.
// Phone numbers are handled separately in sanitizePerson, which formats them
// before this guard would otherwise reject a bare 10-digit string.
const SENSITIVE_VALUE = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN, formatted
  /\b\d{2}-\d{7}\b/, // EIN, formatted
  /\b\d{9,}\b/, // bare SSN / EIN / routing / account / card runs
  /^data:/i, // signature canvas data URLs, uploaded file payloads
  /-----BEGIN/, // keys and certificates
]

// Person properties we are willing to attach to an identified profile.
// Anything not on this list is discarded, including fields added later.
const ALLOWED_PERSON_KEYS = ['email', 'phone', 'name', 'firstName', 'lastName', 'businessName']

const MAX_STRING = 300
const MAX_DEPTH = 4

export function isSensitiveKey(key) {
  return keyForms(key).some((form) => SENSITIVE_KEY.test(form))
}

export function isSensitiveValue(value) {
  if (typeof value !== 'string') return false
  return SENSITIVE_VALUE.some((pattern) => pattern.test(value))
}

/** Field names are reported for funnel analysis; sensitive ones become a marker. */
export function safeFieldName(name) {
  const clean = String(name || '').trim()
  if (!clean) return 'unnamed_field'
  if (isSensitiveKey(clean)) return 'redacted_field'
  return clean.slice(0, 64)
}

/** Recursively strips sensitive keys and values from an event payload. */
export function sanitizeProperties(input, depth = 0) {
  if (input === null || input === undefined) return undefined
  if (depth > MAX_DEPTH) return undefined

  if (typeof input === 'string') {
    if (isSensitiveValue(input)) return undefined
    return input.slice(0, MAX_STRING)
  }

  if (typeof input === 'number' || typeof input === 'boolean') return input

  if (Array.isArray(input)) {
    const list = input
      .slice(0, 50)
      .map((item) => sanitizeProperties(item, depth + 1))
      .filter((item) => item !== undefined)
    return list.length ? list : undefined
  }

  if (typeof input === 'object') {
    const output = {}
    for (const [key, value] of Object.entries(input)) {
      if (isSensitiveKey(key)) continue
      const safe = sanitizeProperties(value, depth + 1)
      if (safe !== undefined) output[key] = safe
    }
    return output
  }

  // Functions, symbols, File/Blob instances and anything else are never sent.
  return undefined
}

/** US phone numbers are contact data we keep, so they bypass the digit-run guard. */
function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '')
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  if (local.length !== 10) return ''
  return `(${local.slice(0, 3)}) ${local.slice(3, 6)}-${local.slice(6)}`
}

/**
 * Builds the person profile for an identified lead. Only allowlisted contact
 * fields survive, and each still passes the value guard.
 */
export function sanitizePerson(input) {
  const output = {}
  if (!input || typeof input !== 'object') return output

  for (const key of ALLOWED_PERSON_KEYS) {
    const value = input[key]
    if (typeof value !== 'string') continue
    const clean = value.trim()
    if (!clean) continue

    if (key === 'phone') {
      const phone = normalizePhone(clean)
      if (phone) output.phone = phone
      continue
    }

    if (isSensitiveValue(clean)) continue
    output[key] = clean.slice(0, MAX_STRING)
  }

  return output
}
