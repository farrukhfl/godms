const logos = [
  { name: 'Harbor & Pine', style: 'font-extrabold tracking-tight' },
  { name: 'NORTHLINE', style: 'font-semibold tracking-[0.18em]' },
  { name: 'Juniper Market', style: 'font-medium italic' },
  { name: 'BRIGHTON', style: 'font-black tracking-widest' },
  { name: 'Fieldstone', style: 'font-semibold tracking-tight' },
  { name: 'The Daily Table', style: 'font-bold' },
  { name: 'SUMMIT WORKS', style: 'font-medium tracking-[0.15em]' },
  { name: 'Goodwell', style: 'font-extrabold italic' },
  { name: 'Oak & Main', style: 'font-semibold' },
  { name: 'Clearwater Co.', style: 'font-bold tracking-tight' },
]

export default function LogoMarquee() {
  return (
    <section className="overflow-hidden border-y border-slate-200 bg-white py-10 sm:py-12" aria-label="Trusted businesses">
      <div className="mb-8 flex items-center gap-5 px-4 sm:px-8">
        <span className="h-px flex-1 bg-slate-200" />
        <p className="text-center text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Made for local businesses of every kind</p>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="marquee-mask overflow-hidden py-2" aria-label="Example business wordmarks">
        <div className="marquee-track flex w-max items-center motion-reduce:animate-none">
            {[...logos, ...logos].map((logo, index) => (
              <span key={`${logo.name}-${index}`} aria-hidden={index >= logos.length} className={`group mx-3 flex h-16 min-w-48 items-center justify-center whitespace-nowrap rounded-2xl border border-slate-200 bg-slate-50 px-7 text-base text-slate-400 opacity-70 shadow-sm transition duration-300 hover:border-primary/25 hover:bg-mist hover:text-primary hover:opacity-100 hover:shadow-soft sm:mx-4 sm:text-lg ${logo.style}`}>{logo.name}</span>
            ))}
        </div>
      </div>
    </section>
  )
}
