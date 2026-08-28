import {
  ArrowRight,
  Barcode,
  Cable,
  Check,
  CheckCircle2,
  CreditCard,
  Eye,
  Filter,
  Landmark,
  LoaderCircle,
  Package,
  PackageOpen,
  Printer,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { applicationRequest, unwrapData } from '../../features/account-application/api'
import { getProductImageUrl } from '../../utils/productImages'
import Button from '../ui/Button'
import PricingDisclosure from '../ui/PricingDisclosure'

const storeCategoryNav = [
  { id: 'all', label: 'All Equipment', path: '', icon: Store },
  { id: 'terminals', label: 'Terminals & Pin Pads', path: '/store/terminals', icon: CreditCard },
  { id: 'pos', label: 'Point of Sale (POS)', path: '/store/pos', icon: Store },
  { id: 'pos-equipment', label: 'POS Equipment', path: '/store/pos-equipment', icon: Package },
  { id: 'printers', label: 'Printers', path: '/store/printers', icon: Printer },
  { id: 'barcode-scanners', label: 'Barcode Scanners', path: '/store/barcode-scanners', icon: Barcode },
  { id: 'clover', label: 'Clover & Accessories', path: '/store/clover', icon: Sparkles },
  { id: 'atm-accessories', label: 'ATM & Parts', path: '/store/atm-accessories', icon: Landmark },
  { id: 'accessories', label: 'Accessories & Cables', path: '/store/accessories', icon: Cable },
  { id: 'paper-ink', label: 'Paper & Ink', path: '/store/paper-ink', icon: ReceiptText },
]

function isItemInStock(item) {
  if (!item) return false
  return Boolean(
    item.isStock === true ||
    item.inStock === true ||
    item.isInStock === true ||
    item.isAvailable === true ||
    (typeof item.stock === 'number' && item.stock > 0) ||
    (typeof item.quantityInStock === 'number' && item.quantityInStock > 0) ||
    (typeof item.inventoryQuantity === 'number' && item.inventoryQuantity > 0)
  )
}

function matchCategory(product, catPath) {
  if (!catPath || catPath === 'all' || catPath === '/store/all') return true
  const text = (product.name + ' ' + (product.description || '') + ' ' + (product.category?.title || '') + ' ' + (product.category?.solution || '')).toLowerCase()

  switch (catPath) {
    case '/store/terminals':
    case 'terminals':
      return text.includes('pax') || text.includes('dejavoo') || text.includes('terminal') || text.includes('pin pad') || text.includes('ingenico') || text.includes('verifone') || product.category?.solution === 'credit-card'
    case '/store/pos':
    case 'pos':
      return text.includes('pos') || text.includes('point of sale') || text.includes('station') || text.includes('register') || text.includes('touch') || product.category?.solution === 'pos'
    case '/store/printers':
    case 'printers':
      return text.includes('printer') || text.includes('star') || text.includes('epson') || text.includes('tsp') || text.includes('print') || text.includes('receipt')
    case '/store/barcode-scanners':
    case 'barcode-scanners':
      return text.includes('scanner') || text.includes('barcode') || text.includes('scan')
    case '/store/atm-accessories':
    case 'atm-accessories':
      return text.includes('atm') || text.includes('hyosung') || text.includes('genmega') || text.includes('hantle') || text.includes('detect') || text.includes('cdu') || product.category?.solution === 'atm'
    case '/store/clover':
    case 'clover':
      return text.includes('clover')
    case '/store/accessories':
    case 'accessories':
      return text.includes('cable') || text.includes('stand') || text.includes('power') || text.includes('mount') || text.includes('adapter') || text.includes('swivel') || text.includes('bracket')
    case '/store/pos-equipment':
    case 'pos-equipment':
      return text.includes('drawer') || text.includes('monitor') || text.includes('display') || text.includes('scale') || text.includes('cash drawer') || text.includes('terminal stand')
    case '/store/paper-ink':
    case 'paper-ink':
      return text.includes('paper') || text.includes('roll') || text.includes('ribbon') || text.includes('ink') || text.includes('thermal')
    default:
      return true
  }
}

function getRating(productId) {
  const seed = (Number(productId) || 1) * 9301 + 49297
  const rating = 4.6 + ((seed % 5) * 0.1)
  const reviews = 12 + (seed % 78)
  return { rating: rating.toFixed(1), reviews }
}

function QuickViewModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null

  const imageUrl = getProductImageUrl(product)
  const inStock = isItemInStock(product)
  const price = Number(product.sellingPrice ?? product.price ?? 0)
  const originalPrice = price > 0 ? (price * 1.15).toFixed(2) : null
  const { rating, reviews } = getRating(product.id)

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black uppercase tracking-wider text-amber-900">
              {product.category?.title || 'POS Store Device'}
            </span>
            {product.sku && <span className="text-xs font-semibold text-slate-500">SKU: {product.sku}</span>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-2">
          {/* Image Container */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <img
              src={imageUrl || getProductImageUrl(product)}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = getProductImageUrl(product)
              }}
              className="max-h-72 w-full object-contain"
            />

            <div className="mt-6 flex w-full flex-wrap items-center justify-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                {inStock ? <><Check size={14} /> In Stock (Ships Fast)</> : 'Special Order Item'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                <ShieldCheck size={14} /> Official Warranty
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-navy">{product.name}</h2>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-bold text-navy">{rating}</span>
                <span className="text-xs text-slate-500">({reviews} customer reviews)</span>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3 border-y border-slate-100 py-3">
                <div className="flex items-start text-3xl font-black text-navy">
                  <span className="text-lg font-bold text-slate-500">$</span>
                  <span>{Math.floor(price)}</span>
                  <span className="text-sm font-bold text-slate-500">.{(price % 1).toFixed(2).slice(2)}</span>
                </div>
                {originalPrice && (
                  <span className="text-sm text-slate-400 line-through">${originalPrice}</span>
                )}
                {inStock && (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700">
                    Free Next-Day Delivery
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description & Specs</h4>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {product.description || 'Professional merchant payment and point-of-sale hardware designed for secure transaction processing, reliability, and fast checkout performance.'}
                </p>
              </div>

              {/* Feature Highlights */}
              <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>EMV Chip, Contactless (NFC) & Magnetic Stripe Supported</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Pre-configured and ready for Dolphin Merchant Services</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Compliant with PCI-PTS and modern security standards</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="mt-6 space-y-2.5 pt-4">
              <Button to="/open-an-account" className="w-full justify-center text-base py-3">
                Order Device & Open Account <ArrowRight size={18} />
              </Button>
              <Button to="/contact" variant="outline" className="w-full justify-center text-sm">
                Inquire / Talk to a Specialist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product, onQuickView }) {
  const imageUrl = getProductImageUrl(product)
  const inStock = isItemInStock(product)
  const price = Number(product.sellingPrice ?? product.price ?? 0)
  const originalPrice = price > 0 ? (price * 1.15).toFixed(2) : null
  const { rating, reviews } = getRating(product.id)

  const dollars = Math.floor(price)
  const cents = (price % 1).toFixed(2).slice(2)

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      {/* Image Container */}
      <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-t-2xl border-b border-slate-100 bg-white p-4">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
          {product.id % 3 === 0 && (
            <span className="rounded bg-amber-500 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
              Best Seller
            </span>
          )}
          {product.id % 5 === 0 && (
            <span className="rounded bg-navy px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm">
              Top Pick
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {inStock ? 'In Stock' : 'Special Order'}
          </span>
        </div>

        {/* Product Photo or Device Icon */}
        <img
          src={imageUrl || getProductImageUrl(product)}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = getProductImageUrl(product)
          }}
          className="max-h-40 w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Quick View Hover Overlay Button */}
        <button
          type="button"
          onClick={() => onQuickView(product)}
          className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1.5 text-xs font-bold text-navy shadow-md backdrop-blur transition hover:bg-primary hover:text-white"
        >
          <Eye size={14} /> Quick View
        </button>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Category Tag */}
        <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
          {product.category?.title || 'Point-of-Sale'}
        </p>

        {/* Product Title */}
        <Link
          to={`/store/product/${product.id}`}
          className="mt-1.5 line-clamp-2 text-base font-extrabold text-navy transition-colors hover:text-primary"
          title={product.name}
        >
          {product.name}
        </Link>

        {/* Star Ratings */}
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={13} fill="currentColor" />
            ))}
          </div>
          <span className="font-bold text-slate-700">{rating}</span>
          <span className="text-slate-400">({reviews})</span>
        </div>

        {/* Price Row */}
        <div className="mt-3.5 flex items-baseline gap-2">
          <div className="flex items-start text-2xl font-black text-navy">
            <span className="text-xs font-bold text-slate-500 mt-1">$</span>
            <span>{dollars}</span>
            <span className="text-xs font-bold text-slate-500 mt-1">.{cents}</span>
          </div>
          {originalPrice && (
            <span className="text-xs text-slate-400 line-through">${originalPrice}</span>
          )}
        </div>

        {/* Shipping badge */}
        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <Truck size={14} className="text-primary shrink-0" />
          <span className="truncate">FREE Delivery with merchant setup</span>
        </div>

        {/* Description snippet */}
        <p className="mt-2.5 flex-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {product.description || 'Pre-configured terminal with contactless tap, EMV chip, and robust payment connectivity.'}
        </p>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
          <Button
            to={`/store/product/${product.id}`}
            className="w-full justify-center text-xs py-2.5 font-bold shadow-sm"
          >
            <Zap size={14} /> Buy Now
          </Button>
        </div>
      </div>
    </article>
  )
}

export default function ProductGrid({
  products: fallbackProducts = [],
  categoryPath = '',
  categoryTitle = '',
}) {
  const [liveProducts, setLiveProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryPath || 'all')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sortBy, setSortBy] = useState('featured')
  const [activeModalProduct, setActiveModalProduct] = useState(null)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    applicationRequest('item-services')
      .then((result) => {
        if (!isMounted) return
        const raw = unwrapData(result)
        const items = Array.isArray(raw) ? raw : raw?.data || []
        setLiveProducts(items)
      })
      .catch(() => {
        // Fallback to static props if network fails
        if (!isMounted) return
        setLiveProducts([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Sync category when categoryPath prop changes
  useEffect(() => {
    if (categoryPath) {
      setSelectedCategory(categoryPath)
    }
  }, [categoryPath])

  // Process & filter products
  const displayProducts = useMemo(() => {
    let pool = liveProducts.length > 0 ? liveProducts : fallbackProducts.map((p, idx) => ({
      id: idx + 1,
      name: p.name,
      sellingPrice: parseFloat(String(p.price || '0').replace(/[^0-9.]/g, '')) || 0,
      description: p.description,
      inStock: true,
      category: { title: categoryTitle || 'POS Store', solution: 'pos' },
    }))

    // Filter by Category
    if (selectedCategory && selectedCategory !== 'all') {
      pool = pool.filter((p) => matchCategory(p, selectedCategory))
    }

    // Filter by In-Stock
    if (inStockOnly) {
      pool = pool.filter(isItemInStock)
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      pool = pool.filter((p) => {
        const text = (p.name + ' ' + (p.description || '') + ' ' + (p.category?.title || '') + ' ' + (p.sku || '')).toLowerCase()
        return text.includes(q)
      })
    }

    // Sort
    const sorted = [...pool]
    if (sortBy === 'price-low') {
      sorted.sort((a, b) => Number(a.sellingPrice ?? a.price ?? 0) - Number(b.sellingPrice ?? b.price ?? 0))
    } else if (sortBy === 'price-high') {
      sorted.sort((a, b) => Number(b.sellingPrice ?? b.price ?? 0) - Number(a.sellingPrice ?? a.price ?? 0))
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    } else if (sortBy === 'rating') {
      sorted.sort((a, b) => Number(getRating(b.id).rating) - Number(getRating(a.id).rating))
    }

    return sorted
  }, [liveProducts, fallbackProducts, selectedCategory, inStockOnly, searchQuery, sortBy, categoryTitle])

  return (
    <div className="mt-16 border-t border-slate-200 pt-16">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Sparkles size={16} />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              POS Store Catalog
            </p>
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {categoryTitle ? `${categoryTitle} & Equipment` : 'Explore Hardware & POS Systems'}
          </h2>
          <p className="mt-2 text-slate-600">
            Browse our complete catalog of payment terminals, point-of-sale workstations, receipt printers, and accessories.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <Button to="/open-an-account" className="rounded-xl px-5 py-3 text-sm">
            Open an Account <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      {/* Category Tabs Pill Navigation */}
      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {storeCategoryNav.map((cat) => {
          const isActive = selectedCategory === cat.path || (cat.id === 'all' && (!selectedCategory || selectedCategory === 'all'))
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.path || 'all')}
              className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${isActive ? 'border-primary bg-primary text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-slate-50'}`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search 100+ terminals, printers, scanners, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-10 text-sm font-medium text-navy placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Refinements */}
        <div className="flex flex-wrap items-center gap-4">
          {/* In Stock Only */}
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-primary"
            />
            <span>In Stock Only</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
        <span>
          Showing <strong className="text-navy">{displayProducts.length}</strong> products
          {selectedCategory && selectedCategory !== 'all' ? ` in ${storeCategoryNav.find((c) => c.path === selectedCategory)?.label || 'Category'}` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </span>
        {liveProducts.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 size={13} /> Live catalog synchronized
          </span>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="my-20 flex flex-col items-center justify-center gap-3">
          <LoaderCircle className="animate-spin text-primary" size={40} />
          <p className="text-sm font-bold text-slate-600">Loading live POS store products...</p>
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id || product.name}
              product={product}
              onQuickView={setActiveModalProduct}
            />
          ))}
        </div>
      ) : (
        <div className="my-16 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-soft">
          <PackageOpen size={48} className="text-slate-300" />
          <h3 className="mt-4 text-lg font-extrabold text-navy">No products match your filters</h3>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            Try adjusting your search query or switching to another category in the POS store.
          </p>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setInStockOnly(false)
              }}
            >
              Reset Filters
            </Button>
            <Button to="/contact">Request Custom Hardware</Button>
          </div>
        </div>
      )}

      {/* Pricing and Hardware Disclosure */}
      <PricingDisclosure className="mt-12 max-w-4xl" />

      {/* Quick View Modal */}
      <QuickViewModal
        product={activeModalProduct}
        isOpen={Boolean(activeModalProduct)}
        onClose={() => setActiveModalProduct(null)}
      />
    </div>
  )
}
