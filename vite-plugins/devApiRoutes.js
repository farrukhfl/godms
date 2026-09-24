// Serves the `api/` serverless functions on the Vite dev server.
//
// In production Vercel runs these; locally there is no function runtime, so
// `/api/insights-query` would 404 and the dashboard could never sign in. This
// plugin mounts the same handler file behind a small adapter, so what runs on
// localhost is the deployed code rather than a stand-in.
//
// Dev only: `apply: 'serve'` keeps it out of every production build.

import { loadEnv } from 'vite'

const ROUTES = {
  '/api/insights-query': '../api/insights-query.js',
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
    req.on('error', () => resolve({}))
  })
}

/** Gives the Node response the small Vercel-style surface the handlers use. */
function adaptResponse(res) {
  res.status = (code) => {
    res.statusCode = code
    return res
  }
  res.json = (payload) => {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(payload))
    return res
  }
  return res
}

export default function devApiRoutes() {
  return {
    name: 'dev-api-routes',
    apply: 'serve',
    configureServer(server) {
      // Load every variable from .env, not just VITE_ ones: these handlers read
      // server-side secrets that are deliberately withheld from the client.
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) process.env[key] = value
      }

      server.middlewares.use(async (req, res, next) => {
        const path = (req.url || '').split('?')[0]
        const modulePath = ROUTES[path]
        if (!modulePath) return next()

        try {
          const { default: handler } = await server.ssrLoadModule(
            new URL(modulePath, import.meta.url).pathname,
          )
          req.body = req.method === 'POST' ? await readBody(req) : {}
          await handler(req, adaptResponse(res))
        } catch (error) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `Dev handler failed: ${error.message}` }))
        }
      })
    },
  }
}
