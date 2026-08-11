export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary/25 ${className}`}>
      {children}
    </div>
  )
}
