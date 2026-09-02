import { ArrowRight, CheckCircle2, CreditCard, Globe2, Handshake, Mail, MessageCircle, MessageSquareText, MonitorSmartphone, Phone, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { formControlClasses } from '../components/ui/FormField'
import SectionHeading from '../components/ui/SectionHeading'
import { solutions } from '../data/navigation'
import { siteConfig } from '../data/siteConfig'
import { postForm } from '../utils/api'

const initialValues = {
  name: '',
  businessName: '',
  email: '',
  phone: '',
  service: '',
  message: '',
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
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.businessName.trim()) errors.businessName = 'Please enter your business name.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (!values.service) errors.service = 'Select the service you are interested in.'
  if (!values.message.trim()) errors.message = 'Tell us a little about what your business needs.'
  return errors
}

export default function ContactPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [startedAt] = useState(() => Date.now())

  function handleChange(event) {
    const { name, value } = event.target
    const updatedValue = name === 'phone' ? phoneFormat(value) : value
    setValues((current) => ({ ...current, [name]: updatedValue }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => document.getElementById(Object.keys(nextErrors)[0])?.focus())
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await postForm('/contact-inquiry', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        businessName: values.businessName.trim(),
        message: values.message.trim(),
        service: values.service,
        solution: values.service,
        _hp_confirm: values._hp_confirm || undefined,
        _hp_company_sec: values._hp_company_sec || undefined,
        _submission_started_at: startedAt,
      })
      setSubmitted(true)
    } catch (error) {
      const nextApiErrors = error.fieldErrors || {}
      setErrors(nextApiErrors)
      setSubmitError(error.message)
      if (Object.keys(nextApiErrors).length > 0) {
        requestAnimationFrame(() => document.getElementById(Object.keys(nextApiErrors)[0])?.focus())
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title="Contact Us" description={`Contact ${siteConfig.company.fullName} for a payment processing quote, POS consultation, or help choosing the right merchant service.`} />
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <aside>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Contact Form</p>
            <h2 className="mt-3 text-4xl font-extrabold text-navy">Get in touch with a payments specialist.</h2>
            <p className="mt-5 leading-7 text-slate-600">Share what your business needs and our team will review the request, explain relevant options, and help identify a practical next step.</p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4"><MessageSquareText aria-hidden="true" className="mt-1 shrink-0 text-primary" /><div><h3 className="font-bold text-navy">We review your request</h3><p className="mt-1 text-sm leading-6">A specialist looks at your business type, service interest, and payment needs.</p></div></div>
              <div className="flex gap-4"><ShieldCheck aria-hidden="true" className="mt-1 shrink-0 text-primary" /><div><h3 className="font-bold text-navy">We explain your options</h3><p className="mt-1 text-sm leading-6">Get clear answers about equipment, processing, setup, and available pricing structures.</p></div></div>
            </div>
            <p className="mt-8 rounded-xl bg-white p-4 text-sm leading-6 text-slate-500">Fields marked with an asterisk are required. Your information is only used to respond to this request.</p>
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            {submitted ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 aria-hidden="true" size={32} /></span>
                <h2 className="mt-6 text-3xl font-extrabold text-navy">Thanks for reaching out.</h2>
                <p className="mt-3 max-w-md leading-7">Your message has been recorded. A {siteConfig.company.shortName} payments specialist will follow up using the contact details you provided.</p>
                <Button variant="outline" className="mt-7" onClick={() => { setValues(initialValues); setErrors({}); setSubmitError(''); setSubmitted(false) }}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Anti-spam Honeypots */}
                <div aria-hidden="true" style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
                  <input type="text" name="_hp_confirm" tabIndex="-1" autoComplete="off" value={values._hp_confirm} onChange={handleChange} />
                  <input type="text" name="_hp_company_sec" tabIndex="-1" autoComplete="off" value={values._hp_company_sec} onChange={handleChange} />
                </div>

                {submitError && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{submitError}</p>}
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField id="name" label="Name" error={errors.name} required>
                    <input id="name" name="name" type="text" autoComplete="name" required value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} className={`${formControlClasses} ${errors.name ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="businessName" label="Business Name" error={errors.businessName} required>
                    <input id="businessName" name="businessName" type="text" autoComplete="organization" required value={values.businessName} onChange={handleChange} aria-invalid={Boolean(errors.businessName)} aria-describedby={errors.businessName ? 'businessName-error' : undefined} className={`${formControlClasses} ${errors.businessName ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="email" label="Email" error={errors.email} required>
                    <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@business.com" value={values.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="phone" label="Phone Number" error={errors.phone} required>
                    <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" required placeholder="(555) 000-0000" value={values.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`} />
                  </FormField>
                </div>
                <div className="mt-6">
                  <FormField id="service" label="Service Interested In" error={errors.service} required>
                    <select id="service" name="service" required value={values.service} onChange={handleChange} aria-invalid={Boolean(errors.service)} aria-describedby={errors.service ? 'service-error' : undefined} className={`${formControlClasses} ${errors.service ? 'border-rose-500' : ''}`}>
                      <option value="">Select a service</option>
                      {solutions.map((solution) => <option key={solution.path} value={solution.label === 'POS Solutions' ? 'POS' : solution.label}>{solution.label}</option>)}
                    </select>
                  </FormField>
                </div>
                <div className="mt-6">
                  <FormField id="message" label="Message" error={errors.message} required>
                    <textarea id="message" name="message" rows="5" required placeholder="Tell us about your current setup and what you would like to improve." value={values.message} onChange={handleChange} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'message-error' : undefined} className={`${formControlClasses} resize-y ${errors.message ? 'border-rose-500' : ''}`} />
                  </FormField>
                </div>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="mt-7 w-full py-4 text-base disabled:cursor-wait disabled:opacity-70 sm:w-auto">{isSubmitting ? 'Sending Request...' : 'Send My Request'} <ArrowRight aria-hidden="true" size={18} /></Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border-[55px] border-primary/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Contact {siteConfig.company.shortName}</p>
          <h1 className="mt-4 max-w-4xl text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">Got questions? We&apos;ve got answers.</h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-white/85">We&apos;re here to help your business grow - from sales assistance to expert advice, whatever you need.</p>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">24/7/365 Support</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Choose the way you want to reach us.</h2></div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">Support resources are available around the clock, with our actively staffed sales line open during the business hours shown below.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <Card className="h-full hover:translate-y-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Phone aria-hidden="true" size={23} /></span>
              <h3 className="mt-5 text-xl font-extrabold text-navy">{siteConfig.phone.label}</h3>
              <a href={siteConfig.phone.href} className="mt-3 block text-2xl font-extrabold text-primary hover:text-primary-dark">{siteConfig.phone.display}</a>
              <p className="mt-2 text-sm leading-6 text-slate-600">{siteConfig.phone.hours}</p>
            </Card>
            <Card className="h-full hover:translate-y-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mail aria-hidden="true" size={23} /></span>
              <h3 className="mt-5 text-xl font-extrabold text-navy">Email Us</h3>
              <a href={`mailto:${siteConfig.email}`} className="mt-3 block break-all text-xl font-extrabold text-primary hover:text-primary-dark">{siteConfig.email}</a>
              <p className="mt-2 text-sm leading-6 text-slate-600">{siteConfig.emailResponseTime}</p>
            </Card>
            <Card className="h-full hover:translate-y-0">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageCircle aria-hidden="true" size={23} /></span>
              <h3 className="mt-5 text-xl font-extrabold text-navy">Start a Chat</h3>
              <p className="mt-3 text-2xl font-extrabold text-navy">Live Chat</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Available on our website. Live chat integration is coming soon.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="How We Can Help" title="Start with the business need. We&apos;ll help with the rest." description="Talk with a team that understands the connection between payment acceptance, operations, specialty requirements, and digital growth." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { icon: CreditCard, title: 'Payment Processing', text: 'Cards, ACH, digital wallets, and more.' },
              { icon: MonitorSmartphone, title: 'POS Solutions', text: 'Finding the right POS for your business.' },
              { icon: Handshake, title: 'Service Matching', text: 'Matching merchant services to business goals.' },
              { icon: ShieldCheck, title: 'Specialty Support', text: 'High-risk, ACH, EBT, and specialty cases.' },
              { icon: Globe2, title: 'Digital Setup', text: 'Hosting, domains, and digital add-ons.' },
            ].map(({ icon: Icon, title, text }) => <Card key={title} className="h-full hover:translate-y-0">
              <Icon aria-hidden="true" className="text-primary" size={25} />
              <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </Card>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-7 rounded-[2rem] bg-primary px-7 py-12 text-white sm:px-12 lg:flex-row lg:items-center">
            <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Ready to get started?</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Talk to a payments expert today</h2></div>
            <Button to="/open-an-account" variant="light" className="shrink-0">Open an Account <ArrowRight aria-hidden="true" size={18} /></Button>
          </div>
        </div>
      </section>
    </>
  )
}
