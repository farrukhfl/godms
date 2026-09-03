import { HelpCircle } from 'lucide-react'
import { useState } from 'react'

export const formControlClasses = 'mt-2 min-w-0 max-w-full w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-navy shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10'

export default function FormField({ id, label, error, required = false, tooltip, children }) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="min-w-0 max-w-full">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-bold text-navy flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-primary" aria-hidden="true">*</span>}
          {tooltip && (
            <div className="relative inline-flex items-center">
              <button
                type="button"
                tabIndex="-1"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-primary transition-colors focus:outline-none ml-1 p-0.5"
                aria-label="Field information"
              >
                <HelpCircle size={14} />
              </button>
              {showTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 rounded-xl border border-slate-200 bg-navy p-2.5 text-xs font-normal text-white shadow-xl z-50 pointer-events-none text-left">
                  <p className="leading-relaxed">{tooltip}</p>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
                </div>
              )}
            </div>
          )}
        </label>
      </div>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 break-words text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  )
}
