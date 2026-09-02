import { ArrowRight, CheckCircle2, FileText, LoaderCircle, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { formControlClasses } from '../components/ui/FormField'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { siteConfig } from '../data/siteConfig'
import { postForm } from '../utils/api'

const work = [
  ['Credit & Debit Card Processing', 'Build dependable acceptance experiences across in-person and digital channels.'],
  ['POS Systems & Smart Terminals', 'Connect checkout with the operational tools merchants use every day.'],
  ['Online Payment Gateways', 'Help businesses sell securely beyond the physical counter.'],
  ['ACH & Recurring Billing', 'Power efficient bank payments and predictable subscription revenue.'],
  ['Fraud Prevention', 'Create safeguards that reduce risk without creating customer friction.'],
  ['Transaction Security', 'Protect payment data through modern controls and responsible operations.'],
]

const hiringSteps = ['Application Received', 'Application Shortlisted', 'Online Assessment', 'Technical Interview', 'HR Interview', 'Final Interview', 'Job Offered']
const benefits = ['Competitive Salary', 'Performance Bonuses', 'Project-based Incentives', 'Professional Development Opportunities', 'Training & Growth', 'Supportive Culture', 'Remote Flexibility']
const initialValues = {
  name: '',
  email: '',
  phone: '',
  resume: null,
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
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (!values.resume) errors.resume = 'Please choose a resume file.'
  else if (values.resume.size > 10 * 1024 * 1024) errors.resume = 'Resume file size must be less than 10MB.'
  if (!values.message.trim()) errors.message = 'Tell us briefly about the work that interests you.'
  return errors
}

export default function CareersPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [startedAt] = useState(() => Date.now())

  function handleChange(event) {
    const { name, value, files } = event.target
    const updatedValue = name === 'phone' ? phoneFormat(value) : (files ? files[0] || null : value)
    setValues((current) => ({ ...current, [name]: updatedValue }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.getElementById(`career-${Object.keys(nextErrors)[0]}`)?.focus())
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await postForm('/careers', {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
        resumeFileName: values.resume?.name || 'resume.pdf',
        _hp_confirm: values._hp_confirm || undefined,
        _hp_company_sec: values._hp_company_sec || undefined,
        _submission_started_at: startedAt,
      })
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please try again.')
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
      <Seo title="Careers" description={`Explore on-site, hybrid, and remote careers helping ${siteConfig.company.fullName} make commerce better for businesses.`} />

      <section className="relative overflow-hidden bg-navy py-24 text-white sm:py-32">
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-primary/10 lg:block" />
        <div className="explore-orbit absolute right-16 top-16 h-64 w-64 rotate-12 rounded-[3rem] border border-primary/30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="hero-animate-1 text-sm font-bold uppercase tracking-[0.2em] text-accent">Careers at DMS</p>
          <h1 className="hero-animate-2 mt-5 max-w-5xl text-balance text-5xl font-extrabold tracking-tight sm:text-7xl">We&apos;re making commerce better for everyone. Join us.</h1>
          <p className="hero-animate-3 mt-7 text-xl leading-8 text-white/85">On-site, hybrid, and remote opportunities available</p>
          <Button href="#openings" variant="light" className="hero-animate-4 mt-9 px-7 py-4 text-base">Search Jobs <ArrowRight aria-hidden="true" size={19} /></Button>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="What We Do" title="Build the infrastructure behind everyday commerce." description="Our teams combine payments, software, risk, and service to help merchants compete with confidence." /></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {work.map(([title, text], index) => <Reveal key={title} delay={(index % 3) * 100} className="h-full"><Card className="group relative h-full overflow-hidden hover:-translate-y-2 hover:border-primary/30">
              <span className="absolute right-5 top-3 text-5xl font-black text-slate-100">0{index + 1}</span>
              <h3 className="relative max-w-xs text-xl font-extrabold text-navy">{title}</h3>
              <p className="relative mt-3 leading-7 text-slate-600">{text}</p>
            </Card></Reveal>)}
          </div>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 text-center font-extrabold text-primary sm:grid-cols-4">
            {['Reliable', 'Secure', 'Optimized', 'Scale'].map((word, index) => <Reveal key={word} direction="scale" delay={index * 90} as="span" className="bg-white px-3 py-7 transition hover:bg-mist">{word}</Reveal>)}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="How We Hire" title="A clear path from application to offer." description="Each role may vary slightly, but candidates always know what comes next." /></Reveal>
          <div className="mt-14 grid gap-0 lg:grid-cols-7">
            {hiringSteps.map((step, index) => <Reveal key={step} delay={index * 90}><div className="group relative border-l-2 border-primary/25 pb-8 pl-8 lg:border-l-0 lg:border-t-2 lg:pb-0 lg:pl-0 lg:pt-8">
              <span className="absolute -left-[9px] top-0 flex h-4 w-4 rounded-full border-4 border-white bg-primary lg:-top-[9px] lg:left-0" />
              <p className="text-xs font-extrabold tracking-widest text-primary">0{index + 1}</p>
              <h3 className="mt-2 pr-4 text-sm font-extrabold leading-5 text-navy">{step}</h3>
            </div></Reveal>)}
          </div>
          <p className="mt-10 rounded-xl border border-primary/15 bg-white p-5 text-sm leading-6 text-slate-600"><strong className="text-navy">Not shortlisted this time?</strong> With your permission, we may keep promising applications on file for future roles that better match your experience.</p>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <Reveal direction="scale" className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="max-w-3xl"><p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Built For Business</p><h2 className="mt-3 text-balance text-3xl font-extrabold sm:text-5xl">Make enterprise-grade fintech accessible to small businesses everywhere.</h2></div>
          <Button href="#openings" variant="light" className="shrink-0">Lead the Change <ArrowRight aria-hidden="true" size={18} /></Button>
        </Reveal>
      </section>

      <section className="border-b border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl snap-x gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {benefits.map((benefit, index) => <Reveal key={benefit} delay={(index % 4) * 70} className="min-w-52"><div className="group h-full snap-start rounded-xl bg-mist px-5 py-4 font-bold text-navy transition hover:-translate-y-1 hover:bg-primary hover:text-white"><CheckCircle2 aria-hidden="true" className="mb-3 text-primary transition group-hover:text-white" size={20} />{benefit}</div></Reveal>)}
        </div>
      </section>

      <section id="openings" className="scroll-mt-32 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <Reveal direction="left" as="aside">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Work at DMS</p>
            <h2 className="mt-3 text-4xl font-extrabold text-navy">Bring your next chapter to commerce.</h2>
            <p className="mt-5 leading-7 text-slate-600">Share your background and the kind of role you are looking for. Our recruitment team reviews every profile and reaches out regarding matching openings.</p>
            <div className="mt-8 space-y-4 text-sm text-slate-600">
              <p className="flex items-center gap-3"><Phone aria-hidden="true" className="text-primary" size={19} /><a href={siteConfig.phone.href}>{siteConfig.phone.display}</a></p>
              <p className="flex min-w-0 items-center gap-3"><Mail aria-hidden="true" className="shrink-0 text-primary" size={19} /><a href={`mailto:${siteConfig.email}`} className="min-w-0 break-all">{siteConfig.email}</a></p>
              <p className="flex items-center gap-3"><MapPin aria-hidden="true" className="text-primary" size={19} />Chicago, IL + remote</p>
            </div>
          </Reveal>

          <Reveal direction="right" delay={140} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            {submitted ? <div className="flex min-h-[430px] flex-col items-center justify-center text-center" role="status">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 aria-hidden="true" size={32} /></span>
              <h2 className="mt-6 text-3xl font-extrabold text-navy">Your profile is submitted.</h2>
              <p className="mt-3 max-w-md leading-7 text-slate-600">Thanks for considering Dolphin Merchant Services. Our talent team will review your qualifications and contact you about relevant opportunities.</p>
              <Button variant="outline" className="mt-7" onClick={resetForm}>Submit another profile</Button>
            </div> : <form onSubmit={handleSubmit} noValidate>
              {/* Anti-spam Honeypots */}
              <div aria-hidden="true" style={{ opacity: 0, position: 'absolute', left: '-9999px', height: 0, width: 0, overflow: 'hidden' }}>
                <input type="text" name="_hp_confirm" tabIndex="-1" autoComplete="off" value={values._hp_confirm} onChange={handleChange} />
                <input type="text" name="_hp_company_sec" tabIndex="-1" autoComplete="off" value={values._hp_company_sec} onChange={handleChange} />
              </div>

              {submitError && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{submitError}</p>}
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField id="career-name" label="Name" error={errors.name} required><input id="career-name" name="name" autoComplete="name" value={values.name} onChange={handleChange} className={`${formControlClasses} ${errors.name ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="career-email" label="Email" error={errors.email} required><input id="career-email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="career-phone" label="Phone" error={errors.phone} required><input id="career-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="(555) 000-0000" value={values.phone} onChange={handleChange} className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`} /></FormField>
                <FormField id="career-resume" label="Resume (PDF/DOCX max 10MB)" error={errors.resume} required><label className={`${formControlClasses} flex cursor-pointer items-center gap-3`}><FileText aria-hidden="true" className="text-primary" size={19} /><span className="truncate">{values.resume?.name || 'Choose a file'}</span><input id="career-resume" name="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleChange} className="sr-only" /></label></FormField>
              </div>
              <div className="mt-6"><FormField id="career-message" label="Short Message" error={errors.message} required><textarea id="career-message" name="message" rows="5" value={values.message} onChange={handleChange} placeholder="Tell us what you would like to build and the roles that interest you." className={`${formControlClasses} resize-y ${errors.message ? 'border-rose-500' : ''}`} /></FormField></div>
              <Button type="submit" disabled={isSubmitting} className="mt-7">
                {isSubmitting ? <><LoaderCircle className="animate-spin" size={18} /> Submitting Profile...</> : <>Send My Profile <ArrowRight aria-hidden="true" size={18} /></>}
              </Button>
              <p className="mt-4 flex gap-2 text-xs leading-5 text-slate-500"><ShieldCheck aria-hidden="true" className="shrink-0 text-primary" size={16} />Your resume and profile are transmitted securely to our recruitment department.</p>
            </form>}
          </Reveal>
        </div>
      </section>
    </>
  )
}
