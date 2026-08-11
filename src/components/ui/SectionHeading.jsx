export default function SectionHeading({ eyebrow, title, description, align = 'center', light = false }) {
  const alignment = align === 'left' ? 'items-start text-left' : 'items-center text-center'
  const titleColor = light ? 'text-white' : 'text-navy'
  const descriptionColor = light ? 'text-white/85' : 'text-slate-600'

  return (
    <div className={`mx-auto flex max-w-3xl flex-col ${alignment}`}>
      {eyebrow && <span className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</span>}
      <h2 className={`text-balance break-words text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl ${titleColor}`}>{title}</h2>
      {description && <p className={`mt-5 break-words text-base leading-7 sm:text-lg ${descriptionColor}`}>{description}</p>}
    </div>
  )
}
