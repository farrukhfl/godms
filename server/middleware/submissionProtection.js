import { rateLimit } from 'express-rate-limit'

export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many submission attempts. Please wait 15 minutes and try again.',
    errors: {},
  },
})

export function rejectBotsSilently(req, res, next) {
  // Check designated honeypot field without conflicting with legitimate business website fields
  if (typeof req.body?._hp_confirm === 'string' && req.body._hp_confirm.trim()) {
    return res.status(200).json({ success: true, message: 'Submission received.' })
  }

  next()
}
