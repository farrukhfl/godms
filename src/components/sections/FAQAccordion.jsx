import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import SectionHeading from '../ui/SectionHeading'

const questions = [
  { question: 'What types of businesses do you support?', answer: 'We support retail, hospitality, professional services, healthcare, education, government, and many other business types with solutions tailored to the way they accept payments.' },
  { question: 'Can Dolphin work with my existing equipment?', answer: 'Often, yes. Our team can review your current terminals, POS setup, and processing requirements to recommend the simplest path forward.' },
  { question: 'How quickly can I start accepting payments?', answer: 'Timelines depend on your business and solution, but many merchants can complete approval and setup within a few business days.' },
  { question: 'Do you offer support after setup?', answer: 'Absolutely. Our goal is a long-term partnership, with responsive support for your account, equipment, and payment questions.' },
]

export default function FAQAccordion({ questions: customQuestions = questions, title = 'Questions, meet straightforward answers.', description = 'A few helpful details before we start building your payment setup.', variant = 'default' }) {
  const [openIndex, setOpenIndex] = useState(0)
  const isHome = variant === 'home'

  return (
    <section id="faqs" className={`${isHome ? 'bg-white py-24 sm:py-32' : 'bg-slate-50 py-20 sm:py-24'}`}>
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isHome ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <SectionHeading eyebrow="FAQs" title={title} description={description} />
        <div className={`${isHome ? 'mt-16 space-y-4' : 'mt-12 space-y-3'}`}>
          {customQuestions.map((item, index) => {
            const isOpen = openIndex === index
            const buttonId = `faq-button-${index}`
            const panelId = `faq-panel-${index}`
            return (
              <div key={item.question} className={`overflow-hidden border bg-white transition duration-300 ${isHome ? `rounded-2xl shadow-sm ${isOpen ? 'border-primary/25 shadow-soft' : 'border-slate-200 hover:border-primary/20 hover:shadow-lg'}` : 'rounded-2xl border-slate-200'}`}>
                <button id={buttonId} type="button" onClick={() => setOpenIndex(isOpen ? null : index)} className={`flex w-full items-center justify-between gap-5 text-left font-bold text-navy ${isHome ? 'p-6 text-lg sm:px-8 sm:py-7' : 'p-5 sm:p-6'}`} aria-expanded={isOpen} aria-controls={panelId}>
                  <span className="min-w-0 break-words">{item.question}</span>{isHome ? <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-primary transition ${isOpen ? 'rotate-180 bg-primary text-white' : ''}`}><ChevronDown aria-hidden="true" size={21} /></span> : <ChevronDown aria-hidden="true" className={`shrink-0 text-primary transition ${isOpen ? 'rotate-180' : ''}`} size={21} />}
                </button>
                {isOpen && <div id={panelId} role="region" aria-labelledby={buttonId}><p className={`${isHome ? 'px-6 pb-7 text-base leading-8 sm:px-8 sm:pb-8 sm:pr-24' : 'px-5 pb-5 leading-7 sm:px-6 sm:pb-6'} break-words text-slate-600`}>{item.answer}</p></div>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
