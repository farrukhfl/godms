import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import accountApplicationsRouter from './routes/accountApplications.js'
import careersRouter from './routes/careers.js'
import contactRouter from './routes/contact.js'
import customerTokenRouter from './routes/customerToken.js'
import referralsRouter from './routes/referrals.js'

const app = express()

// Startup environment validation
const rawPort = process.env.PORT || 3001
const port = Number(rawPort)
if (Number.isNaN(port) || port < 1 || port > 65535) {
  console.error(`Fatal: Invalid PORT configuration: "${rawPort}". Using default 3001.`)
}

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://godms.com',
  'https://www.godms.com',
]

const envOrigins = (process.env.ALLOWED_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]))

// Disable x-powered-by to prevent server fingerprinting
app.disable('x-powered-by')

// Enable trust proxy for accurate rate-limiting when deployed behind proxies/load balancers
app.set('trust proxy', 1)

// Standard & Advanced HTTP security headers (including CSP and HSTS)
app.use((req, res, next) => {
  // Reject excessively long URLs (DoS prevention)
  if (req.url.length > 2048) {
    return res.status(414).json({ success: false, message: 'URI Too Long' })
  }

  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' blob: data: https://pos.gotmsolutions.com https://*.gotmsolutions.com https://dev-derps.gotmsolutions.com https://testing.godms.com https://*.amazonaws.com https://www.google.com https://docs.google.com; " +
    "frame-src 'self' blob: data: https://docs.google.com https://drive.google.com https://pos.gotmsolutions.com https://*.gotmsolutions.com https://dev-derps.gotmsolutions.com https://testing.godms.com https://*.amazonaws.com https://www.google.com https://recaptcha.google.com; " +
    "object-src 'self' blob: data: https://pos.gotmsolutions.com https://*.gotmsolutions.com https://docs.google.com;"
  )
  next()
})

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  maxAge: 86400, // 24 hours preflight cache
}))
app.use(express.json({ limit: '500kb' }))
app.use(express.urlencoded({ extended: false, limit: '500kb' }))

// Health check
app.get(['/api/health', '/api/v1/health'], (req, res) => res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() }))

// Primary and versioned (v1) API routes
const mountEndpoints = (prefix = '/api') => {
  app.use(`${prefix}/customer-token`, customerTokenRouter)
  app.use(`${prefix}/token`, customerTokenRouter)
  app.use(`${prefix}/contact`, contactRouter)
  app.use(`${prefix}/contact-inquiry`, contactRouter)
  app.use(`${prefix}/account-applications`, accountApplicationsRouter)
  app.use(`${prefix}/careers`, careersRouter)
  app.use(`${prefix}/referrals`, referralsRouter)
  app.use(`${prefix}/referral`, referralsRouter)
}

mountEndpoints('/api')
mountEndpoints('/api/v1')

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port || 3001, () => {
  console.log(`Dolphin Merchant Services API listening on http://localhost:${port || 3001}`)
})
