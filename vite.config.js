import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import devApiRoutes from './vite-plugins/devApiRoutes'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Dev only: serves api/ the way Vercel does in production.
    devApiRoutes(),
    ViteImageOptimizer({
      png: { quality: 80 },
      jpeg: { quality: 78 },
      jpg: { quality: 78 },
      webp: { lossless: false, quality: 80 },
    }),
  ],
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    proxy: {
      '/testing-shop': {
        target: 'https://testing.godms.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/testing-shop/, ''),
      },
    },
  },
})
