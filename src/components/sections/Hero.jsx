import { ArrowRight, Check, CheckCircle2, CreditCard, ShieldCheck, Sparkles, TrendingUp, Zap } from 'lucide-react'
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

        {/* Right Hero Image Showcase with Transparent Floating Hardware */}
        <div className="hero-dashboard relative mx-auto w-full max-w-2xl pb-8 lg:ml-auto flex items-center justify-center">
          {/* Dynamic Soft Ambient Glow Behind Device */}
          <div className="aurora-glow absolute -inset-6 -z-10 rounded-full bg-gradient-to-tr from-primary/25 via-cyan-400/20 to-accent/20 blur-3xl opacity-80" />
          <div className="absolute -left-10 top-10 -z-10 h-48 w-48 rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute -right-8 bottom-6 -z-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

          {/* Clean Transparent Hardware Image */}
          <div className="group relative z-10 w-full flex items-center justify-center py-6">
            <img
              src="/homepage-images/pos-screen.png"
              alt="Dolphin POS interactive touchscreen workstation and merchant software"
              width="955"
              height="703"
              className="h-auto max-h-[500px] w-auto object-contain drop-shadow-[0_25px_45px_rgba(12,121,247,0.22)] drop-shadow-[0_15px_30px_rgba(0,0,0,0.18)] transition duration-700 ease-out group-hover:scale-[1.03]"
            />
          </div>

          {/* Floating Glassmorphic ROI Badges */}
          {/* Badge 1: Top-Left (Instant Setup) */}
          <div className="floating-badge absolute -left-4 -top-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/15 backdrop-blur-md sm:-left-8 sm:p-4 hover:scale-105 transition duration-300">
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
          <div className="floating-badge-alt absolute -right-3 -top-2 z-20 flex items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/15 backdrop-blur-md sm:-right-6 sm:p-4 hover:scale-105 transition duration-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-emerald-400 text-navy shadow-lg shadow-accent/30 font-black">
              <CreditCard aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Dual Pricing Active</p>
              <p className="text-sm font-extrabold text-navy">0% Card Fees</p>
            </div>
          </div>

          {/* Badge 3: Bottom-Left (Security Guarantee) */}
          <div className="floating-badge-delayed absolute -bottom-3 -left-3 z-20 hidden items-center gap-3 rounded-2xl border border-white/90 bg-white/95 p-3.5 shadow-2xl shadow-navy/15 backdrop-blur-md min-[400px]:flex sm:-left-6 sm:p-4 hover:scale-105 transition duration-300">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-sm">
              <ShieldCheck aria-hidden="true" size={22} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Security & Deposit</p>
              <p className="text-sm font-extrabold text-navy">Next-Day Funding</p>
            </div>
          </div>

          {/* Badge 4: Bottom-Right (Launch Offer) */}
          <div className="floating-badge absolute -bottom-3 right-2 z-20 flex items-center gap-3.5 rounded-2xl border border-white/80 bg-navy/95 p-3.5 text-white shadow-2xl shadow-navy/30 backdrop-blur-md sm:-right-4 sm:p-4 hover:scale-105 transition duration-300">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Limited Time Offer</p>
              <p className="text-base font-black text-white">$0 Upfront Hardware</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-navy shadow-md font-bold">
              <Check aria-hidden="true" size={19} />
            </span>
          </div>

          {/* Center Floating Live Sales Pill */}
          <div className="floating-badge-alt absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-4 py-2 text-xs font-bold text-navy shadow-xl backdrop-blur-md">
            <TrendingUp aria-hidden="true" size={15} className="text-emerald-500" />
            <span>Today&apos;s Net Sales: <strong className="text-emerald-600 font-extrabold">$8,462.90</strong> (+18.4%)</span>
          </div>
        </div>
      </div>
    </section>
  )
}
