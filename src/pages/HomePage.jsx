import { ArrowRight, Clock3, Headphones, Receipt, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import CTASection from '../components/sections/CTASection'
import FAQAccordion from '../components/sections/FAQAccordion'
import Hero from '../components/sections/Hero'
import LogoMarquee from '../components/sections/LogoMarquee'
import Testimonials from '../components/sections/Testimonials'
import Card from '../components/ui/Card'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import SectionHeading from '../components/ui/SectionHeading'
import { industries } from '../data/navigation'
import { siteConfig } from '../data/siteConfig'
import { categoryContent } from '../data/categoryContent'

const features = [
  { icon: WalletCards, title: '$0 upfront to switch', text: `Get ${siteConfig.company.posName} without a large upfront equipment cost. Start with the tools you need for one straightforward monthly price.` },
  { icon: Receipt, title: 'Reduce fees with dual pricing', text: 'Offer a cash and card price to help offset processing costs while giving customers a clear choice at checkout.' },
  { icon: Clock3, title: 'Approval and setup in 24 hours', text: 'Our streamlined application and guided onboarding can get qualified businesses ready to process quickly.' },
  { icon: Headphones, title: 'A dedicated support team', text: 'Talk to people who know your account, understand your setup, and stay available after you start processing.' },
]

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

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={`Why ${siteConfig.company.shortName}`} title="A simpler way to switch, save, and start selling." description="Get modern payment technology without the usual upfront cost, slow setup, or impersonal support." />
          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <Card key={title} className="group min-h-72 rounded-[1.75rem] border-slate-200/80 p-7 shadow-lg shadow-navy/5 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition group-hover:scale-110"><Icon aria-hidden="true" size={25} /></span>
                <h3 className="mt-7 text-2xl font-extrabold tracking-tight text-navy">{title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
          <PricingDisclosure className="mx-auto mt-6 max-w-3xl justify-center text-center" />
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full border-[70px] border-primary/20" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading light eyebrow="How it works" title="Three steps. One faster path to getting paid." description="We keep the process clear from selecting a service through setup and your first transaction." />
          <div className="relative mt-16 grid gap-8 lg:grid-cols-3 lg:gap-12">
            <div className="absolute left-[16.66%] right-[16.66%] top-[4.5rem] hidden h-px bg-gradient-to-r from-primary via-accent to-primary lg:block" />
            {steps.map((step, index) => (
              <div key={step.number} className="relative rounded-[1.75rem] border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-8">
                <span className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-8 border-navy bg-accent text-2xl font-black text-navy shadow-xl">{step.number}</span>
                <h3 className="mt-7 text-2xl font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-4 leading-7 text-white/85">{step.text}</p>
                {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-8 top-14 z-20 hidden rounded-full bg-primary p-2 text-white shadow-lg lg:block" size={32} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Industries" title="Payments built around the way you work." description="Purpose-fit tools for busy teams, complex workflows, and every customer experience in between." />
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {industries.map(({ label, path, icon: Icon, description }) => (
              <Link key={path} to={path} className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-navy/5 transition duration-300 hover:-translate-y-2 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10">
                <div className="overflow-hidden"><img src={categoryContent[path].heroImage} alt={categoryContent[path].heroImageAlt} loading="lazy" decoding="async" width="600" height="360" className="h-52 w-full object-cover transition duration-700 group-hover:scale-105" /></div>
                <div className="p-7">
                  <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20"><Icon aria-hidden="true" size={23} /></span><ArrowRight aria-hidden="true" className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" /></div>
                  <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-navy">{label}</h3>
                  <p className="mt-3 leading-7 text-slate-600">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <FAQAccordion variant="home" />
      <CTASection />
    </>
  )
}
