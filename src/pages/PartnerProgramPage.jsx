import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Handshake,
  Headphones,
  Landmark,
  Layers3,
  LoaderCircle,
  ShoppingBag,
  Utensils,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import FAQAccordion from '../components/sections/FAQAccordion'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import FormField, { formControlClasses } from '../components/ui/FormField'
import Reveal from '../components/ui/Reveal'
import SectionHeading from '../components/ui/SectionHeading'
import { submitAgentRequest, unwrapData } from '../features/account-application/api'

const partnerReasons = [
  { icon: WalletCards, title: 'Recurring Revenue', text: 'Earn commissions when referred merchants activate and continue processing under program terms.' },
  { icon: BarChart3, title: 'Referral Tracking', text: 'Follow introductions and conversion status through a dedicated partner portal.' },
  { icon: Headphones, title: 'Dedicated Support', text: 'Work with a partner success team that coordinates onboarding and answers program questions.' },
  { icon: Layers3, title: 'Full Merchant Solutions', text: 'Recommend payments, POS, funding, bank transfers, placement programs, and web services.' },
]

const recommendations = [
  ['Dual Pricing POS', 'Protect merchant margins with connected checkout and online sales.', '/solutions/pos'],
  ['Smart Payment Processing', 'Accept secure card payments across counters, devices, and websites.', '/solutions/credit-card-processing'],
  ['Merchant Cash Advance', 'Help eligible merchants access timely revenue-based working capital.', '/solutions/cash-advance'],
  ['ACH Processing', 'Lower costs for recurring billing and high-value bank transfers.', '/solutions/ach-processing'],
  ['EBT Processing', 'Expand eligible food retailers into SNAP and benefit acceptance.', '/solutions/ebt-processing'],
  ['ATM Placement', 'Add customer cash access and potential passive surcharge revenue.', '/solutions/atm-placement'],
  ['AirVac Placement', 'Turn suitable vehicle space into a managed earning amenity.', '/solutions/airvac'],
  ['Web 360+', 'Connect domains, hosting, design, and ecommerce through one team.', '/solutions/web-360'],
]

const process = [
  ['Apply', 'Tell us about your business, network, and partnership goals.'],
  ['Onboard', 'Complete program setup and receive access to the partner portal.'],
  ['Refer', 'Submit qualified merchant introductions and monitor their status.'],
  ['Earn', 'Commissions begin after an eligible referral activates under the program.'],
]

const industries = [
  { icon: ShoppingBag, title: 'Retailers', text: 'Connected checkout, inventory, loyalty, and digital selling.' },
  { icon: Utensils, title: 'Hospitality', text: 'Guest-first payments for dining, lodging, and mobile service.' },
  { icon: Building2, title: 'Professional Services', text: 'Bookings, invoices, retainers, and recurring client billing.' },
  { icon: Landmark, title: 'Government', text: 'Secure public collections across departments and channels.' },
]

const outcomes = [
  ['New Revenue Stream', 'Add uncapped commission potential to the relationships and expertise you already have.'],
  ['Strengthened Client Relationships', 'Solve a critical operating need with payment guidance backed by a responsive team.'],
  ['Expanded Service Offering', 'Bring clients eight practical commerce solutions without building the infrastructure yourself.'],
]

const faqs = [
  { question: 'How does the DMS Partner Program work?', answer: 'Approved partners receive onboarding and portal access, introduce eligible merchants, and can earn according to program terms after a referral completes approval and activates DMS services.' },
  { question: 'How do I submit a merchant referral?', answer: 'Partners submit merchant contact and business details through the dedicated portal or approved partner-success workflow. Consent and accurate information help DMS contact the business promptly and attribute the referral correctly.' },
  { question: 'How and when do partners get paid?', answer: 'Commission type, calculation, payment method, timing, adjustments, and eligibility are defined in the signed partner agreement. Earnings generally begin after an attributed merchant activates and satisfies applicable program conditions.' },
  { question: 'How much can a DMS partner earn?', answer: 'Earning potential is uncapped, but actual commissions depend on eligible referrals, merchant activation, selected services, processing activity, retention, and the specific compensation schedule in the partner agreement.' },
  { question: 'Do I need merchant-services experience to join?', answer: 'No prior payment-processing experience is required. DMS provides solution information, onboarding, and support, while strong business relationships and responsible introductions are the most important starting points.' },
  { question: 'What types of businesses can I refer?', answer: 'Partners can refer eligible retail, hospitality, professional service, healthcare, education, government, and other organizations that need payment processing, POS, ACH, EBT, funding, placement, or web solutions.' },
  { question: 'Do partners have to provide merchant support?', answer: 'No. DMS handles underwriting, solution setup, payment support, and the ongoing merchant-services relationship. Partners can stay focused on introductions and their existing client work.' },
  { question: 'Is there a minimum monthly referral quota?', answer: 'There is no standard minimum referral quota. Partners can participate at a pace that fits their network, subject to the activity, conduct, and account-status terms in their agreement.' },
  { question: 'How will I know whether a referral converted?', answer: 'The partner portal and partner success team provide status visibility based on program permissions, attribution rules, merchant consent, and confidentiality requirements.' },
  { question: 'Can I refer businesses that are already my clients?', answer: 'Yes. Existing clients can be referred when they are eligible, interested, and not already assigned or active with DMS under conflicting attribution. The partner team can check status before outreach.' },
]

const initialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: 'Sales Manager',
  address: '',
  companyName: '',
  companyWebsite: '',
  partnerType: '',
  networkSize: '',
  message: '',
  consent: false,
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
  if (!values.email.trim()) errors.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
  if (!values.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (values.phone.replace(/\D/g, '').length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'
  if (!values.jobTitle.trim()) errors.jobTitle = 'Please enter your job title.'
  if (!values.address.trim()) errors.address = 'Please enter your business or office address.'
  if (!values.companyName.trim()) errors.companyName = 'Please enter your company name.'
  if (!values.partnerType) errors.partnerType = 'Select the option that best describes your business.'
  if (!values.consent) errors.consent = 'Consent is required before applying.'
  return errors
}

export default function PartnerProgramPage() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationRef, setApplicationRef] = useState('')

  function handleChange(event) {
    const { name, value, checked, type } = event.target
    const updatedValue = name === 'phone' ? phoneFormat(value) : (type === 'checkbox' ? checked : value)
    setValues((current) => ({ ...current, [name]: updatedValue }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
    setApiError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setApiError('')

    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.getElementById(`partner-${Object.keys(nextErrors)[0]}`)?.focus())
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: `${values.firstName.trim()} ${values.lastName.trim()}`,
        email: values.email.trim(),
        jobTitle: values.jobTitle.trim() || 'Partner',
        phoneNumber: values.phone.trim(),
        address: values.address.trim(),
        businessWebsite: values.companyWebsite.trim() || undefined,
        tenantId: 1,
      }

      const result = await submitAgentRequest(payload)
      const data = unwrapData(result)
      setApplicationRef(data?.id ? `DMS-AGT-${data.id}` : `DMS-PARTNER-${Date.now().toString().slice(-6)}`)
      setSubmitted(true)
    } catch (err) {
      setApiError(err.message || 'Failed to submit partner application. Please verify your details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetForm() {
    setValues(initialValues)
    setErrors({})
    setApiError('')
    setSubmitted(false)
  }

  return (
    <>
      <Seo title="Partner Program" description="Join the DMS Partner Program, refer merchants to complete payment solutions, track conversions, and build recurring revenue." />

      <section className="relative overflow-hidden bg-navy py-20 text-white sm:py-28">
        <div className="hero-blob absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/30 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="hero-animate-1 text-sm font-bold uppercase tracking-[0.2em] text-accent">DMS Partner Program</p>
            <h1 className="hero-animate-2 mt-5 text-balance text-5xl font-extrabold tracking-tight sm:text-6xl">DMS Partner Program: Better Together in Merchant Services</h1>
            <p className="hero-animate-3 mt-6 text-2xl font-extrabold text-white">You bring the merchants. We&apos;ll handle the payments.</p>
            <p className="hero-animate-3 mt-4 max-w-3xl text-lg leading-8 text-white/85">Build a new revenue stream when merchants switch to DMS and continue earning as eligible referrals process under the program.</p>
            <Button href="#partner-application" className="hero-animate-4 mt-9 px-7 py-4 text-base">Become a Partner <ArrowRight aria-hidden="true" size={19} /></Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['Introduce', 'Track', 'Activate', 'Earn'].map((word, index) => <div key={word} style={{ animationDelay: `${260 + index * 120}ms` }} className={`hero-animate-4 rounded-2xl border border-white/15 p-6 transition duration-300 hover:-translate-y-2 ${index === 3 ? 'bg-accent text-navy' : 'bg-white/5 hover:bg-white/10'}`}><span className="text-xs font-black tracking-widest opacity-60">0{index + 1}</span><p className="mt-8 text-xl font-extrabold">{word}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Why Partner" title="A merchant-services program built to support your growth." /></Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{partnerReasons.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 100} className="h-full"><Card className="h-full hover:-translate-y-2 hover:border-primary/30"><Icon aria-hidden="true" className="text-primary" size={27} /><h3 className="mt-5 text-xl font-extrabold text-navy">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{text}</p></Card></Reveal>)}</div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="What You Can Recommend" title="Eight ways to solve a merchant problem." description="Lead with the need you already understand, then let DMS build the right implementation." /></Reveal>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {recommendations.map(([title, text, path], index) => <Reveal key={title} delay={(index % 4) * 80}><Link to={path} className="group block h-full bg-white p-6 transition hover:bg-mist"><h3 className="font-extrabold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">View solution <ArrowRight aria-hidden="true" className="transition group-hover:translate-x-1" size={16} /></span></Link></Reveal>)}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="How It Works" title="From application to commission in four stages." light /></Reveal>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{process.map(([title, text], index) => <Reveal key={title} delay={index * 110}><div className="border-t border-white/30 pt-6 transition duration-300 hover:-translate-y-2"><span className="font-black text-accent">0{index + 1}</span><h3 className="mt-4 text-2xl font-extrabold">{title}</h3><p className="mt-3 leading-7 text-white/85">{text}</p></div></Reveal>)}</div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="Industries Served" title="Bring value to the businesses you already know." /></Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{industries.map(({ icon: Icon, title, text }, index) => <Reveal key={title} delay={index * 100} className="h-full"><Card className="h-full hover:-translate-y-2 hover:border-primary/30"><Icon aria-hidden="true" className="text-primary" size={27} /><h3 className="mt-5 text-xl font-extrabold text-navy">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></Card></Reveal>)}</div>
        </div>
      </section>

      <section className="bg-mist py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal><SectionHeading eyebrow="What You Get" title="More value from every client conversation." /></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">{outcomes.map(([title, text], index) => <Reveal key={title} delay={index * 120}><div className="rounded-2xl bg-white p-7 shadow-soft transition duration-300 hover:-translate-y-2"><Handshake aria-hidden="true" className="text-primary" size={28} /><h3 className="mt-5 text-xl font-extrabold text-navy">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p></div></Reveal>)}</div>
          <p className="mt-8 rounded-2xl bg-navy p-6 text-center font-semibold leading-7 text-white">Partner with an established merchant-services brand backed by broad solutions, guided onboarding, and a team accountable for the merchant experience.</p>
        </div>
      </section>

      <section id="partner-application" className="scroll-mt-32 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-8">
          <Reveal direction="left" as="aside">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Partner Application</p>
            <h2 className="mt-3 text-4xl font-extrabold text-navy">Build an ongoing partnership with DMS.</h2>
            <p className="mt-5 leading-7 text-slate-600">Tell us about your business, network, and goals. The partner success team can review fit, explain attribution and compensation, and guide formal onboarding.</p>
            
            <div className="mt-8 space-y-4 rounded-2xl border border-primary/20 bg-mist p-6 text-sm text-slate-700 font-semibold">
              <p className="flex items-center gap-2 text-navy font-bold">
                <CheckCircle2 size={18} className="text-primary" /> Uncapped Earning Potential
              </p>
              <p className="flex items-center gap-2 text-navy font-bold">
                <CheckCircle2 size={18} className="text-primary" /> Dedicated Partner Portal & Tracking
              </p>
              <p className="flex items-center gap-2 text-navy font-bold">
                <CheckCircle2 size={18} className="text-primary" /> Full Suite of 8 Payment Solutions
              </p>
            </div>
          </Reveal>

          <Reveal direction="right" delay={140} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft sm:p-8">
            {submitted ? (
              <div className="flex min-h-[520px] flex-col items-center justify-center text-center" role="status">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 aria-hidden="true" size={40} />
                </span>
                <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-primary">Application Submitted</p>
                <h2 className="mt-2 text-3xl font-extrabold text-navy">Your partner request is received!</h2>
                <p className="mt-3 max-w-md leading-7 text-slate-600">
                  Thanks for your interest in partnering with Dolphin Merchant Services. A partner success specialist will review your details and contact you shortly regarding program onboarding.
                </p>
                {applicationRef && (
                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Application Reference: {applicationRef}
                  </p>
                )}
                <Button variant="outline" className="mt-7" onClick={resetForm}>
                  Submit another application
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {apiError && (
                  <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                    {apiError}
                  </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField id="partner-firstName" label="First Name" error={errors.firstName} required>
                    <input id="partner-firstName" name="firstName" autoComplete="given-name" value={values.firstName} onChange={handleChange} className={`${formControlClasses} ${errors.firstName ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="partner-lastName" label="Last Name" error={errors.lastName} required>
                    <input id="partner-lastName" name="lastName" autoComplete="family-name" value={values.lastName} onChange={handleChange} className={`${formControlClasses} ${errors.lastName ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="partner-email" label="Business Email" error={errors.email} required>
                    <input id="partner-email" name="email" type="email" autoComplete="email" value={values.email} onChange={handleChange} className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="partner-phone" label="Phone Number" error={errors.phone} required>
                    <input id="partner-phone" name="phone" type="tel" autoComplete="tel" placeholder="(555) 000-0000" value={values.phone} onChange={handleChange} className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="partner-jobTitle" label="Job Title" error={errors.jobTitle} required>
                    <input id="partner-jobTitle" name="jobTitle" placeholder="e.g. Sales Manager" value={values.jobTitle} onChange={handleChange} className={`${formControlClasses} ${errors.jobTitle ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <FormField id="partner-companyName" label="Company Name" error={errors.companyName} required>
                    <input id="partner-companyName" name="companyName" autoComplete="organization" value={values.companyName} onChange={handleChange} className={`${formControlClasses} ${errors.companyName ? 'border-rose-500' : ''}`} />
                  </FormField>
                  <div className="sm:col-span-2">
                    <FormField id="partner-address" label="Business Street Address" error={errors.address} required>
                      <input id="partner-address" name="address" placeholder="123 Main St, Suite 200, City, State ZIP" value={values.address} onChange={handleChange} className={`${formControlClasses} ${errors.address ? 'border-rose-500' : ''}`} />
                    </FormField>
                  </div>
                  <FormField id="partner-companyWebsite" label="Company Website (Optional)">
                    <input id="partner-companyWebsite" name="companyWebsite" type="url" placeholder="https://example.com" value={values.companyWebsite} onChange={handleChange} className={formControlClasses} />
                  </FormField>
                  <FormField id="partner-partnerType" label="Business Type" error={errors.partnerType} required>
                    <select id="partner-partnerType" name="partnerType" value={values.partnerType} onChange={handleChange} className={`${formControlClasses} ${errors.partnerType ? 'border-rose-500' : ''}`}>
                      <option value="">Select one</option>
                      {['Consultant or Advisor', 'Software or Technology Provider', 'Financial Professional', 'Association or Community', 'Sales Organization', 'Other'].map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </FormField>
                </div>

                <div className="mt-6">
                  <FormField id="partner-message" label="Partnership Goals & Client Network (Optional)">
                    <textarea id="partner-message" name="message" rows="4" value={values.message} onChange={handleChange} placeholder="Tell us briefly about your clients, industry focus, and partnership goals." className={`${formControlClasses} resize-y`} />
                  </FormField>
                </div>

                <label className="mt-7 flex items-start gap-3 text-sm leading-6 text-slate-600">
                  <input id="partner-consent" name="consent" type="checkbox" checked={values.consent} onChange={handleChange} className="mt-1 h-4 w-4 shrink-0 accent-primary" />
                  <span>I consent to DMS contacting me about the Partner Program and acknowledge the <Link to="/privacy-policy" className="font-bold text-primary underline">Privacy Policy</Link>.</span>
                </label>
                {errors.consent && <p id="partner-consent-error" className="mt-2 text-sm font-semibold text-rose-600">{errors.consent}</p>}

                <Button type="submit" disabled={isSubmitting} className="mt-7">
                  {isSubmitting ? (
                    <><LoaderCircle className="animate-spin" size={18} /> Submitting Application...</>
                  ) : (
                    <>Apply to Partner <ArrowRight aria-hidden="true" size={18} /></>
                  )}
                </Button>
                <p className="mt-4 text-xs leading-5 text-slate-500">Your information is transmitted securely to our partner success department.</p>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <FAQAccordion questions={faqs} title="Partner questions, answered before you apply" description="Learn how referrals, attribution, merchant support, and earning potential work." variant="industry" />

      <section className="bg-navy py-16 text-center text-white sm:py-20"><Reveal direction="scale" className="mx-auto max-w-4xl px-4 sm:px-6"><h2 className="text-balance text-4xl font-extrabold sm:text-5xl">Have more questions? Our partner success team is here to help.</h2><Button to="/contact" variant="light" className="mt-8">Contact Us <ArrowRight aria-hidden="true" size={18} /></Button></Reveal></section>
    </>
  )
}
