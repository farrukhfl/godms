import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../data/siteConfig'

const siteName = siteConfig.company.fullName
const siteUrl = 'https://godms.com'
const defaultOgImage = 'https://godms.com/homepage-images/pos-banner.png'

export default function Seo({ title, description, path = '', image = defaultOgImage }) {
  const pageTitle = title === siteName ? title : `${title} | ${siteName}`
  const canonicalUrl = `${siteUrl}${path ? (path.startsWith('/') ? path : `/${path}`) : ''}`

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: siteConfig.company.fullName,
    alternateName: siteConfig.company.shortName,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.company.logoUrl}`,
    image: image,
    description: description || siteConfig.company.fullName,
    telephone: siteConfig.phone.display,
    email: siteConfig.email,
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.instagram,
      siteConfig.social.facebook,
    ].filter(Boolean),
  }

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  )
}
