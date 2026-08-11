import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Seo from '../components/Seo'
import FAQAccordion from '../components/sections/FAQAccordion'
import ProductGrid from '../components/sections/ProductGrid'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../data/siteConfig'

const fallbackBody = [
  `${siteConfig.company.fullName} provides dependable payment technology and hands-on guidance for businesses choosing new equipment. Our team helps identify compatible products based on your processing environment, checkout flow, and day-to-day needs.`,
  'Explore this category as a starting point, then speak with a specialist to confirm compatibility, availability, pricing, and the best configuration for your business.',
]

const fallbackBenefits = ['Equipment selected for your payment environment', 'Compatibility guidance before purchase', 'Options for growing and established businesses', 'Support from payment technology specialists']

export default function CategoryPageTemplate({ title, heroTitle, description, type, icon: Icon, body = fallbackBody, benefits = fallbackBenefits, metaDescription, products, heroImage, heroImageAlt, showPricingDisclosure = false, stats, featureSections, audience, faqs, faqTitle, faqDescription, showIndustryPosOffer = false }) {
  const hasIndustryContent = featureSections?.length > 0

  return (
    <>
      <Seo title={title} description={metaDescription || description} />
      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[55px] border-primary/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={heroImage ? 'grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16' : 'max-w-3xl'}>
            <div>
              <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white"><Icon aria-hidden="true" size={28} /></span>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{type}</p>
              <h1 className="mt-4 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">{heroTitle || title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{description}</p>
              <Button to="/contact" className="mt-8 px-7 py-4 text-base">Talk to a payment expert <ArrowRight aria-hidden="true" size={19} /></Button>
              {showPricingDisclosure && <PricingDisclosure dark className="mt-5 max-w-2xl" />}
            </div>
            {heroImage && <img src={heroImage} alt={heroImageAlt} loading="lazy" decoding="async" width="900" height="700" className="h-72 w-full rounded-2xl object-cover shadow-2xl shadow-black/20 sm:h-96" />}
          </div>
        </div>
      </section>

      {stats?.length > 0 && <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:px-6 lg:grid-cols-3 lg:divide-x lg:divide-y-0 lg:px-8">
          {stats.map((stat) => <div key={stat.label} className="px-6 py-8 text-center sm:py-10">
            <p className="text-3xl font-extrabold text-primary sm:text-4xl">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{stat.label}</p>
          </div>)}
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
          {products && <ProductGrid products={products} />}
        </div>
      </section>}

      {hasIndustryContent && <>
        {showIndustryPosOffer && <section className="bg-primary py-5 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
            <p className="text-lg font-extrabold">Dolphin POS: $0 upfront and $49.99/month</p>
            <p className="font-semibold text-white">$10K+ monthly sales = free POS</p>
          </div>
        </section>}

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8">
            {featureSections.map((section, sectionIndex) => <div key={section.headline} className={`grid items-start gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16 ${sectionIndex % 2 ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
              <SectionHeading eyebrow={section.label} title={section.headline} description={section.intro} align="left" />
              <div className={`grid gap-4 sm:grid-cols-2 ${sectionIndex % 2 ? 'xl:-order-1' : ''}`}>
                {section.benefits.map((benefit) => <Card key={benefit.title} className="h-full hover:translate-y-0">
                  <CheckCircle2 aria-hidden="true" className="text-primary" size={22} />
                  <h3 className="mt-4 text-lg font-extrabold text-navy">{benefit.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{benefit.description}</p>
                </Card>)}
              </div>
            </div>)}
          </div>
        </section>

        {audience?.items?.length > 0 && <section className="bg-navy py-16 text-white sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={audience.label} title={audience.headline} description={audience.intro} light />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audience.items.map((item) => <Card key={item.title} className="border-white/10 bg-white/5 shadow-none hover:border-primary/50">
                <h3 className="text-lg font-extrabold text-white">{item.title}</h3>
                <p className="mt-2 leading-7 text-white/85">{item.description}</p>
              </Card>)}
            </div>
          </div>
        </section>}

        <FAQAccordion questions={faqs} title={faqTitle} description={faqDescription} />
      </>}
    </>
  )
}
