import { ArrowRight, Check, CreditCard, ShoppingBag, Wifi } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import Button from '../ui/Button'
import PricingDisclosure from '../ui/PricingDisclosure'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-mist/60 to-white">
      <div className="hero-blob absolute -right-48 -top-40 -z-10 h-[38rem] w-[38rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="hero-blob absolute -bottom-64 left-1/4 -z-10 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl [animation-delay:-5s]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="mx-auto grid min-h-[780px] max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-32">
        <div className="relative z-10">
          <div className="hero-animate-1 mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/90 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur">
            <CreditCard aria-hidden="true" size={17} /> A complete POS for one simple monthly price
          </div>
          <h1 className="hero-animate-2 text-balance text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] text-navy sm:text-6xl lg:text-7xl">
            Switch for <span className="text-primary">$0 upfront.</span> Pay $49.99/month.
          </h1>
          <p className="hero-animate-3 mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">Get fast approval, no long-term lock-in, and a POS built for retail, restaurants, professional services, healthcare, education, and government organizations.</p>
          <div className="hero-animate-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/open-an-account" className="rounded-full px-8 py-4 text-base shadow-xl shadow-primary/20 hover:-translate-y-1">Open An Account <ArrowRight aria-hidden="true" size={19} /></Button>
            <Button to="/contact" variant="outline" className="rounded-full border-slate-300/80 px-8 py-4 text-base shadow-sm hover:-translate-y-1 hover:shadow-soft">Get a Quote</Button>
          </div>
          <div className="hero-animate-5 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-600">
            {['24-hour approval', 'No long-term lock-in', 'Dedicated support'].map((item) => <span key={item} className="flex items-center gap-2"><Check aria-hidden="true" size={17} className="text-primary" />{item}</span>)}
          </div>
          <PricingDisclosure className="hero-animate-5 mt-5 max-w-lg" />
        </div>

        <div className="hero-dashboard relative mx-auto w-full max-w-2xl pb-14 lg:ml-auto">
          <div className="absolute -inset-5 -z-10 rotate-2 rounded-[2.5rem] bg-primary/10" />
          <div className="absolute -left-8 top-20 -z-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border-[6px] border-white bg-navy p-3 shadow-2xl shadow-navy/30 sm:p-4">
            <div className="flex items-center justify-between border-b border-white/10 px-2 pb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-xs font-bold tracking-wide">{siteConfig.company.posName.toUpperCase()}</span>
              <Wifi aria-hidden="true" size={15} className="text-emerald-400" />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.18fr_0.82fr]">
              <div className="rounded-2xl bg-white p-5 sm:p-6">
                <div className="flex items-start justify-between">
                  <div><p className="text-xs font-semibold text-slate-400">Net sales today</p><p className="mt-1 text-2xl font-extrabold text-navy">$8,462.90</p></div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">+18.4%</span>
                </div>
                <svg viewBox="0 0 320 100" role="img" aria-label="Sales chart trending upward" className="mt-4 h-24 w-full overflow-visible">
                  <defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0C79F7" stopOpacity="0.28" /><stop offset="100%" stopColor="#0C79F7" stopOpacity="0" /></linearGradient></defs>
                  <path className="sales-chart-fill" d="M0 83 C35 79 45 58 78 65 S125 76 151 50 S200 62 228 29 S275 42 320 8 L320 100 L0 100 Z" fill="url(#sales-fill)" />
                  <path className="sales-chart-line" d="M0 83 C35 79 45 58 78 65 S125 76 151 50 S200 62 228 29 S275 42 320 8" fill="none" stroke="#0C79F7" strokeWidth="5" strokeLinecap="round" />
                  <circle className="sales-chart-dot" cx="320" cy="8" r="6" fill="#0C79F7" stroke="white" strokeWidth="3" />
                </svg>
                <div className="flex justify-between text-[10px] font-medium text-slate-400"><span>9 AM</span><span>12 PM</span><span>3 PM</span><span>6 PM</span></div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-navy">Transactions</span><span className="text-[10px] font-bold text-primary">LIVE</span></div>
                {[['Counter sale', '$124.50'], ['Tap payment', '$38.20'], ['Online order', '$86.00'], ['Invoice', '$420.00']].map(([name, amount]) => (
                  <div key={name} className="hero-animate-5 mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-[11px]"><span className="text-slate-500">{name}</span><span className="font-bold text-navy">{amount}</span></div>
                ))}
              </div>
            </div>
          </div>
          <div className="floating-badge absolute bottom-0 right-2 flex w-36 flex-col rounded-[1.35rem] border border-slate-200 bg-white p-3 shadow-2xl sm:-right-8 sm:w-40">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-slate-400">CARD READER</span><Wifi aria-hidden="true" size={13} className="text-primary" /></div>
            <div className="mt-3 rounded-lg bg-navy p-3 text-center text-white"><p className="text-[9px] text-slate-400">TOTAL</p><p className="text-xl font-extrabold">$42.80</p><p className="mt-1 text-[9px] text-emerald-300">Ready for tap</p></div>
            <div className="mx-auto mt-3 flex h-7 w-10 items-center justify-center rounded-md border border-slate-200"><CreditCard aria-hidden="true" size={15} className="text-primary" /></div>
          </div>
          <div className="floating-badge-delayed absolute bottom-1 left-2 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-2xl min-[360px]:flex sm:-left-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><ShoppingBag aria-hidden="true" size={16} /></span>
            <div><p className="text-[9px] text-slate-400">Orders today</p><p className="text-sm font-extrabold text-navy">146 completed</p></div>
          </div>
        </div>
      </div>
    </section>
  )
}
