import { ArrowRight, Phone } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import Button from '../ui/Button'

export default function CTASection() {
  return (
    <section className="relative isolate overflow-hidden bg-primary py-16 text-white sm:py-24 lg:py-32">
      <div className="absolute -left-32 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full border-[80px] border-white/10" />
      <div className="absolute -bottom-52 -right-24 -z-10 h-[32rem] w-[32rem] rounded-full bg-navy/30 blur-2xl" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-transparent via-transparent to-primary-dark/70" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="max-w-4xl">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.24em] text-accent">Your next move starts here</p>
            <h2 className="text-balance text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Ready for payments that work as hard as you do?</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">Tell us how your business operates. We&apos;ll help you build a simpler, smarter way to get paid.</p>
          </div>
          <div className="flex flex-col gap-3 lg:items-stretch">
            <Button to="/open-an-account" variant="light" className="rounded-full px-8 py-4 text-base shadow-2xl hover:-translate-y-1">Open an account <ArrowRight aria-hidden="true" size={19} /></Button>
            <Button href={siteConfig.phone.href} className="rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base shadow-none backdrop-blur hover:-translate-y-1 hover:bg-white/20"><Phone aria-hidden="true" size={18} /> {siteConfig.phone.display}</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
