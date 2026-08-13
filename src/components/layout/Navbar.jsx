import { ChevronDown, Mail, Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { navGroups } from '../../data/navigation'
import { siteConfig } from '../../data/siteConfig'
import Button from '../ui/Button'
import MegaMenu from './MegaMenu'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    setActiveMenu(null)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleMenuKeyDown(event) {
    if (event.key !== 'Escape') return
    setActiveMenu(null)
    event.currentTarget.querySelector('button')?.focus()
  }

  return (
    <header className={`header-shell sticky top-0 z-50 bg-white/95 backdrop-blur transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-navy/10' : 'shadow-sm'}`}>
      <div className={`overflow-hidden bg-primary-dark text-white transition-all duration-300 ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-5 px-4 py-2 text-xs font-medium sm:justify-end sm:px-6 lg:px-8">
          <a href={siteConfig.phone.href} className="flex items-center gap-1.5 transition hover:text-blue-200"><Phone aria-hidden="true" size={13} /> {siteConfig.phone.display}</a>
          <a href={`mailto:${siteConfig.email}`} className="hidden min-w-0 items-center gap-1.5 transition hover:text-blue-200 md:flex"><Mail aria-hidden="true" className="shrink-0" size={13} /> <span className="break-all">{siteConfig.email}</span></a>
        </div>
      </div>

      <div className={`mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6 lg:px-8 ${isScrolled ? 'h-16' : 'h-20'}`}>
        <Link to="/" className="flex shrink-0 items-center" aria-label={`${siteConfig.company.fullName} home`}>
          <img src="/logo.png" alt={siteConfig.company.fullName} width="1120" height="314" className={`header-logo h-auto object-contain transition-all duration-300 ${isScrolled ? 'w-36 sm:w-40' : 'w-40 sm:w-48'}`} />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Main navigation">
          <Link to="/" className="nav-link rounded-lg px-3 py-2 text-sm font-semibold text-navy transition hover:bg-mist hover:text-primary">Home</Link>
          {navGroups.map((group) => {
            const menuId = `desktop-${group.label.toLowerCase().replace(/\s+/g, '-')}-menu`
            const buttonId = `${menuId}-button`
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setActiveMenu(group.label)}
                onMouseLeave={() => setActiveMenu(null)}
                onKeyDown={handleMenuKeyDown}
                onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveMenu(null) }}
              >
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => setActiveMenu(activeMenu === group.label ? null : group.label)}
                  className="nav-link flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-navy transition hover:bg-mist hover:text-primary"
                  aria-expanded={activeMenu === group.label}
                  aria-controls={menuId}
                  aria-haspopup="true"
                >
                  {group.label}<ChevronDown aria-hidden="true" size={15} className={`transition ${activeMenu === group.label ? 'rotate-180' : ''}`} />
                </button>
                {activeMenu === group.label && <MegaMenu id={menuId} labelledBy={buttonId} group={group} onClose={() => setActiveMenu(null)} />}
              </div>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Button href={siteConfig.signInUrl} target="_blank" rel="noreferrer" aria-label="Sign in (opens in a new tab)" variant="outline" className="px-4 py-2.5">Sign In</Button>
          <Link to="/contact" className="nav-link px-1 py-2 text-sm font-bold text-navy transition hover:text-primary">Contact Us</Link>
          <Button to="/open-an-account" className="px-4 py-2.5">Open An Account</Button>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-navy hover:bg-mist xl:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          {mobileOpen ? <X aria-hidden="true" className="nav-icon-enter" size={26} /> : <Menu aria-hidden="true" className="nav-icon-enter" size={26} />}
        </button>
      </div>
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  )
}
