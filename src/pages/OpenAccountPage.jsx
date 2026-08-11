import { ArrowRight, Check, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import FormField, { formControlClasses } from '../components/ui/FormField'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import { siteConfig } from '../data/siteConfig'
import { postForm } from '../utils/api'

const initialValues = { name: '', businessName: '', phone: '', email: '', monthlyVolume: '', contactMethod: '', website: '' }
const volumeOptions = ['Under $10,000', '$10,000 - $25,000', '$25,000 - $50,000', '$50,000 - $100,000', 'Over $100,000', 'Not processing yet']

function validate(values) {
  const errors = {}
  if (!values.name.trim()) errors.name = 'Please enter your name.'
  if (!values.businessName.trim()) errors.businessName = 'Please enter your business name.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.monthlyVolume) errors.monthlyVolume = 'Select your estimated monthly processing volume.'
  if (!values.contactMethod) errors.contactMethod = 'Choose how you would prefer us to contact you.'
  return errors
}

export default function OpenAccountPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    if (submitError) setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      const fieldIds = { name: 'account-name', businessName: 'account-businessName', phone: 'account-phone', email: 'account-email', monthlyVolume: 'monthlyVolume', contactMethod: 'contact-method-phone' }
      requestAnimationFrame(() => document.getElementById(fieldIds[Object.keys(nextErrors)[0]])?.focus())
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      await postForm('/api/account-applications', {
        name: values.name,
        businessName: values.businessName,
        phone: values.phone,
        email: values.email,
        monthlyVolume: values.monthlyVolume,
        preferredContact: values.contactMethod,
        website: values.website,
      })
      setSubmitted(true)
    } catch (error) {
      const { preferredContact, ...apiErrors } = error.fieldErrors || {}
      const nextApiErrors = { ...apiErrors, ...(preferredContact ? { contactMethod: preferredContact } : {}) }
      setErrors(nextApiErrors)
      setSubmitError(error.message)
      if (Object.keys(nextApiErrors).length > 0) {
        const fieldIds = { name: 'account-name', businessName: 'account-businessName', phone: 'account-phone', email: 'account-email', monthlyVolume: 'monthlyVolume', contactMethod: 'contact-method-phone' }
        requestAnimationFrame(() => document.getElementById(fieldIds[Object.keys(nextApiErrors)[0]])?.focus())
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Seo title="Open an Account" description={`Start your ${siteConfig.company.fullName} account application for POS and payment processing with fast approval and guided setup.`} />
      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Start processing with {siteConfig.company.shortName}</p>
          <h1 className="mt-4 max-w-4xl text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">Open your merchant account without the runaround.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">Share a few business details and our team will contact you to complete the application and recommend the right setup.</p>
        </div>
      </section>

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16 lg:px-8">
          <aside className="lg:sticky lg:top-36">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Why open with {siteConfig.company.shortName}</p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy">A quick start with support at every step.</h2>
            <ul className="mt-7 space-y-4">
              {[`$0 upfront ${siteConfig.company.posName} option`, 'Approval and setup in as little as 24 hours', 'No long-term lock-in', 'A dedicated payments support team'].map((item) => <li key={item} className="flex gap-3 font-semibold text-slate-700"><Check aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={20} />{item}</li>)}
            </ul>
            <PricingDisclosure className="mt-6" />
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            {submitted ? (
              <div className="flex min-h-[460px] flex-col items-center justify-center text-center" role="status">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 aria-hidden="true" size={32} /></span>
                <h2 className="mt-6 text-3xl font-extrabold text-navy">Your request is in.</h2>
                <p className="mt-3 max-w-md leading-7">A {siteConfig.company.shortName} payments specialist will contact you by {values.contactMethod.toLowerCase()} to continue your account application.</p>
                <Button variant="outline" className="mt-7" onClick={() => { setValues(initialValues); setErrors({}); setSubmitError(''); setSubmitted(false) }}>Start another request</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <input type="text" name="website" value={values.website} onChange={handleChange} tabIndex="-1" autoComplete="off" aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden" />
                {submitError && <p role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{submitError}</p>}
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField id="account-name" label="Name" error={errors.name} required>
                    <input id="account-name" name="name" type="text" autoComplete="name" required value={values.name} onChange={handleChange} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'account-name-error' : undefined} className={`${formControlClasses} ${errors.name ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="account-businessName" label="Business Name" error={errors.businessName} required>
                    <input id="account-businessName" name="businessName" type="text" autoComplete="organization" required value={values.businessName} onChange={handleChange} aria-invalid={Boolean(errors.businessName)} aria-describedby={errors.businessName ? 'account-businessName-error' : undefined} className={`${formControlClasses} ${errors.businessName ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="account-phone" label="Phone" error={errors.phone} required>
                    <input id="account-phone" name="phone" type="tel" autoComplete="tel" required placeholder="(555) 555-0123" value={values.phone} onChange={handleChange} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'account-phone-error' : undefined} className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="account-email" label="Email" error={errors.email} required>
                    <input id="account-email" name="email" type="email" autoComplete="email" required placeholder="you@business.com" value={values.email} onChange={handleChange} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'account-email-error' : undefined} className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`} />
                  </FormField>
                </div>
                <div className="mt-6">
                  <FormField id="monthlyVolume" label="Monthly Processing Volume" error={errors.monthlyVolume} required>
                    <select id="monthlyVolume" name="monthlyVolume" required value={values.monthlyVolume} onChange={handleChange} aria-invalid={Boolean(errors.monthlyVolume)} aria-describedby={errors.monthlyVolume ? 'monthlyVolume-error' : undefined} className={`${formControlClasses} ${errors.monthlyVolume ? 'border-rose-500' : ''}`}>
                      <option value="">Select estimated volume</option>
                      {volumeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </FormField>
                </div>
                <fieldset className="mt-6" aria-invalid={Boolean(errors.contactMethod)} aria-describedby={errors.contactMethod ? 'contactMethod-error' : undefined}>
                  <legend className="text-sm font-bold text-navy">Preferred Contact Method <span className="text-primary" aria-hidden="true">*</span></legend>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {['Phone', 'Email'].map((method) => (
                      <label key={method} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-semibold transition focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 ${values.contactMethod === method ? 'border-primary bg-mist text-primary-dark' : 'border-slate-300 text-slate-700 hover:border-primary/50'}`}>
                        <input id={`contact-method-${method.toLowerCase()}`} type="radio" name="contactMethod" value={method} required checked={values.contactMethod === method} onChange={handleChange} className="h-4 w-4 accent-primary" />{method}
                      </label>
                    ))}
                  </div>
                  {errors.contactMethod && <p id="contactMethod-error" className="mt-2 text-sm font-semibold text-rose-600">{errors.contactMethod}</p>}
                </fieldset>
                <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="mt-8 w-full py-4 text-base disabled:cursor-wait disabled:opacity-70 sm:w-auto">{isSubmitting ? 'Submitting Request...' : 'Request My Account'} <ArrowRight aria-hidden="true" size={18} /></Button>
                <p className="mt-4 text-xs leading-5 text-slate-500">Submitting this form starts a conversation and does not guarantee account approval or create a processing agreement.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
