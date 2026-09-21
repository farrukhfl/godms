import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { siteConfig } from '../data/siteConfig'

const siteName = siteConfig.company.fullName
const siteUrl = 'https://godms.com'
const defaultOgImage = 'https://godms.com/homepage-images/pos-banner.png'
const DESCRIPTION_MAX_LENGTH = 160

function cleanText(text) {
  if (!text) return ''
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#8217;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(text, max = DESCRIPTION_MAX_LENGTH) {
  if (!text || text.length <= max) return text
  const clipped = text.slice(0, max - 1)
  const lastSpace = clipped.lastIndexOf(' ')
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : max - 1)}…`
}

function normalizePath(pathname) {
  if (!pathname || pathname === '/') return ''
  return pathname.replace(/\/+$/, '')
}

/**
 * Site-wide SEO tags. Canonical/OG URLs default to the current router path so
 * every route gets its own unique canonical instead of silently pointing at "/".
 */
export default function Seo({
  title,
  description,
  path,
  image = defaultOgImage,
  noindex = false,
  structuredData = [],
}) {
  const location = useLocation()
  const resolvedPath = normalizePath(path ?? location.pathname)
  const pageTitle = title === siteName ? title : `${title} | ${siteName}`
  const cleanDescription = truncate(cleanText(description))
  const canonicalUrl = `${siteUrl}${resolvedPath}`

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: siteConfig.company.fullName,
    alternateName: siteConfig.company.shortName,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.company.logoUrl}`,
    image,
    description: cleanDescription || siteConfig.company.fullName,
    telephone: siteConfig.phone.href.replace('tel:', ''),
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: 'US',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone.href.replace('tel:', ''),
      contactType: 'sales',
      email: siteConfig.email,
      areaServed: 'US',
      availableLanguage: 'English',
    },
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
      siteConfig.social.facebook,
    ].filter(Boolean),
  }

  const schemas = [organizationSchema, ...structuredData].filter(Boolean)

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={cleanDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={cleanDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={cleanDescription} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
