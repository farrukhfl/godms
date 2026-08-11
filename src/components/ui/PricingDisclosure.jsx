import { Info } from 'lucide-react'

export default function PricingDisclosure({ dark = false, className = '' }) {
  return (
    <p className={`flex items-start gap-2 text-xs leading-5 ${dark ? 'text-white/85' : 'text-slate-500'} ${className}`}>
      <Info aria-hidden="true" size={15} className={`mt-0.5 shrink-0 ${dark ? 'text-accent' : 'text-primary'}`} />
      <span className="min-w-0 break-words">Rates, fees, equipment availability, and offer terms are subject to change, business qualification, and applicable agreement terms.</span>
    </p>
  )
}
