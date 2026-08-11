import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js'
import accountApplicationsRouter from './routes/accountApplications.js'
import contactRouter from './routes/contact.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS.'))
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}))
app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (req, res) => res.status(200).json({ success: true, status: 'ok' }))
app.use('/api/contact', contactRouter)
app.use('/api/account-applications', accountApplicationsRouter)

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Dolphin Merchant Services API listening on http://localhost:${port}`)
})
