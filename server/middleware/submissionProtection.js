import { rateLimit } from 'express-rate-limit'

// 1. Strict Sliding-Window Rate Limiter per IP
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // max 5 submissions per IP in 15 minutes
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submission attempts from this network. Please wait a few minutes and try again.',
    errors: {},
  },
})

// 2. High-Frequency Burst Limiter (stops rapid-fire automated flooding)
export const burstLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 2, // max 2 requests per minute
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Please wait a moment before submitting another request.',
    errors: {},
  },
})

// 3. Known Disposable & Fake Email Providers (Causes 550 SMTP Bounces)
const disposableEmailDomains = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'grr.la',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  '10minutemail.net',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'throwawaymail.com',
  'fakemailgenerator.com',
  'getairmail.com',
  'mohmal.com',
  'mytemp.email',
  'generator.email',
  'emailondeck.com',
  'crazymailing.com',
  'nada.ltd',
  'getnada.com',
  'abcvg.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
  'nowmymail.com',
  'meltmail.com',
  'sharklasers.com',
  '0815.ru',
  'discard.email',
  'discardmail.com',
  'spambog.com',
  'maildrop.cc',
  'inboxkitten.com',
  'burnermail.io',
  'minutemail.com',
  'temporarymail.com',
  'mailcatch.com',
  'zillamail.com',
])

// 4. Spam Trigger Patterns in message content
const spamPatterns = [
  /(\[url=|<a\s+href=)/i,
  /\b(casino|crypto\s*doubler|viagra|cialis|seo\s*backlinks|rank\s*first\s*on\s*google|telegram\s*channel|t\.me\/|wa\.me\/)\b/i,
]

export function rejectBotsSilently(req, res, next) {
  const body = req.body || {}

  // A. Multi-Field Honeypot Traps (Bots auto-populate hidden fields)
  if (
    (typeof body._hp_confirm === 'string' && body._hp_confirm.trim()) ||
    (typeof body._hp_company_sec === 'string' && body._hp_company_sec.trim()) ||
    (typeof body.website_url_hp === 'string' && body.website_url_hp.trim())
  ) {
    // Return 200 OK so spambots do not adapt or retry with alternate payloads
    return res.status(200).json({ success: true, message: 'Submission received.' })
  }

  // B. Time-Delta Trap (Human users take > 2 seconds to complete a form)
  if (body._submission_started_at) {
    const startedAt = Number(body._submission_started_at)
    const elapsed = Date.now() - startedAt
    if (Number.isFinite(startedAt) && (elapsed < 1800 || elapsed > 24 * 60 * 60 * 1000)) {
      // Submitted unrealistically fast (<1.8s) or with expired token (>24h)
      return res.status(200).json({ success: true, message: 'Submission received.' })
    }
  }

  // C. Disposable / Throwaway Email Detection (Prevents 550 SMTP Server Bounces)
  if (typeof body.email === 'string') {
    const emailDomain = body.email.split('@')[1]?.toLowerCase().trim()
    if (emailDomain && (disposableEmailDomains.has(emailDomain) || emailDomain.endsWith('.invalid') || emailDomain.endsWith('.test'))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid, permanent business or personal email address.',
        errors: { email: 'Disposable and temporary email addresses are not accepted.' },
      })
    }
  }

  // D. Spam Link Density & Keyword Inspection
  const combinedText = `${body.message || ''} ${body.productsDescription || ''} ${body.name || ''}`
  const linkCount = (combinedText.match(/https?:\/\//gi) || []).length
  if (linkCount > 2) {
    return res.status(200).json({ success: true, message: 'Submission received.' })
  }

  for (const pattern of spamPatterns) {
    if (pattern.test(combinedText)) {
      return res.status(200).json({ success: true, message: 'Submission received.' })
    }
  }

  next()
}
