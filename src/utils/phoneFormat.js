export function formatPhoneInput(value) {
  const allDigits = String(value || '').replace(/\D/g, '')
  // A leading "1" on an 11-digit string is the US country code (e.g. from "+1 512 555 1234").
  // Strip it so the remaining 10 digits are the actual number, not a shifted, wrong one.
  const normalized = allDigits.length === 11 && allDigits.startsWith('1') ? allDigits.slice(1) : allDigits
  const number = normalized.slice(0, 10)
  if (number.length < 4) return number
  if (number.length < 7) return `(${number.slice(0, 3)}) ${number.slice(3)}`
  return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
}
