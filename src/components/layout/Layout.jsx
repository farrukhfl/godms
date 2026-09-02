import { useEffect } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { getCustomerAccessToken } from '../../utils/customerToken'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    getCustomerAccessToken().catch(() => {
      // The application page will show a retryable error if the token service is unavailable.
    })
  }, [])

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '')
      const element = document.getElementById(targetId)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [location.pathname, location.hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-navy px-4 py-3 font-bold text-white shadow-lg transition focus:translate-y-0">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex="-1"><Outlet /></main>
      <Footer />
      <ScrollRestoration
        getKey={(loc) => {
          if (loc.pathname.startsWith('/store') && !loc.pathname.includes('/product/')) {
            return 'store-category-view'
          }
          return loc.key
        }}
      />
    </div>
  )
}
