import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { LoaderCircle, Store } from 'lucide-react'
import Layout from './components/layout/Layout'
import { categoryContent } from './data/categoryContent'
import { industries, solutions, storeCategories } from './data/navigation'
import { privacySections, termsSections } from './data/legalContent'
import { siteConfig } from './data/siteConfig'
import { storeContent } from './data/storeContent'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const CareersPage = lazy(() => import('./pages/CareersPage'))
const CategoryPageTemplate = lazy(() => import('./pages/CategoryPageTemplate'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const HomePage = lazy(() => import('./pages/HomePage'))
const LegalPage = lazy(() => import('./pages/LegalPage'))
const OpenAccountPage = lazy(() => import('./pages/OpenAccountPage'))
const PartnerProgramPage = lazy(() => import('./pages/PartnerProgramPage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const ReferralPartnerPage = lazy(() => import('./pages/ReferralPartnerPage'))
const SignInPage = lazy(() => import('./pages/SignInPage'))

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoaderCircle className="animate-spin text-primary" size={40} />
    </div>
  )
}

function SuspenseWrapper({ children }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>
}

const categoryRoutes = [
  ...industries.map((item) => ({ ...item, type: 'Industry solution' })),
  ...solutions.map((item) => ({ ...item, type: 'Payment solution' })),
  ...storeCategories.map((item) => ({ ...item, type: 'POS store category' })),
].map(({ label, path, icon, description, type }) => {
  const content = categoryContent[path] || storeContent[path] || {}

  return {
    path,
    element: (
      <SuspenseWrapper>
        <CategoryPageTemplate
          title={label}
          type={type}
          icon={icon}
          categoryPath={path}
          description={content.description || description || `Explore dependable ${label.toLowerCase()} options selected around your business and payment environment.`}
          {...content}
        />
      </SuspenseWrapper>
    ),
  }
})

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <SuspenseWrapper><HomePage /></SuspenseWrapper> },
      { path: '/about', element: <SuspenseWrapper><AboutPage /></SuspenseWrapper> },
      { path: '/careers', element: <SuspenseWrapper><CareersPage /></SuspenseWrapper> },
      { path: '/contact', element: <SuspenseWrapper><ContactPage /></SuspenseWrapper> },
      { path: '/open-an-account', element: <SuspenseWrapper><OpenAccountPage /></SuspenseWrapper> },
      { path: '/partner-program', element: <SuspenseWrapper><PartnerProgramPage /></SuspenseWrapper> },
      { path: '/privacy-policy', element: <SuspenseWrapper><LegalPage title="Privacy Policy" description={`How ${siteConfig.company.fullName} collects, uses, discloses, and protects information.`} sections={privacySections} /></SuspenseWrapper> },
      { path: '/referral-partner', element: <SuspenseWrapper><ReferralPartnerPage /></SuspenseWrapper> },
      { path: '/sign-in', element: <SuspenseWrapper><SignInPage /></SuspenseWrapper> },
      { path: '/terms-of-use', element: <SuspenseWrapper><LegalPage title="Terms of Use" description={`Terms governing access to the ${siteConfig.company.fullName} website and its services.`} sections={termsSections} /></SuspenseWrapper> },
      {
        path: '/store',
        element: (
          <SuspenseWrapper>
            <CategoryPageTemplate
              title="POS Store"
              type="POS store category"
              icon={Store}
              categoryPath="all"
              heroTitle="Complete POS Hardware & Payment Terminals"
              description="Explore our complete commercial catalog of point-of-sale systems, wireless payment terminals, barcode scanners, receipt printers, and accessories."
            />
          </SuspenseWrapper>
        ),
      },
      { path: '/store/product/:id', element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper> },
      { path: '/product/:id', element: <SuspenseWrapper><ProductDetailPage /></SuspenseWrapper> },
      ...categoryRoutes,
      { path: '*', element: <SuspenseWrapper><PlaceholderPage title="404 - Page Not Found" description="The page you requested may have moved or is not available." /></SuspenseWrapper> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
