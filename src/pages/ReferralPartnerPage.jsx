import { ArrowRight, Building2, CheckCircle2, Landmark, LoaderCircle, ShoppingBag, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { formControlClasses } from '../components/ui/FormField'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { postForm } from '../utils/api'

const sources = ['Existing client', 'Online search', 'Social media', 'Online ad', 'Word of mouth', 'Other']
const services = ['Payment Processing', 'Dolphin POS', 'Other POS Systems', 'Merchant Cash Advance', 'EBT/SNAP Processing', 'ACH Processing', 'ATM Placements', 'AirVac Placements', 'Web 360+']
const steps = [
  { number: '01', title: 'Refer', text: 'Fill out the partner form and introduce a business that could benefit from DMS.' },
  { number: '02', title: 'Earn', text: 'Receive $500 when an eligible referred business completes approval and goes live.' },
  { number: '03', title: 'Grow', text: 'Keep making introductions with no limit on the number of monthly referrals.' },
]
const industries = [
  { icon: ShoppingBag, title: 'Retailers', text: 'Stores ready for faster checkout and smarter inventory.' },
  { icon: Utensils, title: 'Hospitality', text: 'Restaurants, bars, caterers, and guest-focused venues.' },
  { icon: Building2, title: 'Professional Services', text: 'Appointment, membership, and client-based businesses.' },
  { icon: Landmark, title: 'Government', text: 'Public-facing departments modernizing collections.' },
]
const initialValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  companyName: '',
  companyWebsite: '',
  source: '',
  service: '',
  consent: false,
  _hp_confirm: '',
  _hp_company_sec: '',
}

function phoneFormat(value) {
  const number = String(value || '').replace(/\D/g, '').slice(0, 10)
  if (number.length < 4) return number
  if (number.length < 7) return `(${number.slice(0, 3)}) ${number.slice(3)}`
  return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
}

function validate(values) {
  const errors = {}
  if (!values.firstName.trim()) errors.firstName = 'Please enter your first name.'
  if (!values.lastName.trim()) errors.lastName = 'Please enter your last name.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.companyName.trim()) errors.companyName = 'Please enter your company name.'
  if (!values.source) errors.source = 'Select how you know DMS.'
  if (!values.service) errors.service = 'Select a service to refer.'
  if (!values.consent) errors.consent = 'Consent is required before submitting.'
  return errors
}

export default function ReferralPartnerPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [startedAt] = useState(() => Date.now())

  function handleChange(event) {
    const { name, value, checked, type } = event.target
    const updatedValue = name === 'phone' ? phoneFormat(value) : (type === 'checkbox' ? checked : value)
    setValues((current) => ({ ...current, [name]: updatedValue }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.getElementById(`referral-${Object.keys(nextErrors)[0]}`)?.focus())
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await postForm('/referral', {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        companyName: values.companyName.trim(),
        companyWebsite: values.companyWebsite.trim(),
        source: values.source,
        service: values.service,
        consent: values.consent,
        _hp_confirm: values._hp_confirm || undefined,
        _hp_company_sec: values._hp_company_sec || undefined,
        _submission_started_at: startedAt,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit referral. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setValues(initialValues)
    setErrors({})
    setSubmitError('')
    setSubmitted(false)
  }

  return (
    <>
      <Seo title="Referral Partner" description="Refer businesses to Dolphin Merchant Services and earn $500 when an eligible referred merchant goes live." />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-dark py-20 text-white sm:py-28">
        <div className="explore-symbol absolute -right-12 -top-24 text-[18rem] font-black leading-none text-white/5 sm:text-[28rem]">$</div>
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <div>
            <p className="hero-animate-1 text-sm font-bold uppercase tracking-[0.2em] text-accent">DMS Referral Partner</p>
            <h1 className="hero-animate-2 mt-5 max-w-4xl text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">Refer businesses to DMS. Make money telling people about our products and services.</h1>
            <Button href="#referral-form" variant="light" className="hero-animate-4 mt-9 px-7 py-4 text-base">Become a Partner <ArrowRight aria-hidden="true" size={19} /></Button>
          </div>
          <div className="hero-dashboard rounded-[2rem] border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
            <p className="text-7xl font-black text-accent">$500</p>
            <p className="mt-4 text-xl font-extrabold">for every eligible referral that goes live</p>
            <p className="mt-3 leading-7 text-white/85">No monthly referral limit. Program qualification, activation, and payment terms apply.</p>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="How It Works" title="One introduction. Three simple steps." description="You make the connection. Our merchant team handles the payments conversation from there." /></Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => <Reveal key={step.number} delay={index * 130}><div className="group relative border-t-2 border-primary pt-8 transition duration-300 hover:-translate-y-2">
              <span className="text-sm font-extrabold tracking-widest text-primary">{step.number}</span>
              <h3 className="mt-4 text-2xl font-extrabold text-navy">{step.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
            </div></Reveal>)}
          </div>
        </div>
      </section>

      <section id="referral-form" className="scroll-mt-32 bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <Reveal direction="left" as="aside">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Referral Form</p>
            <h2 className="mt-3 text-4xl font-extrabold text-navy">Start with your details.</h2>
            <p className="mt-5 leading-7 text-slate-600">Tell us who you are and which solution you plan to recommend. After submission, the DMS team can follow up with program details and the next step for introducing a merchant.</p>
            <div className="mt-8 rounded-2xl bg-navy p-6 text-white"><p className="text-sm font-bold uppercase tracking-widest text-accent">Remember</p><p className="mt-3 text-xl font-extrabold">There is no cap on introductions.</p><p className="mt-2 text-sm leading-6 text-white/85">Refer one strong business or build a steady stream month after month.</p></div>
          </Reveal>

          <Reveal direction="right" delay={140} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            {submitted ? <div className="flex min-h-[560px] flex-col items-center justify-center text-center" role="status">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 aria-hidden="true" size={32} /></span>
              <h2 className="mt-6 text-3xl font-extrabold text-navy">You&apos;re on the referral list.</h2>
              <p className="mt-3 max-w-md leading-7 text-slate-600">Your partner interest has been recorded. A DMS team member can follow up with the program details and referral process.</p>
              <Button variant="outline" className="mt-7" onClick={resetForm}>Submit another request</Button>
            </div> : <form onSubmit={handleSubmit} noValidate>
              {/* Anti-spam Honeypots */}
              <div aria-hidden="true" style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
                <input type="text" name="_hp_confirm" tabIndex="-1" autoComplete="off" value={values._hp_confirm} onChange={handleChange} />
                <input type="text" name="_hp_company_sec" tabIndex="-1" autoComplete="off" value={values._hp_company_sec} onChange={handleChange} />
              </div>

              {submitError && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{submitError}</p>}
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField id="referral-firstName" label="First Name" error={errors.firstName} required><input id="referral-firstName" name="firstName" autoComplete="given-name" value={values.firstName} onChange={handleChange} className={`${formControlClasses} ${errors.firstName ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="referral-lastName" label="Last Name" error={errors.lastName} required><input id="referral-lastName" name="lastName" autoComplete="family-name" value={values.lastName} onChange={handleChange} className={`${formControlClasses} ${errors.lastName ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="referral-phone" label="Phone" error={errors.phone} required><input id="referral-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(555) 000-0000" value={values.phone} onChange={handleChange} className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="referral-email" label="Email" error={errors.email} required><input id="referral-email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="referral-companyName" label="Company Name" error={errors.companyName} required><input id="referral-companyName" name="companyName" autoComplete="organization" value={values.companyName} onChange={handleChange} className={`${formControlClasses} ${errors.companyName ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="referral-companyWebsite" label="Company Website"><input id="referral-companyWebsite" name="companyWebsite" type="url" placeholder="https://" value={values.companyWebsite} onChange={handleChange} className={formControlClasses} /></FormField>
                <FormField id="referral-source" label="How do you know DMS?" error={errors.source} required><select id="referral-source" name="source" value={values.source} onChange={handleChange} className={`${formControlClasses} ${errors.source ? 'border-rose-500' : ''}`}><option value="">Select one</option>{sources.map((source) => <option key={source}>{source}</option>)}</select></FormField>
                <FormField id="referral-service" label="Service You Are Referring" error={errors.service} required><select id="referral-service" name="service" value={values.service} onChange={handleChange} className={`${formControlClasses} ${errors.service ? 'border-rose-500' : ''}`}><option value="">Select a service</option>{services.map((service) => <option key={service}>{service}</option>)}</select></FormField>
              </div>
              <label className="mt-7 flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input id="referral-consent" name="consent" type="checkbox" checked={values.consent} onChange={handleChange} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                <span>I consent to DMS using this information to contact me about the referral program and acknowledge the <Link to="/privacy-policy" className="font-bold text-primary underline">Privacy Policy</Link>.</span>
              </label>
              {errors.consent && <p id="referral-consent-error" className="mt-2 text-sm font-semibold text-rose-600">{errors.consent}</p>}
              <Button type="submit" disabled={isSubmitting} className="mt-7">
                {isSubmitting ? <><LoaderCircle className="animate-spin" size={18} /> Submitting Referral...</> : <>Become a Referral Partner <ArrowRight aria-hidden="true" size={18} /></>}
              </Button>
              <p className="mt-4 text-xs leading-5 text-slate-500">Your information is transmitted securely to our partner success team.</p>
            </form>}
          </Reveal>
        </div>
      </section>

      <section className="bg-accent py-14 text-navy">
        <Reveal direction="scale" className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-dark">Referral value</p><h2 className="mt-2 text-4xl font-extrabold">Easiest $500 you&apos;ll ever make</h2><p className="mt-3 max-w-3xl leading-7">Help businesses create seamless in-store and online payment experiences, then earn when an eligible introduction becomes an active DMS merchant.</p></div>
          <Button href="#referral-form" className="shrink-0">Start Referring</Button>
        </Reveal>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Industries Served" title="Know a business like one of these?" /></Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {industries.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 100} className="h-full"><Card className="h-full hover:-translate-y-2 hover:border-primary/30"><Icon aria-hidden="true" className="text-primary" size={27} /><h3 className="mt-5 text-xl font-extrabold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card></Reveal>)}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-center text-white sm:py-20">
        <Reveal direction="scale" className="mx-auto max-w-4xl px-4 sm:px-6"><h2 className="text-balance text-4xl font-extrabold sm:text-5xl">Have a favorite store? Introduce them to DMS.</h2><Button href="#referral-form" variant="light" className="mt-8">Make an Introduction <ArrowRight aria-hidden="true" size={18} /></Button></Reveal>
      </section>
    </>
  )
}
