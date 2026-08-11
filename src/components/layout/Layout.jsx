import { Outlet, ScrollRestoration } from 'react-router-dom'
import Footer from './Footer'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-navy px-4 py-3 font-bold text-white shadow-lg transition focus:translate-y-0">Skip to main content</a>
      <Navbar />
      <main id="main-content" className="flex-1" tabIndex="-1"><Outlet /></main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
