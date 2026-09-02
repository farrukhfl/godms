import { Star } from 'lucide-react'
import Reveal from '../ui/Reveal'
import SectionHeading from '../ui/SectionHeading'

const testimonials = [
  {
    name: 'Jordan Miller',
    business: 'Coastal Retail Group',
    quote: 'The switch to Dolphin POS was seamless. Our checkout queues move 30% faster, and eliminating unnecessary processing fees saved us thousands in our first quarter.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Marcus Turner',
    business: 'The Rustic Oak Bistro',
    quote: 'Tableside payments and automated tip prompts transformed our dining floor. Having dedicated 24/7 technical support gave our management team complete peace of mind.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
  {
    name: 'Elena Ramirez',
    business: 'Apex Professional Services',
    quote: 'Our clients love the flexible payment links and recurring ACH drafts. Next-day settlement helped us manage working capital without friction.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
]

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-mist py-24 sm:py-32">
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal><SectionHeading eyebrow="Merchant Success" title="Trusted by growing businesses nationwide." description="See how business owners simplify checkout, defend profit margins, and scale with Dolphin Merchant Services." /></Reveal>
        <div className="relative mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 130} className="h-full">
            <figure className="group flex h-full min-h-[25rem] flex-col rounded-[1.75rem] border border-white bg-white p-7 shadow-lg shadow-navy/5 transition duration-300 hover:-translate-y-2 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 sm:p-8">
              <div className="flex items-center justify-between"><div className="flex gap-1 text-primary" aria-label="5 out of 5 stars">
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} aria-hidden="true" size={18} fill="currentColor" />)}
              </div><span className="text-5xl font-black leading-none text-primary/15">&ldquo;</span></div>
              <blockquote className="mt-7 flex-1 text-xl font-semibold leading-9 tracking-tight text-navy">{testimonial.quote}&rdquo;</blockquote>
              <figcaption className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
                <img src={testimonial.image} alt={testimonial.name} loading="lazy" decoding="async" width="56" height="56" className="h-14 w-14 rounded-full object-cover ring-4 ring-mist transition group-hover:ring-primary/10" />
                <span><span className="block font-extrabold text-navy">{testimonial.name}</span><span className="mt-1 block text-xs text-slate-500">{testimonial.business}</span></span>
              </figcaption>
            </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
