export const formControlClasses = 'mt-2 min-w-0 max-w-full w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-navy shadow-sm transition placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10'

export default function FormField({ id, label, error, required = false, children }) {
  return (
    <div className="min-w-0 max-w-full">
      <label htmlFor={id} className="text-sm font-bold text-navy">
        {label}{required && <span className="ml-1 text-primary" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-2 break-words text-sm font-semibold text-rose-600">{error}</p>}
    </div>
  )
}
