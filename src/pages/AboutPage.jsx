import { ArrowRight, Handshake, Lightbulb, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { solutions } from '../data/navigation'
import { siteConfig } from '../data/siteConfig'

const values = [
  { title: 'Simple', text: 'Clear tools, straightforward terms, and an easier path to getting paid.' },
  { title: 'Reliable', text: 'Payment technology and people businesses can count on every day.' },
  { title: 'Flexible', text: 'Solutions shaped around each merchant instead of a one-size plan.' },
  { title: 'Personal', text: 'Responsive guidance from a team that knows the business behind the account.' },
]

const serviceDescriptions = {
  '/solutions/credit-card-processing': 'Secure in-person, online, and mobile acceptance with margin-protecting dual pricing.',
  '/solutions/pos': 'Connected checkout, inventory, reporting, apps, and ecommerce in one system.',
  '/solutions/atm-placement': 'Managed ATM programs that add customer convenience and passive revenue.',
  '/solutions/airvac': 'Turnkey air and vacuum placement for qualified vehicle-focused properties.',
  '/solutions/cash-advance': 'Revenue-based working capital for timely investments and operating needs.',
  '/solutions/ebt-processing': 'Authorization guidance and dependable SNAP/EBT checkout technology.',
  '/solutions/ach-processing': 'Lower-cost bank transfers for recurring billing, invoices, and disbursements.',
  '/solutions/web-360': 'Domains, hosting, custom websites, and integrated digital commerce.',
}

const serviceOrder = [
  '/solutions/credit-card-processing', '/solutions/pos', '/solutions/atm-placement', '/solutions/airvac',
  '/solutions/cash-advance', '/solutions/ebt-processing', '/solutions/ach-processing', '/solutions/web-360',
]

const principles = [
  { icon: ShieldCheck, title: 'Trust', text: 'Doing right by your business every step of the way.' },
  { icon: Lightbulb, title: 'Innovation', text: 'Finding smarter ways to help you keep growing.' },
  { icon: Handshake, title: 'Partnership', text: 'Standing beside you, not just processing payments.' },
]

export default function AboutPage() {
  const orderedServices = serviceOrder.map((path) => solutions.find((service) => service.path === path))

  return (
    <>
      <Seo title="About Us" description={`Learn how ${siteConfig.company.fullName} combines reliable payment technology with personal support to help businesses grow.`} />

      <section className="relative overflow-hidden bg-navy pb-0 pt-20 text-white sm:pt-28">
        <div className="hero-blob absolute -right-32 -top-28 h-96 w-96 rounded-full border-[70px] border-primary/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl pb-16 sm:pb-20">
            <p className="hero-animate-1 text-sm font-bold uppercase tracking-[0.2em] text-accent">About Dolphin Merchant Services</p>
            <h1 className="hero-animate-2 mt-5 text-balance text-6xl font-extrabold tracking-tight sm:text-7xl">Payments Made Better</h1>
            <p className="hero-animate-3 mt-7 max-w-3xl text-xl leading-9 text-white/85">Reliable payment processing, practical POS technology, and personal support help businesses get paid faster and operate smarter.</p>
          </div>
          <div className="grid gap-px overflow-hidden border-t border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => <div key={value.title} style={{ animationDelay: `${420 + index * 100}ms` }} className="hero-animate-4 bg-primary px-5 py-7 transition duration-300 hover:bg-primary-dark">
              <p className="text-xl font-extrabold text-white">{value.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/85">{value.text}</p>
            </div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20 lg:px-8">
          <Reveal direction="left">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Our Story</p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">How It Started</h2>
            <p className="mt-5 text-lg font-bold leading-8 text-primary">Built from small-business roots in 2015.</p>
          </Reveal>
          <Reveal direction="right" delay={140} className="space-y-5 text-lg leading-8 text-slate-600">
            <p>Dolphin Merchant Services began with a simple observation: small businesses were being asked to choose between powerful financial technology and the responsive service they deserved. Enterprise tools existed, but they often arrived with complexity, unclear costs, and support that felt far removed from the counter.</p>
            <p>Founded in 2015, Dolphin set out to close that gap. The mission was to make enterprise-grade fintech accessible to independent merchants, growing teams, and community organizations without losing the clarity and personal attention that make a partnership useful.</p>
            <p>Today, we see ourselves as more than a payment provider. We help businesses connect checkout, operations, funding, and digital growth so every transaction can become part of a stronger future.</p>
          </Reveal>
        </div>
      </section>

      <section id="services" className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Our Services" title="One partner for the ways business moves." description="Start with payments, then connect the technology and services that support what comes next." /></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {orderedServices.map(({ label, path, icon: Icon }, index) => <Reveal key={path} delay={(index % 4) * 90} className="h-full"><Card className="group flex h-full flex-col hover:-translate-y-2 hover:border-primary/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" size={23} /></span>
              <h3 className="mt-5 text-xl font-extrabold text-navy">{label === 'Credit Card Processing' ? 'Payment Processing' : label}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{serviceDescriptions[path]}</p>
              <Link to={path} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">Explore service <ArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" size={17} /></Link>
            </Card></Reveal>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Our Values" title="The principles behind every partnership." /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 120}><div className="group border-t-4 border-primary bg-white px-2 py-7 transition duration-300 hover:-translate-y-2 hover:shadow-soft md:px-7">
              <span className="text-sm font-extrabold text-slate-300">0{index + 1}</span>
              <Icon aria-hidden="true" className="mt-8 text-primary" size={30} />
              <h3 className="mt-5 text-2xl font-extrabold text-navy">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{text}</p>
            </div></Reveal>)}
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <Reveal direction="scale" className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Our Vision</p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">Simpler payments. Smarter technology. Business that stays personal.</h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">We are building toward a future where sophisticated commerce tools feel intuitive and every business can use better data, connected systems, and flexible payments to move forward. As technology evolves, our relationship with merchants will remain grounded in real conversations and shared goals.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/solutions/pos">Browse Our Services <ArrowRight aria-hidden="true" size={18} /></Button>
            <Button to="/open-an-account" variant="outline">Open an Account</Button>
          </div>
        </Reveal>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal direction="scale"><div className="offer-shine relative flex flex-col items-center justify-between gap-7 overflow-hidden rounded-[2rem] bg-primary px-7 py-12 text-center text-white shadow-2xl shadow-primary/20 sm:px-12 lg:flex-row lg:text-left">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Build what is next</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Let&apos;s redefine payments together</h2></div>
            <Button to="/contact" variant="light" className="shrink-0">Contact Us <ArrowRight aria-hidden="true" size={18} /></Button>
          </div></Reveal>
        </div>
      </section>
    </>
  )
}
