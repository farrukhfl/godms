import { ArrowRight, Clock3 } from 'lucide-react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import { siteConfig } from '../data/siteConfig'

export default function PlaceholderPage({ title, description }) {
  return (
    <>
      <Seo title={title} description={description} />
      <section className="bg-gradient-to-br from-mist to-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{siteConfig.company.fullName}</p>
            <h1 className="mt-4 text-balance text-5xl font-extrabold tracking-tight text-navy sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Clock3 size={27} /></span>
          <h2 className="mt-6 text-3xl font-extrabold text-navy">More details are coming soon.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7">This page is scaffolded and ready for final copy, imagery, forms, and calls to action.</p>
          <Button to="/" variant="outline" className="mt-8">Return home <ArrowRight size={18} /></Button>
        </div>
      </section>
    </>
  )
}
