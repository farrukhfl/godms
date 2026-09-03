import { Router } from 'express'
import { burstLimiter } from '../middleware/submissionProtection.js'

const router = Router()

const primaryUrl = (process.env.DRMS_API_BASE_URL || 'https://pos.gotmsolutions.com/api').replace(/\/$/, '')
const fallbackUrl = 'https://pos.gotmsolutions.com/api'
const apiKey = process.env.DRMS_API_KEY || process.env.VITE_DRMS_API_KEY

router.get('/', burstLimiter, async (req, res) => {
  if (!apiKey) {
    return res.status(200).json({
      success: true,
      data: { accessToken: '', expiresIn: 3600 },
      message: 'No API key configured on server. Operating in offline/demo mode.',
    })
  }

  const fetchToken = async (targetBase) => {
    return fetch(`${targetBase}/token`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'x-api-key': apiKey },
    })
  }

  try {
    let response = await fetchToken(primaryUrl)
    if (!response.ok && response.status >= 500 && primaryUrl !== fallbackUrl) {
      response = await fetchToken(fallbackUrl)
    }

    const result = await response.json().catch(() => ({}))
    if (!response.ok || !result?.data?.accessToken) {
      return res.status(response.status || 500).json({
        success: false,
        message: result.message || 'Unable to retrieve customer token from provider.',
      })
    }

    return res.status(200).json(result)
  } catch (error) {
    console.error('Customer token proxy error:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to authentication gateway.',
    })
  }
})

export default router
