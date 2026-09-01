import { ArrowRight, Check, CheckCircle2, CreditCard, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { siteConfig } from '../../data/siteConfig'
import Button from '../ui/Button'
import PricingDisclosure from '../ui/PricingDisclosure'

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-mist/60 to-white">
      {/* Background Ambient Lights */}
      <div className="hero-blob absolute -right-48 -top-40 -z-10 h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-primary/20 to-cyan-400/20 blur-3xl" />
      <div className="hero-blob absolute -bottom-64 left-1/4 -z-10 h-[36rem] w-[36rem] rounded-full bg-accent/15 blur-3xl [animation-delay:-5s]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="mx-auto grid min-h-[780px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-32">
        {/* Left Headline & Value Proposition */}
        <div className="relative z-10">
          <div className="hero-animate-1 mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/95 px-4 py-2 text-sm font-bold text-primary shadow-soft backdrop-blur-md">
            <Sparkles aria-hidden="true" size={17} className="text-accent-dark animate-pulse" /> 
            A complete POS system for one simple monthly price
          </div>
          <h1 className="hero-animate-2 text-balance text-4xl font-extrabold leading-[0.98] tracking-[-0.055em] text-navy sm:text-6xl lg:text-7xl">
            Switch for <span className="text-primary bg-gradient-to-r from-primary via-primary-light to-primary bg-clip-text text-transparent">$0 upfront.</span> Pay $49.99/month.
          </h1>
          <p className="hero-animate-3 mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
            Get fast approval, no long-term lock-in, and an all-in-one POS built for retail, restaurants, professional services, healthcare, education, and government.
          </p>
          <div className="hero-animate-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Button to="/open-an-account" className="rounded-full px-8 py-4 text-base shadow-xl shadow-primary/30 hover:-translate-y-1 hover:shadow-2xl">
              Open An Account <ArrowRight aria-hidden="true" size={19} />
            </Button>
            <Button to="/contact" variant="outline" className="rounded-full border-slate-300/90 bg-white/90 px-8 py-4 text-base shadow-sm backdrop-blur hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft">
              Get a Free Quote
            </Button>
          </div>
          <div className="hero-animate-5 mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700">
            {['24-hour approval', 'No long-term lock-in', 'Dedicated US support', 'Free POS on $10k+ sales'].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 aria-hidden="true" size={17} className="text-primary" />
                {item}
              </span>
            ))}
          </div>
          <PricingDisclosure className="hero-animate-5 mt-5 max-w-lg" />
        </div>

        {/* Right Hero Image Showcase with Eye-Catching Multi-Layered FX */}
        <div className="hero-dashboard relative mx-auto w-full max-w-2xl pb-8 lg:ml-auto">
          {/* Dynamic Rotating Aurora Halo Effect */}
          <div className="aurora-glow absolute -inset-8 -z-10 rounded-[3.5rem] bg-gradient-to-tr from-primary/35 via-cyan-400/25 to-accent/30 blur-3xl opacity-80" />
          <div className="absolute -left-12 top-10 -z-10 h-52 w-52 rounded-full bg-accent/35 blur-3xl" />
          <div className="absolute -right-10 bottom-6 -z-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

          {/* Elevated Hardware Screen Display */}
          <div className="group relative overflow-hidden rounded-[2.5rem] border-[9px] border-slate-900 bg-slate-950 p-2.5 shadow-[0_25px_70px_-15px_rgba(12,121,247,0.45)] ring-1 ring-white/20 transition duration-700 hover:shadow-[0_30px_90px_-10px_rgba(12,121,247,0.6)] sm:p-3.5">
            {/* Top Device Status Bar */}
            <div className="flex items-center justify-between rounded-t-[1.75rem] bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-slate-300 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] tracking-wider text-slate-300 font-bold">{siteConfig.company.posName.toUpperCase()} 4.0</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="radar-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">ONLINE</span>
              </div>
            </div>

            {/* Screen Image with Active Sheen Light Sweep */}
            <div className="sheen-active card-image-sheen relative overflow-hidden rounded-b-[1.75rem] rounded-t-lg bg-slate-900">
              <img
                src="/homepage-images/pos-screen.png"
                alt="Dolphin POS interactive touchscreen software and merchant dashboard"
                width="955"
                height="703"
                className="h-auto w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
          </div>

          {/* Floating Glassmorphic ROI Badges */}
          {/* Badge 1: Top-Left (Instant Setup) */}
          <div className="floating-badge absolute -left-4 -top-6 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/20 backdrop-blur-md sm:-left-8 sm:p-4 hover:scale-105 transition duration-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-500 text-white shadow-lg shadow-primary/30">
              <Zap aria-hidden="true" size={22} className="animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">Instant Activation</p>
              </div>
              <p className="text-sm font-extrabold text-navy">24-Hour Express Setup</p>
            </div>
          </div>

          {/* Badge 2: Top-Right (Dual Pricing) */}
          <div className="floating-badge-alt absolute -right-3 -top-5 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/20 backdrop-blur-md sm:-right-6 sm:p-4 hover:scale-105 transition duration-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-emerald-400 text-navy shadow-lg shadow-accent/30 font-black">
              <CreditCard aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Dual Pricing Active</p>
              <p className="text-sm font-extrabold text-navy">0% Card Fees</p>
            </div>
          </div>

          {/* Badge 3: Bottom-Left (Security Guarantee) */}
          <div className="floating-badge-delayed absolute -bottom-5 -left-3 z-20 hidden items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/20 backdrop-blur-md min-[400px]:flex sm:-left-6 sm:p-4 hover:scale-105 transition duration-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
              <ShieldCheck aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security & Deposit</p>
              <p className="text-sm font-extrabold text-navy">Next-Day Funding</p>
            </div>
          </div>

          {/* Badge 4: Bottom-Right (Launch Offer) */}
          <div className="floating-badge absolute -bottom-6 right-2 z-20 flex items-center gap-3.5 rounded-2xl border border-white/80 bg-navy/95 p-3.5 text-white shadow-2xl shadow-navy/40 backdrop-blur-md sm:-right-4 sm:p-4 hover:scale-105 transition duration-300">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Limited Time Offer</p>
              <p className="text-base font-black text-white">$0 Upfront Hardware</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-navy shadow-md font-bold">
              <Check aria-hidden="true" size={19} />
            </span>
          </div>

          {/* Center Floating Live Sales Pill */}
          <div className="floating-badge-alt absolute bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-2 rounded-full border border-white/60 bg-slate-950/85 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur-md">
            <TrendingUp aria-hidden="true" size={15} className="text-emerald-400" />
            <span>Today&apos;s Net Sales: <strong className="text-emerald-400 font-extrabold">$8,462.90</strong> (+18.4%)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
