import Seo from '../components/Seo'
import { siteConfig } from '../data/siteConfig'

export default function LegalPage({ title, description, sections }) {
  return (
    <>
      <Seo title={title} description={description} />
      {import.meta.env.DEV && (
        <div className="border-b border-amber-300 bg-amber-100 px-4 py-3 text-center text-sm font-bold text-amber-950" role="note">
          Development notice: Placeholder legal content. Obtain review from qualified US payments counsel before launch.
        </div>
      )}
      <header className="bg-navy py-16 text-white sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">{siteConfig.company.fullName}</p>
          <h1 className="mt-4 text-5xl font-extrabold tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{description}</p>
          <p className="mt-5 text-sm font-semibold text-slate-400">Placeholder effective date: January 1, 2026</p>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <strong>Placeholder legal document:</strong> This draft describes common topics for a US merchant-services website. It is not legal advice and must be replaced or approved by qualified counsel before publication.
        </div>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-2xl font-extrabold text-navy">{section.heading}</h2>
              <div className="mt-4 space-y-4 leading-8 text-slate-600">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
      </article>
    </>
  )
}
