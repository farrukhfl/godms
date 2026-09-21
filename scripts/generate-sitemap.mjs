import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { industries, solutions, storeCategories } from '../src/data/navigation.js'
import { wcStoreProducts } from '../src/data/storeProducts.js'

const siteUrl = 'https://godms.com'
const today = new Date().toISOString().slice(0, 10)

const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/store', priority: '0.9', changefreq: 'daily' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly' },
  { loc: '/careers', priority: '0.4', changefreq: 'monthly' },
  { loc: '/referral-partner', priority: '0.5', changefreq: 'monthly' },
  { loc: '/partner-program', priority: '0.5', changefreq: 'monthly' },
  { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
  { loc: '/open-an-account', priority: '0.8', changefreq: 'monthly' },
  { loc: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
  { loc: '/terms-of-use', priority: '0.2', changefreq: 'yearly' },
]

const categoryRoutes = [...industries, ...solutions, ...storeCategories].map((item) => ({
  loc: item.path,
  priority: '0.7',
  changefreq: 'weekly',
}))

const productRoutes = wcStoreProducts.map((product) => ({
  loc: `/store/product/${product.id}`,
  priority: '0.6',
  changefreq: 'weekly',
}))

const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes]

const body = allRoutes
  .map(
    ({ loc, priority, changefreq }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const outPath = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../public/sitemap.xml')
writeFileSync(outPath, xml, 'utf8')

console.log(`sitemap.xml written with ${allRoutes.length} URLs (${staticRoutes.length} static, ${categoryRoutes.length} category, ${productRoutes.length} product).`)
