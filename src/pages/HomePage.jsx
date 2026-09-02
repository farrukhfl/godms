import { ArrowRight, CheckCircle2, Clock3, Headphones, Receipt, ShieldCheck, Sparkles, WalletCards, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import CTASection from '../components/sections/CTASection'
import FAQAccordion from '../components/sections/FAQAccordion'
import Hero from '../components/sections/Hero'
import LogoMarquee from '../components/sections/LogoMarquee'
import Testimonials from '../components/sections/Testimonials'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { industries, solutions } from '../data/navigation'
import { siteConfig } from '../data/siteConfig'
import { categoryContent } from '../data/categoryContent'

const features = [
  { icon: WalletCards, title: '$0 upfront to switch', text: `Get ${siteConfig.company.posName} without a large upfront equipment cost. Start with the tools you need for one straightforward monthly price.` },
  { icon: Receipt, title: 'Reduce fees with dual pricing', text: 'Offer a cash and card price to help offset processing costs while giving customers a clear choice at checkout.' },
  { icon: Clock3, title: 'Approval and setup in 24 hours', text: 'Our streamlined application and guided onboarding can get qualified businesses ready to process quickly.' },
  { icon: Headphones, title: 'A dedicated support team', text: 'Talk to people who know your account, understand your setup, and stay available after you start processing.' },
]

const hardwareHighlights = [
  { title: 'Dual HD Displays', desc: 'Fast merchant touchscreen plus interactive customer payment screen.' },
  { title: 'All Tender Methods', desc: 'Accept Apple Pay, Google Wallet, EMV chip cards, tap, and cash.' },
  { title: 'High-Speed Printer', desc: 'Built-in thermal receipt printer with customizable branding and itemization.' },
  { title: 'Zero Equipment Debt', desc: '$0 upfront cost with qualified monthly plan and free replacement support.' },
]

const industryTags = {
  '/industries/retail': 'Inventory & Barcodes',
  '/industries/hospitality': 'Tableside & Tip Prompts',
  '/industries/services': 'Invoicing & Appointments',
  '/industries/healthcare': 'Copays & HSA / FSA',
  '/industries/education': 'Tuition & Campus POS',
  '/industries/government': 'Compliant & Auditable',
}

const solutionTags = {
  '/solutions/credit-card-processing': 'Dual Pricing • 0% Card Fees',
  '/solutions/pos': '$0 Upfront • Dual Screen',
  '/solutions/cash-advance': 'Fast Funding • Up to $250K',
  '/solutions/ach-processing': 'Bank-to-Bank • Low Cost',
  '/solutions/ebt-processing': 'SNAP & eWIC • Grocers',
  '/solutions/atm-placement': 'Passive Income • Free Placement',
  '/solutions/airvac': 'Driver Amenity • Hands-Off',
  '/solutions/web-360': 'Storefront • Domains & Hosting',
}

const steps = [
  { number: '01', title: 'Choose your service', text: 'Start with POS, card processing, ACH, funding, or another solution that matches what your business needs.' },
  { number: '02', title: 'Talk to a payments specialist', text: 'We review your goals, answer your questions, and recommend the right setup without unnecessary extras.' },
  { number: '03', title: 'Start processing within 24 hours', text: 'Qualified businesses can be approved, configured, and ready to accept payments in as little as one day.' },
]

export default function HomePage() {
  return (
    <>
      <Seo title={siteConfig.company.fullName} description={`Switch to ${siteConfig.company.posName} for $0 upfront and $49.99 per month. Get fast approval, no long-term lock-in, dual pricing, and dedicated support.`} />
      <Hero />
      <LogoMarquee />

      {/* Why Choose Dolphin Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow={`Why ${siteConfig.company.shortName}`} title="A simpler way to switch, save, and start selling." description="Get modern payment technology without the usual upfront cost, slow setup, or impersonal support." /></Reveal>
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, text }, index) => (
              <Reveal key={title} delay={index * 110} className="h-full">
              <Card className="group h-full min-h-72 rounded-[1.75rem] border-slate-200/80 p-7 shadow-lg shadow-navy/5 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition group-hover:scale-110"><Icon aria-hidden="true" size={25} /></span>
                <h3 className="mt-7 text-2xl font-extrabold tracking-tight text-navy">{title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{text}</p>
              </Card>
              </Reveal>
            ))}
          </div>
          <Reveal delay={300}><PricingDisclosure className="mx-auto mt-6 max-w-3xl justify-center text-center" /></Reveal>
        </div>
      </section>

      {/* POS Hardware & Technology Showcase Section (High ROI Conversion Banner) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-navy to-slate-950 py-24 text-white sm:py-32">
        <div className="hero-blob absolute -left-32 top-10 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="hero-blob absolute -right-32 bottom-10 -z-10 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            {/* Left Content */}
            <Reveal direction="left">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent">
                <Sparkles aria-hidden="true" size={15} /> All-In-One Counter Solution
              </div>
              <h2 className="mt-5 text-balance text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
                Commercial-grade POS hardware. <span className="text-accent">$0 out of pocket.</span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                Transform your checkout with a modern dual-screen workstation, integrated high-speed receipt printer, and proprietary dual-pricing software that eliminates card processing fees.
              </p>

              {/* Hardware Value Highlights */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {hardwareHighlights.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:border-primary/40 hover:bg-white/10">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-white">
                      <CheckCircle2 aria-hidden="true" size={17} className="text-accent shrink-0" />
                      {item.title}
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-slate-300">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* ROI Callout Box */}
              <div className="mt-8 rounded-2xl border border-accent/25 bg-gradient-to-r from-accent/10 to-primary/10 p-5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-navy font-black text-lg">
                    %
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">Maximum ROI Guarantee</p>
                    <p className="text-sm font-semibold text-white">Merchants save an average of <span className="font-extrabold text-accent">$4,800 to $14,000/year</span> in card processing fees.</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button to="/open-an-account" variant="primary" className="rounded-full px-8 py-4 text-base shadow-xl shadow-primary/30">
                  Claim $0 Upfront Hardware <ArrowRight aria-hidden="true" size={18} />
                </Button>
                <Button to="/solutions/pos" className="rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base backdrop-blur hover:bg-white/20">
                  Explore POS Specs
                </Button>
              </div>
            </Reveal>

            {/* Right Hardware Banner Visual (Commercial-Grade Full POS Station) */}
            <Reveal direction="right" delay={150}>
              <div className="group relative mx-auto w-full max-w-xl">
                {/* Multi-Layered Neon Aura & Radial Ground Reflection */}
                <div className="aurora-glow absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-tr from-primary/40 via-cyan-400/25 to-accent/30 blur-3xl opacity-85 transition duration-700 group-hover:scale-105" />
                <div className="pedestal-glow absolute -inset-x-8 -bottom-10 h-32 blur-xl" />
                
                {/* Image Chassis Container with Sheen Sweep */}
                <div className="sheen-active card-image-sheen relative overflow-hidden rounded-[2.5rem] border-[2px] border-white/20 bg-slate-900/95 p-4 shadow-[0_25px_80px_-15px_rgba(12,121,247,0.5)] backdrop-blur-xl">
                  <img
                    src="/homepage-images/pos-banner.png"
                    alt="Dolphin POS Complete Dual-Screen Station and Hardware Workstation"
                    width="1294"
                    height="952"
                    className="h-auto w-full rounded-[1.75rem] object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                  />

                  {/* Hotspot Floating Badge 1 (Dual Screen) */}
                  <div className="absolute left-6 top-6 hidden rounded-full border border-white/30 bg-slate-950/85 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md sm:flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="hotspot-ring absolute inline-flex h-full w-full rounded-full bg-accent opacity-80" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                    </span>
                    Dual-Screen Interactive POS
                  </div>

                  {/* Hotspot Floating Badge 2 (Top-Rated) */}
                  <div className="absolute right-6 top-6 hidden rounded-full border border-accent/40 bg-accent/90 px-3.5 py-1.5 text-xs font-black text-navy shadow-xl backdrop-blur-md sm:flex items-center gap-1.5">
                    <Sparkles aria-hidden="true" size={13} className="text-navy" />
                    $0 Upfront Package
                  </div>

                  {/* Hotspot Floating Badge 3 (Instant Tap) */}
                  <div className="absolute bottom-6 right-6 hidden rounded-full border border-white/30 bg-slate-950/85 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md sm:flex items-center gap-2">
                    <Zap aria-hidden="true" size={14} className="text-accent animate-pulse" />
                    Instant Contactless & EMV Tap
                  </div>
                </div>

                {/* Sub-badge below image */}
                <div className="mt-4 flex items-center justify-between px-3 text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck aria-hidden="true" size={16} className="text-emerald-400" />
                    Free Hardware Replacement Warranty
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 aria-hidden="true" size={16} className="text-accent" />
                    Plug & Play 24h Setup
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Solutions Grid Section with Solution Images & High ROI Highlights */}
      <section className="py-24 sm:py-32 bg-slate-50/70 border-b border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Our Solutions"
              title="Tailored payment & revenue tools for every counter."
              description="Explore specialized payment technologies designed to eliminate fees, automate receivables, and boost your bottom line."
            />
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map(({ label, path, icon: Icon, description }, index) => {
              const category = categoryContent[path] || {}
              const tag = solutionTags[path] || 'Payment Solution'
              return (
                <Reveal key={path} direction="scale" delay={(index % 4) * 90} className="h-full">
                  <Link
                    to={path}
                    className="group flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-primary/20 bg-white shadow-md shadow-navy/5 transition duration-500 hover:-translate-y-2 hover:border-primary hover:shadow-2xl hover:shadow-primary/20"
                  >
                    {/* Solution Image Container with Theme Blue Border */}
                    <div className="card-image-sheen relative overflow-hidden bg-slate-900 border-b-2 border-primary/40 group-hover:border-primary transition duration-300">
                      <img
                        src={category.heroImage || '/solution-images/pos-solution.png'}
                        alt={category.heroImageAlt || label}
                        loading="lazy"
                        decoding="async"
                        width="500"
                        height="320"
                        className="h-44 w-full object-cover transition duration-700 ease-out group-hover:scale-108"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                      
                      {/* Floating ROI Tag */}
                      <div className="absolute bottom-2.5 left-3 rounded-full border border-primary/40 bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                        {tag}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition duration-300 group-hover:bg-primary group-hover:text-white">
                            <Icon aria-hidden="true" size={20} />
                          </span>
                          <span className="rounded-full bg-slate-100 p-1.5 text-slate-400 transition group-hover:bg-primary/10 group-hover:text-primary">
                            <ArrowRight aria-hidden="true" size={15} className="transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                        <h3 className="mt-4 text-lg font-extrabold text-navy transition duration-200 group-hover:text-primary">{label}</h3>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-bold text-primary">
                        <span>Learn more</span>
                        <span className="text-[11px] font-medium text-slate-400">View specs →</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div className="hero-blob absolute -right-40 -top-40 h-96 w-96 rounded-full border-[70px] border-primary/20" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading light eyebrow="How it works" title="Three steps. One faster path to getting paid." description="We keep the process clear from selecting a service through setup and your first transaction." /></Reveal>
          <div className="relative mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="process-connector absolute left-[16.66%] right-[16.66%] top-[4.5rem] hidden h-px bg-gradient-to-r from-primary via-accent to-primary lg:block" />
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 150} className="h-full">
              <div className="group relative h-full rounded-[1.75rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-2 hover:border-primary/40 hover:bg-white/10 sm:p-8">
                <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-8 border-navy bg-accent text-2xl font-black text-navy shadow-xl">{step.number}</span>
                <h3 className="mt-7 text-2xl font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-4 leading-7 text-white/85">{step.text}</p>
                {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-8 top-14 z-20 hidden rounded-full bg-primary p-2 text-white shadow-lg lg:block" size={32} />}
              </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section with High-Resolution Images & ROI Enhancements */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Industries" title="Payments built around the way you work." description="Purpose-fit tools for busy teams, complex workflows, and every customer experience in between." /></Reveal>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map(({ label, path, icon: Icon, description }, index) => {
              const category = categoryContent[path] || {}
              const tag = industryTags[path] || 'Specialized POS'
              return (
                <Reveal key={path} direction="scale" delay={(index % 3) * 110} className="h-full">
                <Link to={path} className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-navy/5 transition duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/15">
                  {/* Image with Sheen and ROI Tag */}
                  <div className="card-image-sheen relative overflow-hidden bg-slate-100">
                    <img
                      src={category.heroImage}
                      alt={category.heroImageAlt || label}
                      loading="lazy"
                      decoding="async"
                      width="600"
                      height="380"
                      className="h-60 w-full object-cover transition duration-700 ease-out group-hover:scale-108"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Floating Industry Tag */}
                    <div className="absolute bottom-3 left-4 rounded-full border border-white/30 bg-slate-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                      {tag}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-7 sm:p-8">
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/25 transition duration-300 group-hover:scale-110 group-hover:bg-primary-dark">
                          <Icon aria-hidden="true" size={22} />
                        </span>
                        <span className="rounded-full bg-slate-100 p-2 text-slate-400 transition duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                          <ArrowRight aria-hidden="true" size={18} className="transition group-hover:translate-x-0.5" />
                        </span>
                      </div>
                      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-navy group-hover:text-primary transition-colors duration-200">{label}</h3>
                      <p className="mt-3 leading-7 text-slate-600">{description}</p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-primary">
                      <span>Explore solutions</span>
                      <span className="text-xs text-slate-400 font-semibold">$0 upfront eligible</span>
                    </div>
                  </div>
                </Link>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      <Testimonials />
      <FAQAccordion variant="home" />
      <CTASection />
    </>
  )
}
