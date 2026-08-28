import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { categoryContent } from './data/categoryContent'
import { industries, solutions, storeCategories } from './data/navigation'
import { privacySections, termsSections } from './data/legalContent'
import { siteConfig } from './data/siteConfig'
import { storeContent } from './data/storeContent'
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'
import CategoryPageTemplate from './pages/CategoryPageTemplate'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import LegalPage from './pages/LegalPage'
import OpenAccountPage from './pages/OpenAccountPage'
import PartnerProgramPage from './pages/PartnerProgramPage'
import PlaceholderPage from './pages/PlaceholderPage'
import ProductDetailPage from './pages/ProductDetailPage'
import ReferralPartnerPage from './pages/ReferralPartnerPage'
import SignInPage from './pages/SignInPage'

const categoryRoutes = [
  ...industries.map((item) => ({ ...item, type: 'Industry solution' })),
  ...solutions.map((item) => ({ ...item, type: 'Payment solution' })),
  ...storeCategories.map((item) => ({ ...item, type: 'POS store category' })),
].map(({ label, path, icon, description, type }) => {
  const content = categoryContent[path] || storeContent[path] || {}

  return {
    path,
    element: (
      <CategoryPageTemplate
        title={label}
        type={type}
        icon={icon}
        categoryPath={path}
        description={content.description || description || `Explore dependable ${label.toLowerCase()} options selected around your business and payment environment.`}
        {...content}
      />
    ),
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/careers', element: <CareersPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/open-an-account', element: <OpenAccountPage /> },
      { path: '/partner-program', element: <PartnerProgramPage /> },
      { path: '/privacy-policy', element: <LegalPage title="Privacy Policy" description={`How ${siteConfig.company.fullName} may collect, use, disclose, and protect information.`} sections={privacySections} /> },
      { path: '/referral-partner', element: <ReferralPartnerPage /> },
      { path: '/sign-in', element: <SignInPage /> },
      { path: '/terms-of-use', element: <LegalPage title="Terms of Use" description={`Terms governing access to the ${siteConfig.company.fullName} website and its informational content.`} sections={termsSections} /> },
      {
        path: '/store',
        element: (
          <CategoryPageTemplate
            title="POS Store"
            type="POS store category"
            categoryPath="all"
            heroTitle="Complete POS Hardware & Payment Terminals"
            description="Explore our complete commercial catalog of point-of-sale systems, wireless payment terminals, barcode scanners, receipt printers, and accessories."
            products={[]}
          />
        ),
      },
      { path: '/store/product/:id', element: <ProductDetailPage /> },
      { path: '/product/:id', element: <ProductDetailPage /> },
      ...categoryRoutes,
      { path: '*', element: <PlaceholderPage title="Page not found" description="The page you requested may have moved or is not available yet." /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
