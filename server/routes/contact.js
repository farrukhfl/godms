import { Router } from 'express'
import { rejectBotsSilently, submissionLimiter } from '../middleware/submissionProtection.js'
import { logSubmission } from '../utils/logSubmission.js'
import { validateContactSubmission } from '../utils/validation.js'

const router = Router()

router.post('/', submissionLimiter, rejectBotsSilently, (req, res) => {
  const { values, errors } = validateContactSubmission(req.body)

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      errors,
    })
  }

  logSubmission('contact_submission', values, req)
  return res.status(200).json({ success: true, message: 'Contact request received.' })
})

export default router
