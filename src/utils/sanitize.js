export function sanitizeText(value) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFC')
    .replace(/<[^>]*>?/gm, '')
    .split('')
    .filter((ch) => {
      const code = ch.charCodeAt(0)
      return (code >= 32 && code !== 127) || code === 9 || code === 10 || code === 13
    })
    .join('')
    .trim()
}
