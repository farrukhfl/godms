import { Check, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import PricingDisclosure from '../components/ui/PricingDisclosure'
import { siteConfig } from '../data/siteConfig'
import ApplicationFlow from '../features/account-application/ApplicationFlow'
import { getAccessToken } from '../utils/auth'

export default function OpenAccountPage() {
  const [completedApplications, setCompletedApplications] = useState(null)
  const [authenticated, setAuthenticated] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    const handleExpiredSession = () => setAuthenticated(false)
    window.addEventListener('godms-auth-expired', handleExpiredSession)
    return () => window.removeEventListener('godms-auth-expired', handleExpiredSession)
  }, [])

  if (!authenticated) return <Navigate to="/sign-in" replace state={{ from: '/open-an-account' }} />

  return (
    <>
      <Seo title="Open an Account" description={`Complete your ${siteConfig.company.fullName} merchant account application for payment processing, equipment, and guided setup.`} />
      <section className="bg-navy py-14 text-white sm:py-20">
        <div className="mx-auto min-w-0 max-w-7xl px-3 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Merchant application</p>
          <h1 className="mt-4 max-w-4xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl">Open your merchant account from start to finish.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">Complete your business profile, choose services and equipment, and submit your agreements through one guided application.</p>
        </div>
      </section>

      <section className="bg-slate-50 py-10 sm:py-14">
        <div className="mx-auto min-w-0 max-w-7xl px-3 sm:px-6 lg:px-8">
          {completedApplications ? (
            <div className="mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft" role="status">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={40} /></span>
              <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-primary">Application submitted</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Your request was successfully submitted.</h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">Our merchant services team will review your information and contact you regarding approval, equipment, and next steps.</p>
              <p className="mt-4 text-sm font-semibold text-slate-500">Application reference{completedApplications.length > 1 ? 's' : ''}: {completedApplications.map((item) => item.applicationId).join(', ')}</p>
              <Button className="mt-8" onClick={() => setCompletedApplications(null)}>Start Another Application</Button>
            </div>
          ) : (
            <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
              <aside className="rounded-2xl border border-primary/15 bg-mist p-6 lg:sticky lg:top-32">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Before you begin</p>
                <h2 className="mt-3 text-2xl font-extrabold text-navy">Have these details ready.</h2>
                <ul className="mt-6 space-y-4 text-sm font-semibold leading-6 text-slate-700">
                  {['Legal business and tax information', 'Owner identification and contact details', 'Settlement bank account documents', 'Expected processing volumes', 'Equipment and fulfillment preferences'].map((item) => <li key={item} className="flex gap-3"><Check className="mt-0.5 shrink-0 text-primary" size={18} />{item}</li>)}
                </ul>
                <PricingDisclosure className="mt-6" />
                <p className="mt-5 text-xs leading-5 text-slate-500">Your information is submitted directly to the merchant application service. Do not refresh or close this page while uploading documents.</p>
              </aside>
              <ApplicationFlow onComplete={setCompletedApplications} />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
