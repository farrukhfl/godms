import { ArrowRight, Compass, Home, Phone, ShoppingCart } from 'lucide-react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { siteConfig } from '../data/siteConfig'

export default function PlaceholderPage({ title = '404 - Page Not Found', description = 'The page you are looking for does not exist or has been moved.' }) {
  return (
    <>
      <Seo title={title} description={description} />
      <section className="bg-gradient-to-br from-mist via-white to-slate-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-sm">
              <Compass size={36} />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{siteConfig.company.fullName}</p>
            <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-xl mx-auto text-lg leading-8 text-slate-600">{description}</p>
            
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button to="/" className="gap-2 px-6 py-3.5">
                <Home size={18} /> Return Home
              </Button>
              <Button to="/store" variant="outline" className="gap-2 px-6 py-3.5">
                <ShoppingCart size={18} /> Visit POS Store
              </Button>
              <Button to="/contact" variant="ghost" className="gap-2 px-6 py-3.5">
                <Phone size={18} /> Contact Support <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
