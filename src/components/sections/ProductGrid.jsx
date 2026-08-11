import { PackageOpen } from 'lucide-react'
import Button from '../ui/Button'
import PricingDisclosure from '../ui/PricingDisclosure'

export default function ProductGrid({ products }) {
  return (
    <div className="mt-16 border-t border-slate-200 pt-16">
      <div className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Popular products</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">A starting point for your equipment setup</h2>
        <p className="mt-4 leading-7">Product names and prices are placeholders for catalog planning. Contact us to confirm current models, compatibility, and availability.</p>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <article key={product.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mist text-primary"><PackageOpen aria-hidden="true" size={23} /></span>
            <h3 className="mt-5 break-words text-lg font-extrabold text-navy">{product.name}</h3>
            <p className="mt-2 break-words text-xl font-extrabold text-primary-dark">{product.price}</p>
            <p className="mt-3 flex-1 break-words text-sm leading-6">{product.description}</p>
            <Button type="button" variant="outline" disabled className="mt-6 cursor-not-allowed opacity-60">View Details</Button>
          </article>
        ))}
      </div>
      <PricingDisclosure className="mt-6 max-w-3xl" />
    </div>
  )
}
