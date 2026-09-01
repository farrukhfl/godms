import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Seo from '../components/Seo'
import FAQAccordion from '../components/sections/FAQAccordion'
import ProductGrid from '../components/sections/ProductGrid'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../data/siteConfig'

const fallbackBody = [
  `${siteConfig.company.fullName} provides dependable payment technology and hands-on guidance for businesses choosing new equipment. Our team helps identify compatible products based on your processing environment, checkout flow, and day-to-day needs.`,
  'Explore this category as a starting point, then speak with a specialist to confirm compatibility, availability, pricing, and the best configuration for your business.',
]

const fallbackBenefits = ['Equipment selected for your payment environment', 'Compatibility guidance before purchase', 'Options for growing and established businesses', 'Support from payment technology specialists']

export default function CategoryPageTemplate({ title, heroTitle, description, type, icon: Icon, body = fallbackBody, benefits = fallbackBenefits, metaDescription, products, categoryPath, heroImage, heroImageAlt, showPricingDisclosure = false, stats, featureSections, audience, faqs, faqTitle, faqDescription, showIndustryPosOffer = false }) {
  const hasIndustryContent = featureSections?.length > 0
  const isIndustryPage = type === 'Industry solution'
  const isSolutionPage = type === 'Payment solution'
  const isAnimatedPage = isIndustryPage || isSolutionPage

  return (
    <>
      <Seo title={title} description={metaDescription || description} />
      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
        <div className={`${isAnimatedPage ? 'hero-blob' : ''} absolute -right-24 -top-24 h-80 w-80 rounded-full border-[55px] border-primary/20`} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={heroImage ? 'grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16' : 'max-w-3xl'}>
            <div>
              <span className={`${isAnimatedPage ? 'hero-animate-1' : ''} mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white`}><Icon aria-hidden="true" size={28} /></span>
              <p className={`${isAnimatedPage ? 'hero-animate-2' : ''} text-sm font-bold uppercase tracking-[0.2em] text-accent`}>{type}</p>
              <h1 className={`${isAnimatedPage ? 'hero-animate-2' : ''} mt-4 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl`}>{heroTitle || title}</h1>
              <p className={`${isAnimatedPage ? 'hero-animate-3' : ''} mt-6 max-w-2xl text-lg leading-8 text-white/85`}>{description}</p>
              <Button to="/contact" className={`${isAnimatedPage ? 'hero-animate-4' : ''} mt-8 px-7 py-4 text-base`}>Talk to a payment expert <ArrowRight aria-hidden="true" size={19} /></Button>
              {showPricingDisclosure && <PricingDisclosure dark className="mt-5 max-w-2xl" />}
            </div>
            {heroImage && (
              <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
                <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-primary/30 via-accent/20 to-primary/10 blur-2xl" />
                <div className="card-image-sheen relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-900/90 p-3 shadow-2xl shadow-navy/60 backdrop-blur-md group">
                  <img
                    src={heroImage}
                    alt={heroImageAlt || title}
                    loading="lazy"
                    decoding="async"
                    width="900"
                    height="700"
                    className={`${isAnimatedPage ? 'industry-hero-image' : ''} h-72 w-full rounded-2xl object-cover shadow-2xl transition duration-700 ease-out group-hover:scale-[1.03] sm:h-96`}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 rounded-full border border-white/20 bg-slate-950/80 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Verified {type}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {stats?.length > 0 && <section className={isAnimatedPage ? 'border-b border-white/10 bg-navy py-8 text-white sm:py-10' : 'border-b border-slate-200 bg-white'}>
        <div className={isAnimatedPage ? 'mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-8' : 'mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8'}>
          {stats.map((stat, index) => <Reveal key={stat.label} disabled={!isAnimatedPage} direction="scale" delay={index * 110}>
            <div className={isAnimatedPage ? 'rounded-2xl border border-white/10 bg-white/5 px-6 py-7 text-center backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/10 sm:py-8' : 'px-6 py-8 text-center sm:py-10'}>
              <p className={isAnimatedPage ? 'text-3xl font-black tracking-tight text-accent sm:text-4xl' : 'text-3xl font-extrabold text-primary sm:text-4xl'}>{stat.value}</p>
              <p className={isAnimatedPage ? 'mt-2 text-sm font-semibold leading-6 text-slate-200' : 'mt-2 text-sm font-semibold leading-6 text-slate-600'}>{stat.label}</p>
            </div>
          </Reveal>)}
        </div>
      </section>}

      {!hasIndustryContent && <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={products ? 'max-w-3xl' : 'grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20'}>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Designed around your business</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">A practical path to better payments</h2>
              <div className="mt-6 space-y-5 text-base leading-8 text-slate-600 sm:text-lg">
                {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            {!products && <aside className="h-fit rounded-2xl border border-primary/15 bg-mist p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-navy">Key benefits</h2>
              <ul className="mt-6 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex gap-3 leading-6 text-slate-700">
                    <CheckCircle2 aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button to="/open-an-account" className="mt-8 w-full">Open an account <ArrowRight aria-hidden="true" size={18} /></Button>
            </aside>}
          </div>
          {products && <ProductGrid products={products} categoryPath={categoryPath} categoryTitle={title} />}
        </div>
      </section>}

      {hasIndustryContent && <>
        {showIndustryPosOffer && <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal direction="scale">
            <div className="offer-shine relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-primary to-primary-dark px-7 py-8 text-white shadow-2xl shadow-primary/20 sm:px-10 sm:py-10">
              <div className="relative z-10 flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
                <div><p className="text-sm font-bold uppercase tracking-[0.22em] text-accent">Industry launch offer</p><h2 className="mt-3 text-2xl font-extrabold sm:text-4xl">Dolphin POS: $0 upfront and $49.99/month</h2><p className="mt-3 text-lg font-semibold text-white/85">Businesses processing $10K+ in monthly sales may qualify for a free POS system.</p></div>
                <Button to="/open-an-account" variant="light" className="shrink-0 rounded-full px-7 py-4 text-base">Check eligibility <ArrowRight aria-hidden="true" size={18} /></Button>
              </div>
              <PricingDisclosure dark className="relative z-10 mt-5 max-w-3xl" />
            </div>
            </Reveal>
          </div>
        </section>}

        <section className={isAnimatedPage ? 'relative overflow-hidden py-20 sm:py-28' : 'py-20 sm:py-24'}>
          {isAnimatedPage && <div className="hero-blob absolute -right-48 top-1/3 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />}
          <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${isAnimatedPage ? 'space-y-12' : 'space-y-20'}`}>
            {featureSections.map((section, sectionIndex) => <div key={section.headline} className={isAnimatedPage ? `grid items-start gap-10 rounded-[2rem] border p-6 shadow-sm transition duration-500 hover:shadow-soft sm:p-9 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16 ${sectionIndex % 2 ? 'border-primary/10 bg-mist/60 xl:grid-cols-[1.2fr_0.8fr]' : 'border-slate-200 bg-white'}` : `grid items-start gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16 ${sectionIndex % 2 ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
              <Reveal disabled={!isAnimatedPage} direction={sectionIndex % 2 ? 'right' : 'left'}><SectionHeading eyebrow={section.label} title={section.headline} description={section.intro} align="left" /></Reveal>
              <div className={`grid gap-4 sm:grid-cols-2 ${sectionIndex % 2 ? 'xl:-order-1' : ''}`}>
                {section.benefits.map((benefit, benefitIndex) => <Reveal key={benefit.title} disabled={!isAnimatedPage} direction="up" delay={benefitIndex * 80} className="h-full"><Card className={isAnimatedPage ? 'group h-full hover:-translate-y-1 hover:border-primary/30' : 'h-full hover:translate-y-0'}>
                  <CheckCircle2 aria-hidden="true" className="text-primary" size={22} />
                  <h3 className="mt-4 text-lg font-extrabold text-navy">{benefit.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{benefit.description}</p>
                </Card></Reveal>)}
              </div>
            </div>)}
          </div>
        </section>

        {audience?.items?.length > 0 && <section className="bg-navy py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal disabled={!isAnimatedPage}><SectionHeading eyebrow={audience.label} title={audience.headline} description={audience.intro} light /></Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audience.items.map((item, index) => <Reveal key={item.title} disabled={!isAnimatedPage} delay={index * 100} className="h-full"><Card className={isAnimatedPage ? 'h-full border-white/10 bg-white/5 shadow-none hover:-translate-y-2 hover:border-primary/50 hover:bg-white/10' : 'h-full border-white/10 bg-white/5 shadow-none hover:border-primary/50'}>
                <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                <p className="mt-2 leading-7 text-white/85">{item.description}</p>
              </Card></Reveal>)}
            </div>
          </div>
        </section>}

        <FAQAccordion questions={faqs} title={faqTitle} description={faqDescription} variant={isAnimatedPage ? 'industry' : 'default'} />

        {isAnimatedPage && <section className="bg-white py-20 sm:py-24"><div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8"><Reveal direction="scale"><SectionHeading eyebrow="Your next step" title={isIndustryPage ? 'Bring a better payment experience to your industry.' : 'Put the right payment solution to work.'} description={isIndustryPage ? 'Tell us how your organization operates and we will help shape a setup around your customers, staff, and goals.' : 'Tell us what you need to improve and a Dolphin specialist will help match the technology, pricing, and rollout to your business.'} /><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button to="/open-an-account" className="rounded-full px-8 py-4 text-base">Open an account <ArrowRight aria-hidden="true" size={18} /></Button><Button to="/contact" variant="outline" className="rounded-full px-8 py-4 text-base">Get a custom quote</Button></div></Reveal></div></section>}
      </>}
    </>
  )
}
