import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { industries, solutions } from '../../data/navigation'
import { siteConfig } from '../../data/siteConfig'

const company = [
  { label: 'About Us', path: '/about' },
  { label: 'Careers', path: '/careers' },
  { label: 'Referral Partner', path: '/referral-partner' },
  { label: 'Partner Program', path: '/partner-program' },
]

const resources = [
  { label: 'Contact Us', path: '/contact' },
  { label: 'FAQs', path: '/#faqs' },
  { label: 'POS Store', path: '/store/pos' },
  { label: 'Open an Account', path: '/open-an-account' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms of Use', path: '/terms-of-use' },
]

const socialLinks = [
  { label: 'LinkedIn', url: siteConfig.social.linkedin, path: 'M6.5 8.5H3.2V19h3.3V8.5ZM4.8 3A1.9 1.9 0 1 0 4.8 6.8 1.9 1.9 0 0 0 4.8 3ZM12 8.5H8.8V19H12v-5.2c0-1.4.3-2.7 2-2.7 1.7 0 1.7 1.6 1.7 2.8V19H19v-5.8c0-2.9-.6-5-3.9-5-1.6 0-2.6.9-3.1 1.7V8.5Z' },
  { label: 'Instagram', url: siteConfig.social.instagram, path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.3-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z' },
  { label: 'Facebook', url: siteConfig.social.facebook, path: 'M13.7 22v-9h3l.5-3.5h-3.5V7.3c0-1 .3-1.7 1.8-1.7h1.9V2.5c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.3H6.8V13h3.1v9h3.8Z' },
]

function FooterLinks({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 font-bold text-white">{title}</h3>
      <ul className="space-y-3 text-sm text-white/85">
        {links.map((link) => <li key={link.path + link.label}><Link to={link.path} className="transition hover:text-accent">{link.label}</Link></li>)}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-6 lg:px-8">
        <div className="md:col-span-2">
          <Link to="/" className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-lg" aria-label={`${siteConfig.company.fullName} home`}>
            <img src="/logo.png" alt={siteConfig.company.fullName} width="1120" height="314" className="h-auto w-48 object-contain" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/85">Straightforward payments, dependable technology, and a real support team invested in your growth.</p>
          <div className="mt-6 space-y-3 text-sm text-white">
            <a href={siteConfig.phone.href} className="flex items-center gap-2 hover:text-white"><Phone aria-hidden="true" size={16} className="text-accent" /> {siteConfig.phone.display}</a>
            <a href={`mailto:${siteConfig.email}`} className="flex min-w-0 items-center gap-2 hover:text-white"><Mail aria-hidden="true" size={16} className="shrink-0 text-accent" /> <span className="break-all">{siteConfig.email}</span></a>
          </div>
          <div id="social" className="mt-6 flex gap-3">
            {socialLinks.map(({ label, url, path }) => (
              <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={`${siteConfig.company.shortName} on ${label} (opens in a new tab)`} className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[17px] w-[17px] fill-current"><path d={path} /></svg>
              </a>
            ))}
          </div>
        </div>
        <FooterLinks title="Solutions" links={solutions.slice(0, 6)} />
        <FooterLinks title="Industries" links={industries} />
        <FooterLinks title="Company" links={company} />
        <FooterLinks title="Resources" links={resources} />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-white/85 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {siteConfig.company.legalName}. All rights reserved.</p>
          <div className="flex gap-4"><Link to="/privacy-policy" className="hover:text-white">Privacy</Link><Link to="/terms-of-use" className="hover:text-white">Terms</Link></div>
        </div>
      </div>
    </footer>
  )
}
