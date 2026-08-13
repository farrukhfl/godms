import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MegaMenu({ id, labelledBy, group, onClose }) {
  return (
    <div id={id} aria-labelledby={labelledBy} className="mega-menu-enter absolute left-1/2 top-full z-50 w-[min(760px,calc(100vw-2rem))] pt-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-navy/15">
        <div className="grid grid-cols-2 gap-1">
          {group.items.map(({ label, path, icon: Icon, description }, index) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              style={{ '--menu-item-delay': `${40 + index * 35}ms` }}
              className="mega-menu-item group flex gap-3 rounded-xl p-3 transition hover:translate-x-1 hover:bg-mist"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon aria-hidden="true" size={19} />
              </span>
              <span>
                <span className="flex items-center gap-1 text-sm font-bold text-navy">
                  {label}<ArrowRight aria-hidden="true" size={14} className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {description || `Explore our ${label.toLowerCase()} offering.`}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
