import { Router } from 'express'
import { burstLimiter, rejectBotsSilently, submissionLimiter } from '../middleware/submissionProtection.js'
import { logSubmission } from '../utils/logSubmission.js'
import { validateAccountApplication } from '../utils/validation.js'

const router = Router()

router.post('/', burstLimiter, submissionLimiter, rejectBotsSilently, (req, res) => {
  const { values, errors } = validateAccountApplication(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      errors,
    })
  }

  logSubmission('account_application', values, req)
  return res.status(200).json({ success: true, message: 'Account application received.' })
})

export default router
