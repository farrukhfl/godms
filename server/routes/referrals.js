import { Router } from 'express'
import { burstLimiter, rejectBotsSilently, submissionLimiter } from '../middleware/submissionProtection.js'
import { logSubmission } from '../utils/logSubmission.js'
import { validateReferralSubmission } from '../utils/validation.js'

const router = Router()

router.post('/', burstLimiter, submissionLimiter, rejectBotsSilently, (req, res) => {
  const { values, errors } = validateReferralSubmission(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      errors,
    })
  }

  logSubmission('referral_partner_submission', values, req)
  return res.status(200).json({ success: true, message: 'Referral submission received.' })
})

export default router
