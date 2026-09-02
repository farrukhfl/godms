import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import accountApplicationsRouter from './routes/accountApplications.js'
import careersRouter from './routes/careers.js'
import contactRouter from './routes/contact.js'
import referralsRouter from './routes/referrals.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://localhost:3000,https://godms.com,https://www.godms.com')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

// Disable x-powered-by to prevent server fingerprinting
app.disable('x-powered-by')

// Enable trust proxy for accurate rate-limiting when deployed behind proxies/load balancers
app.set('trust proxy', 1)

// Standard HTTP security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
})

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    return callback(null, false)
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '500kb' }))

app.get('/api/health', (req, res) => res.status(200).json({ success: true, status: 'ok' }))
app.use('/api/contact', contactRouter)
app.use('/api/contact-inquiry', contactRouter)
app.use('/api/account-applications', accountApplicationsRouter)
app.use('/api/careers', careersRouter)
app.use('/api/referrals', referralsRouter)
app.use('/api/referral', referralsRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Dolphin Merchant Services API listening on http://localhost:${port}`)
})
