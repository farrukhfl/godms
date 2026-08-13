import { ChevronDown, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { navGroups } from '../../data/navigation'
import { siteConfig } from '../../data/siteConfig'
import Button from '../ui/Button'

export default function MobileMenu({ onClose }) {
  const [openGroup, setOpenGroup] = useState(null)

  return (
    <div id="mobile-navigation" className="mobile-menu-enter max-h-[calc(100dvh-7rem)] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-6 pt-3 xl:hidden">
      <nav aria-label="Mobile navigation">
        <Link to="/" onClick={onClose} className="block rounded-lg px-3 py-3 font-semibold text-navy hover:bg-slate-50">Home</Link>
        {navGroups.map((group) => {
          const isOpen = openGroup === group.label
          const panelId = `mobile-${group.label.toLowerCase().replace(/\s+/g, '-')}-panel`
          return (
            <div key={group.label} className="border-b border-slate-100">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left font-semibold text-navy hover:bg-slate-50"
                onClick={() => setOpenGroup(isOpen ? null : group.label)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                {group.label}
                <ChevronDown aria-hidden="true" size={18} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div id={panelId} className="mobile-panel-enter grid gap-1 pb-3 pl-3">
                  {group.items.map(({ label, path, icon: Icon }, index) => (
                    <Link key={path} to={path} onClick={onClose} style={{ '--menu-item-delay': `${index * 35}ms` }} className="mega-menu-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:translate-x-1 hover:bg-mist hover:text-primary">
                      <Icon aria-hidden="true" size={17} />{label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      <div className="mt-5 grid gap-3">
        <a href={siteConfig.signInUrl} target="_blank" rel="noreferrer" aria-label="Sign in (opens in a new tab)" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-navy">
          <LogIn aria-hidden="true" size={17} /> Sign In
        </a>
        <Button to="/contact" variant="outline" onClick={onClose}>Contact Us</Button>
        <Button to="/open-an-account" onClick={onClose}>Open An Account</Button>
      </div>
    </div>
  )
}
