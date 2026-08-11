import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../data/siteConfig'

const siteName = siteConfig.company.fullName

export default function Seo({ title, description }) {
  const pageTitle = title === siteName ? title : `${title} | ${siteName}`

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  )
}
