import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  Globe2,
  Handshake,
  Info,
  Landmark,
  LoaderCircle,
  MonitorSmartphone,
  PackageCheck,
  PenLine,
  PencilLine,
  Search,
  ShoppingBasket,
  ShoppingCart,
  Tag,
  UserRound,
  WalletCards,
  Wind,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import FormField, { formControlClasses } from '../../components/ui/FormField'
import GoogleRecaptcha from '../../components/ui/GoogleRecaptcha'
import { getProductImageUrl } from '../../utils/productImages'
import {
  applicationRequest,
  dataUrlToFile,
  downloadAgreementSummary,
  extractFileReference,
  fetchAgreementSummary,
  saveApplication,
  signAgreementDocument,
  unwrapData,
  uploadApplicationFile,
} from './api'

const steps = [
  ['Services', WalletCards],
  ['Business', Building2],
  ['Ownership', UserRound],
  ['Financial', Landmark],
  ['Plan', CreditCard],
  ['Hardware', ShoppingCart],
  ['Preferences', FileCheck2],
  ['Delivery', PackageCheck],
  ['Submit', PenLine],
]

// Sequence: 1. Credit Card, 2. ATM, 3. Point of Sale, and then other services
const serviceOrder = [
  'credit-card',
  'atm',
  'pos',
  'cash-advance',
  'ebt',
  'ach-processing',
  'airvac',
  'website',
]

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]

const saleSolutions = new Set(['ebt', 'cash-advance', 'credit-card', 'pos', 'ach-processing'])

const solutionIcons = {
  atm: Banknote,
  'credit-card': CreditCard,
  'cash-advance': CircleDollarSign,
  pos: MonitorSmartphone,
  ebt: ShoppingBasket,
  airvac: Wind,
  website: Globe2,
  'ach-processing': Landmark,
}

const serviceTitles = {
  atm: 'ATM Solutions',
  'credit-card': 'Credit Card Processing',
  'cash-advance': 'Cash Advance',
  pos: 'Point-Of-Sale Solutions',
  ebt: 'EBT Processing',
  airvac: 'AIRVAC Systems',
  website: 'Website Services',
  'ach-processing': 'ACH Processing',
}

const supportedSolutions = new Set(Object.keys(solutionIcons))

const preferenceForms = {
  atm: 'atm1',
  'credit-card': 'credit-card1',
  'cash-advance': 'cash-advance1',
  pos: 'pos1',
  ebt: 'ebt1',
  airvac: 'airvac1',
  website: 'website1',
  'ach-processing': 'ach-processing1',
}

const merchantOwnedForms = {
  atm: 'merchantOwnedAtm',
  'credit-card': 'merchantOwnedCreditCard',
  'cash-advance': 'merchantOwnedCashAdvance',
  pos: 'merchantOwnedPos',
  ebt: 'merchantOwnedEbt',
  airvac: 'merchantOwnedAirvac',
  website: 'merchantOwnedWebsite',
  'ach-processing': 'merchantOwnedAchProcessing',
}

function getPlanDetails(plan) {
  const planKey = (plan?.name || '').toLowerCase().trim()

  if (planKey.includes('cash discount') || planKey === 'cash-discount') {
    return {
      title: 'Cash Discount',
      rate: '3.9%',
      desc: 'Customers can save by paying with cash.',
      feeNote: 'DMS Monthly Fee*',
      Icon: Banknote,
    }
  }

  if (planKey.includes('surcharge')) {
    return {
      title: 'Surcharge',
      rate: '2.9%',
      desc: 'Applies to credit card transactions only. Debit: 1.75% + $0.15 per transaction',
      feeNote: 'DMS Monthly Fee*',
      Icon: CreditCard,
    }
  }

  if (planKey.includes('interchange') || planKey.includes('ic plus')) {
    return {
      title: 'Interchange (IC Plus)',
      rate: '0.25% + $0.07 per transaction',
      desc: "Transparent pricing based on the card's interchange rate.",
      feeNote: 'DMS Monthly Fee*',
      Icon: ArrowLeftRight,
    }
  }

  if (planKey.includes('flat rate') || planKey.includes('flat')) {
    return {
      title: 'Flat Rate',
      rate: '2.75%',
      desc: 'One simple rate for all transactions.',
      feeNote: 'DMS Monthly Fee*',
      Icon: Tag,
    }
  }

  if (planKey.includes('owner')) {
    return {
      title: 'Ownership',
      rate: 'Keep 90% Surcharge',
      desc: 'Purchase the ATM and manage cash loading yourself or through an approved cash-loading service.',
      feeNote: 'Keep 90% of your ATM surcharge revenue.',
      Icon: Landmark,
    }
  }

  if (planKey.includes('placement')) {
    return {
      title: 'Placement',
      rate: '50/50 Revenue Split',
      desc: 'We handle the ATM, cash loading, maintenance, and processing, while you earn a share of the surcharge revenue.',
      feeNote: 'Split ATM surcharge revenue 50/50 with Dolphin Merchant Services.',
      Icon: Handshake,
    }
  }

  return {
    title: plan?.name || 'Standard Plan',
    rate: null,
    desc: plan?.description || '',
    feeNote: null,
    Icon: CreditCard,
  }
}

const initialValues = {
  legalName: '', legalAddress: '', legalZipCode: '', legalCity: '', legalState: '', contactNumber: '', ebtFnsNumber: '',
  sameAsLegal: true, businessName: '', dbaAddress: '', businessZipCode: '', businessCity: '', businessState: '', dbaPhoneNumber: '',
  taxType: 'FEIN', feinNumber: '', ownerShipType: '', businessStartDate: '', businessType: '', email: '', website: '', productsDescription: '',
  ownerFirstName: '', ownerLastName: '', date: '', ownerSameAsLegal: true, residentialAddress: '', ownerShipZip: '', ownerShipCity: '', ownerShipState: '', ownerPhoneNumber: '', ownerEmail: '', socialSecurityNumber: '', dLFiles: [],
  bankName: '', accountNumber: '', routingNumber: '', bankFiles: [], taxCode: '', averageSale: '', maxSale: '', monthlySale: '', comment: '',
  // ATM Conditional Fields
  atmInternetPlan: 'Wireless Cellular Data ($15/month)',
  atmSurchargeAmount: '3.00',
  atmOwnershipOption: 'Buy New ATM from Dolphin',
  atmModel: 'Hyosung Halo II',
  atmEstimatedMonthlyTransactions: '250 - 500 transactions/mo',
}

function digits(value, max = 30) {
  return String(value || '').replace(/\D/g, '').slice(0, max)
}

function phone(value) {
  const number = digits(value, 10)
  if (number.length < 4) return number
  if (number.length < 7) return `(${number.slice(0, 3)}) ${number.slice(3)}`
  return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
}

function apiDate(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  return match ? `${match[2]}/${match[3]}/${match[1]}` : value
}

function formatCardNumber(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim()
}

function formatExpiryInput(value) {
  const raw = String(value || '').replace(/\D/g, '').slice(0, 4)
  if (!raw) return ''
  if (raw.length === 1) {
    return parseInt(raw, 10) > 1 ? `0${raw}/` : raw
  }
  if (raw.length === 2) {
    let month = parseInt(raw, 10)
    if (month === 0) month = 1
    if (month > 12) month = 12
    return `${String(month).padStart(2, '0')}/`
  }
  return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`
}

function getAuthorizeExpirationDate(rawExpiryDate) {
  if (!rawExpiryDate) return ''
  const clean = String(rawExpiryDate).replace(/\D/g, '')
  if (clean.length === 4) {
    const month = parseInt(clean.slice(0, 2), 10)
    if (month >= 1 && month <= 12) return clean
  }
  return ''
}

function validateCardExpiry(rawExpiryDate) {
  const authDate = getAuthorizeExpirationDate(rawExpiryDate)
  if (!authDate || authDate.length !== 4) return 'Enter a valid expiry date (MM/YY).'
  const month = parseInt(authDate.slice(0, 2), 10)
  const year = 2000 + parseInt(authDate.slice(2, 4), 10)
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'Card expiry date cannot be in the past.'
  }
  return null
}

function isValidLuhn(cardNumber) {
  const clean = String(cardNumber || '').replace(/\D/g, '')
  if (clean.length < 13 || clean.length > 19) return false
  let sum = 0
  let shouldDouble = false
  for (let i = clean.length - 1; i >= 0; i -= 1) {
    let digit = parseInt(clean[i], 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

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

function getServiceLabel(solution) {
  return serviceTitles[solution] || String(solution || '').replaceAll('-', ' ')
}

function normalizeAgreementDocs(result) {
  const data = unwrapData(result)
  const rows = data?.agreementFileUrls || (Array.isArray(data) ? data : [])
  return rows
    .map((doc) => ({
      agreementId: doc?.agreementId,
      envelopeNumber: doc?.envelopeNumber,
      status: doc?.status,
      title: doc?.title || doc?.unsignedFileUrl?.originalname || 'Merchant Agreement',
      url: doc?.signedFileUrl?.url || doc?.unsignedFileUrl?.url,
      signed: Boolean(doc?.signedFileUrl?.url) || doc?.status === 'signed',
      unsignedFileUrl: doc?.unsignedFileUrl || null,
      signedFileUrl: doc?.signedFileUrl || null,
    }))
    .filter((doc) => doc.url)
}

function Field({ id, label, required, error, tooltip, children, ...props }) {
  return (
    <FormField id={id} label={label} required={required} error={error} tooltip={tooltip}>
      {children || <input id={id} className={`${formControlClasses} ${error ? 'border-rose-500' : ''}`} {...props} />}
    </FormField>
  )
}

function MaskedField({ id, label, required, error, tooltip, value, onChange, placeholder, maxLength, inputMode = 'text' }) {
  const [show, setShow] = useState(false)
  return (
    <FormField id={id} label={label} required={required} error={error} tooltip={tooltip}>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`${formControlClasses} pr-11 ${error ? 'border-rose-500' : ''}`}
        />
        <button
          type="button"
          tabIndex="-1"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-navy transition-colors focus:outline-none"
          aria-label={show ? 'Hide characters' : 'Show characters'}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </FormField>
  )
}

function SelectField({ id, label, required, error, tooltip, value, onChange, options, placeholder = 'Select an option' }) {
  return (
    <FormField id={id} label={label} required={required} error={error} tooltip={tooltip}>
      <select id={id} value={value} onChange={onChange} className={`${formControlClasses} ${error ? 'border-rose-500' : ''}`}>
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const item = typeof option === 'string' ? { value: option, label: option } : option
          return <option key={item.value} value={item.value}>{item.label}</option>
        })}
      </select>
    </FormField>
  )
}

function Progress({ current }) {
  return (
    <div aria-label="Application progress">
      <div className="md:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">{current + 1}</span>
            <span className="min-w-0"><span className="block text-xs font-bold uppercase tracking-wider text-slate-500">Step {current + 1} of {steps.length}</span><strong className="block truncate text-navy">{steps[current][0]}</strong></span>
          </div>
          <span className="shrink-0 text-sm font-bold text-primary">{Math.round(((current + 1) / steps.length) * 100)}%</span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / steps.length) * 100}%` }} /></div>
      </div>
      <ol className="hidden items-start md:flex">
        {steps.map(([label, Icon], index) => (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center" aria-current={index === current ? 'step' : undefined}>
            {index > 0 && <span className={`absolute right-1/2 top-5 h-0.5 w-full ${index <= current ? 'bg-primary' : 'bg-slate-200'}`} />}
            <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 ${index < current ? 'border-primary bg-primary text-white' : index === current ? 'border-primary bg-white text-primary shadow-lg shadow-primary/20' : 'border-slate-200 bg-white text-slate-400'}`}>
              {index < current ? <Check size={18} /> : <Icon size={18} />}
            </span>
            <span className={`mt-2 text-xs font-bold ${index === current ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StepTitle({ title, description }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2>
      <p className="mt-2 leading-7 text-slate-600">{description}</p>
    </div>
  )
}

function SignatureModal({ isOpen, onClose, onSubmit, isSigning }) {
  const canvasRef = useRef(null)
  const drawingRef = useRef(false)
  const [typedName, setTypedName] = useState('')
  const [mode, setMode] = useState('draw')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || mode !== 'draw') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ratio = Math.max(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = 160 * ratio
    const context = canvas.getContext('2d')
    context.scale(ratio, ratio)
    context.lineWidth = 2.5
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#0f172a'
  }, [isOpen, mode])

  if (!isOpen) return null

  const getCoordinates = (event) => {
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]
    const rect = canvas.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }

  const handlePointerDown = (event) => {
    drawingRef.current = true
    setError('')
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const [x, y] = getCoordinates(event)
    context.beginPath()
    context.moveTo(x, y)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const [x, y] = getCoordinates(event)
    context.lineTo(x, y)
    context.stroke()
  }

  const handlePointerUp = () => {
    drawingRef.current = false
  }

  const handleClear = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current
      if (canvas) {
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    } else {
      setTypedName('')
    }
    setError('')
  }

  const handleSave = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')
      const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
      )
      const hasDrawing = pixelBuffer.some((color) => color !== 0)
      if (!hasDrawing) {
        setError('Please draw your signature before submitting.')
        return
      }
      onSubmit(canvas.toDataURL('image/png'))
    } else {
      if (!typedName.trim()) {
        setError('Please type your name before submitting.')
        return
      }
      const canvas = document.createElement('canvas')
      canvas.width = 500
      canvas.height = 150
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'italic 44px "Brush Script MT", cursive, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.textBaseline = 'middle'
      ctx.fillText(typedName.trim(), 30, 75)
      onSubmit(canvas.toDataURL('image/png'))
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-navy">Provide Your Signature</h3>
          <button type="button" onClick={onClose} disabled={isSigning} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-600">Please sign below to authorize and complete your merchant agreement.</p>

        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-sm font-bold">
          <button
            type="button"
            onClick={() => setMode('draw')}
            className={`flex-1 rounded-lg py-2 transition ${mode === 'draw' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-navy'}`}
          >
            Draw Signature
          </button>
          <button
            type="button"
            onClick={() => setMode('type')}
            className={`flex-1 rounded-lg py-2 transition ${mode === 'type' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-navy'}`}
          >
            Type Signature
          </button>
        </div>

        {error && <p className="mt-3 text-sm font-bold text-rose-600">{error}</p>}

        <div className="mt-4">
          {mode === 'draw' ? (
            <div className="relative">
              <canvas
                ref={canvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="h-40 w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
                aria-label="Draw signature"
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs font-semibold text-slate-400">Sign above line</span>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Type your full legal name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className={`${formControlClasses} font-medium`}
              />
              {typedName && (
                <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4">
                  <span className="font-serif text-3xl italic text-navy">{typedName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            disabled={isSigning}
            className="text-sm font-bold text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSigning}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSigning}>
              {isSigning ? <><LoaderCircle className="animate-spin" size={16} /> Signing...</> : 'Submit Signature'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PdfReviewModal({
  isOpen,
  onClose,
  documents,
  activeDocIndex,
  onSelectDocIndex,
  viewingSummary,
  summaryUrl,
  onToggleSummary,
  onDownloadSummary,
  onOpenSignModal,
  onSubmitFinal,
  isAllSigned,
}) {
  const activeDoc = documents[activeDocIndex] || null
  const rawUrl = viewingSummary && summaryUrl ? summaryUrl : activeDoc?.url
  const safeDirectUrl = useMemo(() => String(rawUrl || '').replace(/^http:\/\//i, 'https://'), [rawUrl])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="shrink-0 text-primary" size={24} />
            <div className="min-w-0">
              <h3 className="truncate font-extrabold text-navy">
                {viewingSummary ? 'Agreement Summary' : activeDoc?.title || 'Merchant Agreement'}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {viewingSummary
                  ? 'Official combined agreement summary'
                  : activeDoc?.signed
                    ? '✓ Signed document'
                    : 'Review and sign document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {safeDirectUrl && (
              <a
                href={safeDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline px-2 py-1 rounded-lg bg-mist"
              >
                <ExternalLink size={13} /> Open in New Tab
              </a>
            )}
            {!viewingSummary && documents.length > 1 && (
              <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-700">
                <button
                  type="button"
                  disabled={activeDocIndex <= 0}
                  onClick={() => onSelectDocIndex(activeDocIndex - 1)}
                  className="rounded-lg px-2.5 py-1 transition hover:bg-white disabled:opacity-40"
                >
                  Prev
                </button>
                <span>{activeDocIndex + 1} / {documents.length}</span>
                <button
                  type="button"
                  disabled={activeDocIndex >= documents.length - 1}
                  onClick={() => onSelectDocIndex(activeDocIndex + 1)}
                  className="rounded-lg px-2.5 py-1 transition hover:bg-white disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative min-h-0 flex-1 bg-slate-100 p-2 sm:p-4">
          {safeDirectUrl ? (
            <iframe
              key={safeDirectUrl}
              src={`${safeDirectUrl}#toolbar=1&navpanes=0&view=FitH`}
              title={viewingSummary ? 'Agreement Summary' : activeDoc?.title || 'Agreement'}
              className="h-full w-full rounded-xl border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
              No document preview available.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-2">
            {activeDoc?.signed && !viewingSummary && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                <Check size={14} /> Signed
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!activeDoc?.signed && !viewingSummary ? (
              <Button type="button" onClick={onOpenSignModal}>
                <PencilLine size={16} /> Sign Agreement
              </Button>
            ) : (
              <>
                {summaryUrl && (
                  <Button type="button" variant="outline" onClick={onToggleSummary}>
                    {viewingSummary ? <><Eye size={16} /> View Agreement</> : <><FileText size={16} /> View Summary</>}
                  </Button>
                )}
                {summaryUrl && (
                  <Button type="button" variant="outline" onClick={onDownloadSummary}>
                    <Download size={16} /> Download Summary
                  </Button>
                )}
                {isAllSigned && (
                  <Button type="button" onClick={onSubmitFinal}>
                    Submit Application <CheckCircle2 size={16} />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function validate(step, values, selectedSolutions, plans, products, shipments, checkedByApp, applications = [], isRobotVerified = false) {
  const errors = {}
  const required = (key, message) => { if (!String(values[key] ?? '').trim()) errors[key] = message }

  if (step === 0 && selectedSolutions.length === 0) {
    errors.solutions = 'Please select at least one merchant service to continue.'
  }

  if (step === 1) {
    ['legalName', 'legalAddress', 'legalZipCode', 'legalCity', 'legalState', 'contactNumber', 'taxType', 'feinNumber', 'ownerShipType', 'businessType', 'email', 'productsDescription'].forEach((key) => required(key, 'This field is required.'))
    if (digits(values.contactNumber, 20).length < 10) errors.contactNumber = 'Enter a valid 10-digit phone number.'
    if (digits(values.legalZipCode, 10).length !== 5) errors.legalZipCode = 'ZIP Code must be exactly 5 digits.'
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid business email address.'
    if (digits(values.feinNumber, 20).length !== 9) errors.feinNumber = 'FEIN / Tax ID Number must contain exactly 9 digits.'
    if (values.productsDescription && !/\p{L}/u.test(values.productsDescription)) errors.productsDescription = 'Describe what your business sells using words, not only numbers.'
    if (selectedSolutions.includes('ebt')) required('ebtFnsNumber', 'FNS number is required for EBT processing.')
    if (!values.sameAsLegal) {
      ['businessName', 'dbaAddress', 'businessZipCode', 'businessCity', 'businessState', 'dbaPhoneNumber'].forEach((key) => required(key, 'This field is required.'))
      if (digits(values.businessZipCode, 10).length !== 5) errors.businessZipCode = 'DBA ZIP Code must be exactly 5 digits.'
    }
  }

  if (step === 2) {
    ['ownerFirstName', 'ownerLastName', 'date', 'residentialAddress', 'ownerShipZip', 'ownerShipCity', 'ownerShipState', 'ownerPhoneNumber', 'ownerEmail', 'socialSecurityNumber'].forEach((key) => required(key, 'This field is required.'))
    if (digits(values.ownerPhoneNumber, 20).length < 10) errors.ownerPhoneNumber = 'Enter a valid 10-digit owner phone number.'
    if (digits(values.ownerShipZip, 10).length !== 5) errors.ownerShipZip = 'Residential ZIP Code must be exactly 5 digits.'
    if (digits(values.socialSecurityNumber, 20).length !== 9) errors.socialSecurityNumber = 'Social Security Number must contain exactly 9 digits.'
    if (!values.dLFiles.length) errors.dLFiles = 'Upload a driver license or government-issued ID.'
  }

  if (step === 3) {
    ['accountNumber', 'routingNumber'].forEach((key) => required(key, 'This field is required.'))
    const cleanRouting = digits(values.routingNumber, 10)
    if (cleanRouting.length !== 9) {
      errors.routingNumber = 'Routing Number must contain exactly 9 digits.'
    }
    if (!values.bankFiles.length) errors.bankFiles = 'Upload a void check or bank letter.'
    if (selectedSolutions.some((solution) => saleSolutions.has(solution))) {
      ['averageSale', 'maxSale', 'monthlySale'].forEach((key) => required(key, 'This field is required.'))
    }
  }

  if (step === 4) {
    if (Object.keys(plans).length < selectedSolutions.length) {
      errors.plan = 'Please select one pricing plan for each requested service.'
    }
    // ATM Conditional validation
    if (selectedSolutions.includes('atm')) {
      const atmApp = applications.find((a) => a.solution === 'atm')
      const chosenAtmPlan = (plans[atmApp?.applicationId] || '').toLowerCase()
      if (chosenAtmPlan.includes('owner') || chosenAtmPlan.includes('placement')) {
        if (!values.atmInternetPlan) errors.atmInternetPlan = 'Select an internet / data plan for your ATM.'
      }
      if (chosenAtmPlan.includes('owner')) {
        if (!values.atmSurchargeAmount) errors.atmSurchargeAmount = 'Enter the target surcharge amount.'
        if (!values.atmOwnershipOption) errors.atmOwnershipOption = 'Select your ATM ownership option.'
        if (!values.atmModel) errors.atmModel = 'Enter your ATM model name.'
      }
      if (chosenAtmPlan.includes('placement')) {
        if (!values.atmEstimatedMonthlyTransactions) errors.atmEstimatedMonthlyTransactions = 'Select estimated monthly ATM transactions.'
      }
    }
  }

  if (step === 5 && Object.values(products).some((selection) => !selection.own && !Object.values(selection.items || {}).some((quantity) => quantity > 0))) {
    errors.products = 'Select hardware items or indicate that you already own compatible hardware for each service.'
  }

  if (step === 7) {
    Object.entries(shipments).forEach(([id, form]) => {
      const isMerchantOwned = form.type === 'MerchantOwned' || products[id]?.own
      if (!isMerchantOwned) {
        if (form.type === 'Shipping') {
          if (!form.recipientName || !form.recipientPhone || !form.email || !form.address || !form.zipCode || !form.state) {
            errors[`shipment-${id}`] = 'Complete all required shipping fields.'
          } else if (digits(form.zipCode, 10).length !== 5) {
            errors[`shipment-${id}`] = 'Shipping ZIP Code must be 5 digits.'
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors[`shipment-${id}`] = 'Enter a valid email address for delivery updates.'
          }
        }
        if (form.type === 'Pickup') {
          if (!form.pickupLocationName || !form.contactName || !form.pickupDate) {
            errors[`shipment-${id}`] = 'Complete all required pickup fields.'
          }
        }

        const hasInStock = products[id] && !products[id].own && Object.entries(products[id].items || {}).some(([, qty]) => {
          if (!qty || qty <= 0) return false
          return true
        })
        const effectivePaymentType = (!hasInStock && form.paymentType === 'Pay Now') ? 'Pay Later' : form.paymentType

        if (effectivePaymentType === 'Pay Now' && hasInStock) {
          const cleanCard = digits(form.cardNumber, 16)
          if (!form.nameOnCard || cleanCard.length < 15 || !form.expiryDate || !form.cvv || !form.billingAddress) {
            errors[`payment-${id}`] = 'Complete all required card payment details.'
          } else if (!isValidLuhn(cleanCard)) {
            errors[`payment-${id}`] = 'Enter a valid 16-digit credit card number.'
          } else {
            const expiryError = validateCardExpiry(form.expiryDate)
            if (expiryError) errors[`payment-${id}`] = expiryError
          }
        }
        if (effectivePaymentType === 'Lease') {
          if (!form.leaseTerm || !form.monthlyPayment || !form.startDate || !form.billingAddress) {
            errors[`payment-${id}`] = 'Complete all required lease details.'
          }
        }
      }
    })
  }

  if (step === 8) {
    const uncheckedApp = applications.find((app) => !checkedByApp[app.applicationId])
    if (uncheckedApp) {
      errors.accepted = `Please agree to the terms and conditions for ${getServiceLabel(uncheckedApp.solution)} before submitting.`
    }
    if (!isRobotVerified) {
      errors.recaptcha = 'Please complete the Google reCAPTCHA security verification challenge.'
    }
  }

  return errors
}

export default function ApplicationFlow({ onComplete }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState(initialValues)
  const [solutions, setSolutions] = useState([])
  const [applications, setApplications] = useState([])
  const [catalog, setCatalog] = useState({ services: [], plans: [], products: [], preferences: [] })
  const [plans, setPlans] = useState({})
  const [products, setProducts] = useState({})
  const [preferences, setPreferences] = useState({})
  const [shipments, setShipments] = useState({})
  const [agreements, setAgreements] = useState({})
  const [checkedByApp, setCheckedByApp] = useState({})
  const [signedByApp, setSignedByApp] = useState({})
  const [summaryUrlByApp, setSummaryUrlByApp] = useState({})
  const [uploadedSignatures, setUploadedSignatures] = useState({})
  const [hardwareSearch, setHardwareSearch] = useState('')
  const [isRobotVerified, setIsRobotVerified] = useState(false)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [loadingAgreements, setLoadingAgreements] = useState(false)
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [activeAppId, setActiveAppId] = useState(null)
  const [activeDocIndex, setActiveDocIndex] = useState(0)
  const [viewingSummary, setViewingSummary] = useState(false)
  const [isSigningDoc, setIsSigningDoc] = useState(false)
  const topRef = useRef(null)

  const applicationIds = useMemo(() => applications.map((item) => item.applicationId).filter(Boolean), [applications])

  const change = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  // Load service categories on mount (Sorted: Credit Card and ATM prioritized before POS)
  useEffect(() => {
    const controller = new AbortController()
    applicationRequest('item-category/', { signal: controller.signal })
      .then((result) => {
        const rawServices = unwrapData(result) || []
        const filtered = rawServices.filter((service) => supportedSolutions.has(service.solution))
        const sorted = filtered.sort((a, b) => {
          const idxA = serviceOrder.indexOf(a.solution)
          const idxB = serviceOrder.indexOf(b.solution)
          return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB)
        })
        setCatalog((current) => ({ ...current, services: sorted }))
        setError('')
      })
      .catch((nextError) => {
        if (nextError.name !== 'AbortError') setError(nextError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingData(false)
      })
    return () => controller.abort()
  }, [])

  // Load plans for step 4
  useEffect(() => {
    if (step !== 4 || catalog.plans.length) return
    applicationRequest('price-plan')
      .then((result) => setCatalog((current) => ({ ...current, plans: unwrapData(result) || [] })))
      .catch((nextError) => setError(nextError.message))
  }, [step, catalog.plans.length])

  // Load hardware for step 5
  useEffect(() => {
    if (step !== 5 || catalog.products.length) return
    applicationRequest('item-services')
      .then((result) => setCatalog((current) => ({ ...current, products: unwrapData(result) || [] })))
      .catch((nextError) => setError(nextError.message))
  }, [step, catalog.products.length])

  // Load preferences for steps 6 and 7
  useEffect(() => {
    if ((step !== 6 && step !== 7) || catalog.preferences.length) return
    applicationRequest('application-preferences')
      .then((result) => setCatalog((current) => ({ ...current, preferences: unwrapData(result) || [] })))
      .catch((nextError) => setError(nextError.message))
  }, [step, catalog.preferences.length])

  // Pre-fill shipments & delivery details from Business & Ownership data
  useEffect(() => {
    if (!applications.length) return
    setShipments((prev) => {
      const next = { ...prev }
      applications.forEach((application) => {
        const existing = next[application.applicationId] || {}
        const ownerFull = `${values.ownerFirstName || ''} ${values.ownerLastName || ''}`.trim()
        next[application.applicationId] = {
          type: existing.type || 'Shipping',
          paymentType: existing.paymentType || 'Pay Now',
          recipientName: existing.recipientName || values.businessName || values.legalName || ownerFull || '',
          companyName: existing.companyName || values.businessName || values.legalName || '',
          recipientPhone: existing.recipientPhone || values.dbaPhoneNumber || values.contactNumber || values.ownerPhoneNumber || '',
          email: existing.email || values.email || values.ownerEmail || '',
          address: existing.address || values.dbaAddress || values.legalAddress || '',
          floorStreet: existing.floorStreet || '',
          zipCode: existing.zipCode || values.businessZipCode || values.legalZipCode || '',
          country: 'United States',
          state: existing.state || values.businessState || values.legalState || '',
          pickupLocationName: existing.pickupLocationName || values.businessName || values.legalName || '',
          contactName: existing.contactName || ownerFull || values.businessName || '',
          pickupDate: existing.pickupDate || '',
          specialInstructions: existing.specialInstructions || '',
          merchantOwnedPreferences: existing.merchantOwnedPreferences || {},
          nameOnCard: existing.nameOnCard || values.businessName || values.legalName || ownerFull || '',
          cardNumber: existing.cardNumber || '',
          expiryDate: existing.expiryDate || '',
          cvv: existing.cvv || '',
          billingAddress: existing.billingAddress || values.dbaAddress || values.legalAddress || '',
          leaseTerm: existing.leaseTerm || '',
          monthlyPayment: existing.monthlyPayment || '',
          startDate: existing.startDate || '',
        }
      })
      return next
    })
  }, [applications, values, step])

  // Fetch agreement documents for Step 8
  useEffect(() => {
    if (step !== 8 || !applications.length) return
    let isMounted = true
    setLoadingAgreements(true)
    setError('')

    Promise.all(
      applications.map(async (application) => {
        try {
          const ownsHardware = products[application.applicationId]?.own
          const catId = application.categoryId || catalog.services.find((s) => s.solution === application.solution)?.id
          const query = ownsHardware && catId ? `?categoryIds=${encodeURIComponent(catId)}` : ''
          const result = await applicationRequest(`application/${application.applicationId}/agreement-documents${query}`)
          const docs = normalizeAgreementDocs(result)
          return [application.applicationId, docs]
        } catch {
          return [application.applicationId, []]
        }
      })
    )
      .then((entries) => {
        if (!isMounted) return
        const docsByApp = Object.fromEntries(entries)
        setAgreements(docsByApp)

        // Mark apps where all docs are signed
        setSignedByApp((prev) => {
          const next = { ...prev }
          Object.entries(docsByApp).forEach(([appId, docs]) => {
            if (docs.length > 0) {
              next[appId] = docs.every((doc) => doc.signed)
            }
          })
          return next
        })

        // Fetch agreement summaries for apps that are already all signed
        Object.entries(docsByApp).forEach(([appId, docs]) => {
          if (docs.length > 0 && docs.every((doc) => doc.signed)) {
            fetchAgreementSummary(appId).then((url) => {
              if (url && isMounted) {
                setSummaryUrlByApp((prev) => ({ ...prev, [appId]: url }))
              }
            })
          }
        })
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load agreements.')
      })
      .finally(() => {
        if (isMounted) setLoadingAgreements(false)
      })

    return () => {
      isMounted = false
    }
  }, [step, applications, products, catalog.services])

  const uploadFiles = async (files, type) => Promise.all(files.map(async (file) => {
    const result = unwrapData(await uploadApplicationFile(file, type))
    return result?.dLFileUrl || result?.bankLetterFileUrl || result?.fileUrl || result
  }))

  const appHasInStockItems = (applicationId) => {
    const selection = products[applicationId] || { own: false, items: {} }
    if (selection.own) return false
    const selectedEntries = Object.entries(selection.items || {}).filter(([, qty]) => qty > 0)
    if (!selectedEntries.length) return false
    return selectedEntries.some(([id]) => {
      const product = catalog.products.find((p) => String(p.id) === String(id))
      return isItemInStock(product)
    })
  }

  const getInStockTotal = (applicationId) => {
    const selection = products[applicationId] || { own: false, items: {} }
    if (selection.own) return 0
    return Object.entries(selection.items || {}).reduce((total, [id, qty]) => {
      if (!qty || qty <= 0) return total
      const item = catalog.products.find((p) => String(p.id) === String(id))
      if (!item || !isItemInStock(item)) return total
      const price = Number(item.sellingPrice ?? item.price ?? 0)
      return total + price * qty
    }, 0)
  }

  const saveCurrentStep = async () => {
    if (step === 0) {
      const result = unwrapData(await saveApplication({ currentStep: 1, solutions, applicationId: null }))
      const raw = result?.applications || []
      const fallback = result?.applicationId || result?.id
      const selectedServices = catalog.services.filter((s) => solutions.includes(s.solution))
      const categoryIdBySolution = Object.fromEntries(selectedServices.map((s) => [s.solution, s.id]))

      const normalized = (raw.length ? raw : solutions.map((solution) => ({ solution, applicationId: fallback }))).map((item, index) => {
        const solution = item.solution || solutions[index]
        const categoryId = item.categoryId || categoryIdBySolution[solution] || catalog.services.find((s) => s.solution === solution)?.id || null
        return {
          ...item,
          solution,
          applicationId: item.applicationId || item.id || fallback,
          categoryId,
        }
      }).filter((item) => item.applicationId)

      if (!normalized.length) throw new Error('The application service did not return an application ID.')
      setApplications(normalized)
      return
    }

    if (step === 1) {
      await saveApplication({
        currentStep: 2,
        legalName: values.legalName,
        legalAddress: values.legalAddress,
        legalZipCode: values.legalZipCode,
        legalCity: values.legalCity,
        legalState: values.legalState,
        contactNumber: values.contactNumber,
        ebtFnsNumber: values.ebtFnsNumber || undefined,
        businessName: values.sameAsLegal ? values.legalName : values.businessName,
        dbaAddress: values.sameAsLegal ? values.legalAddress : values.dbaAddress,
        businessZipCode: values.sameAsLegal ? values.legalZipCode : values.businessZipCode,
        businessCity: values.sameAsLegal ? values.legalCity : values.businessCity,
        businessState: values.sameAsLegal ? values.legalState : values.businessState,
        dbaPhoneNumber: values.sameAsLegal ? values.contactNumber : values.dbaPhoneNumber,
        taxType: values.taxType || 'FEIN',
        feinNumber: values.feinNumber,
        ownerShipType: values.ownerShipType,
        businessStartDate: values.businessStartDate ? apiDate(values.businessStartDate) : undefined,
        businessType: values.businessType,
        email: values.email,
        website: values.website || undefined,
        productsDescription: values.productsDescription,
        source: 'website',
        applicationIds,
      })
      return
    }

    if (step === 2) {
      const dLFileUrl = await uploadFiles(values.dLFiles, 'applications')
      await saveApplication({
        currentStep: 3,
        merchantFirstName: values.ownerFirstName,
        merchantLastName: values.ownerLastName,
        ownerFirstName: values.ownerFirstName,
        ownerLastName: values.ownerLastName,
        date: apiDate(values.date),
        residentialAddress: values.residentialAddress,
        ownerShipState: values.ownerShipState,
        ownerShipCity: values.ownerShipCity,
        ownerShipZip: values.ownerShipZip,
        socialSecurityNumber: values.socialSecurityNumber,
        ownerEmail: values.ownerEmail,
        ownerPhoneNumber: values.ownerPhoneNumber,
        dLFileUrl,
        applicationIds,
      })
      return
    }

    if (step === 3) {
      const bankLetterFileUrl = await uploadFiles(values.bankFiles, 'application-bank-letter')
      await saveApplication({
        currentStep: 4,
        bankName: values.bankName,
        accountNumber: values.accountNumber,
        routingNumber: values.routingNumber,
        taxCode: values.taxCode || undefined,
        averageSale: values.averageSale || undefined,
        maxSale: values.maxSale || undefined,
        monthlySale: values.monthlySale || undefined,
        comment: values.comment || undefined,
        bankLetterFileUrl,
        applicationIds,
      })
      return
    }

    if (step === 4) {
      // Save plan name and ATM preferences
      await Promise.all(
        applications.map((application) => {
          const selectedPlan = plans[application.applicationId]
          const payload = {
            currentStep: 5,
            plan: selectedPlan,
            applicationId: application.applicationId,
          }
          if (application.solution === 'atm') {
            payload.atmDetails = {
              internetPlan: values.atmInternetPlan,
              surchargeAmount: values.atmSurchargeAmount,
              ownershipOption: values.atmOwnershipOption,
              model: values.atmModel,
              estimatedMonthlyTransactions: values.atmEstimatedMonthlyTransactions,
            }
          }
          return saveApplication(payload)
        })
      )
      return
    }

    if (step === 5) {
      await Promise.all(
        applications.map((application) => {
          const selection = products[application.applicationId] || { own: false, items: {} }
          const hardware = Object.entries(selection.items || {})
            .filter(([, quantity]) => quantity > 0)
            .map(([itemServiceId, quantity]) => {
              const item = catalog.products.find((product) => String(product.id) === String(itemServiceId)) || {}
              return {
                applicationId: application.applicationId,
                itemServiceId: item.id,
                pictureUrl: item.fileUrl || item.pictureUrl,
                name: item.name,
                price: item.sellingPrice ?? item.price,
                quantity,
                inStock: isItemInStock(item),
              }
            })
          return saveApplication({
            currentStep: 6,
            hardware,
            hasOwnHardware: selection.own,
            applicationId: application.applicationId,
          })
        })
      )
      return
    }

    if (step === 6) {
      await Promise.all(
        applications.map((application) =>
          saveApplication({
            currentStep: 7,
            preferences: preferences[application.applicationId] || {},
            applicationId: application.applicationId,
          })
        )
      )
      return
    }

    if (step === 7) {
      await Promise.all(
        applications.map((application) => {
          const form = shipments[application.applicationId]
          const isMerchantOwned = products[application.applicationId]?.own || form.type === 'MerchantOwned'
          const shipment = {
            applicationId: application.applicationId,
            type: isMerchantOwned ? 'MerchantOwned' : form.type,
          }

          if (form.type === 'Shipping' && !isMerchantOwned) {
            shipment.shippingDetails = {
              recipientName: form.recipientName,
              phoneNumber: form.recipientPhone,
              email: form.email,
              address: form.address,
              floorStreet: form.floorStreet || undefined,
              zipCode: form.zipCode,
              country: form.country || 'United States',
              state: form.state,
              companyName: form.companyName || undefined,
            }
          }

          if (form.type === 'Pickup' && !isMerchantOwned) {
            shipment.pickupDetails = {
              pickupLocationName: form.pickupLocationName,
              contactName: form.contactName,
              pickupDate: form.pickupDate,
            }
            if (form.specialInstructions) shipment.specialInstructions = form.specialInstructions
          }

          const hasInStock = appHasInStockItems(application.applicationId)
          const effectivePaymentType = (!hasInStock && form.paymentType === 'Pay Now') ? 'Pay Later' : form.paymentType

          const payload = {
            currentStep: 8,
            paymentMethod: isMerchantOwned
              ? 'merchantowned'
              : effectivePaymentType === 'Lease'
                ? 'lease'
                : effectivePaymentType === 'Pay Later'
                  ? 'pay-later'
                  : 'card',
            shipment,
            applicationId: application.applicationId,
          }

          if (!isMerchantOwned && effectivePaymentType === 'Pay Now' && hasInStock) {
            const expiryAuthDate = getAuthorizeExpirationDate(form.expiryDate)
            const cleanCard = digits(form.cardNumber, 16)
            const inStockAmount = getInStockTotal(application.applicationId)

            shipment.cardDetails = {
              nameOnCard: form.nameOnCard,
              expiryDate: expiryAuthDate,
              cardNumber: cleanCard,
              cvv: form.cvv,
              billingAddress: form.billingAddress,
            }

            payload.authorizeNetPayment = {
              card: {
                cardNumber: cleanCard,
                expirationDate: expiryAuthDate,
                cardCode: form.cvv,
              },
              amount: inStockAmount,
            }
          }

          if (!isMerchantOwned && effectivePaymentType === 'Pay Later') {
            payload.payLater = true
          }

          if (!isMerchantOwned && effectivePaymentType === 'Lease') {
            shipment.leaseDetails = {
              leaseTerm: form.leaseTerm,
              monthlyPayment: form.monthlyPayment,
              startDate: form.startDate,
              billingAddress: form.billingAddress,
            }
          }

          return saveApplication(payload)
        })
      )
    }
  }

  const handleOpenPdfModal = (applicationId, docIndex = 0) => {
    setActiveAppId(applicationId)
    setActiveDocIndex(docIndex)
    setViewingSummary(false)
    setIsPdfModalOpen(true)
  }

  const handleSignatureSubmit = async (signatureDataUrl) => {
    if (!activeAppId) return
    const docs = agreements[activeAppId] || []
    const activeDoc = docs[activeDocIndex] || null

    if (!activeDoc?.agreementId) {
      setError('No active agreement document selected.')
      return
    }

    setIsSigningDoc(true)
    setError('')

    try {
      const signatureFile = dataUrlToFile(signatureDataUrl, 'signature.png')
      const uploadRes = await uploadApplicationFile(signatureFile, 'application-merchant-signature')
      const fileRef = extractFileReference(uploadRes)

      if (!fileRef.url) {
        throw new Error('Failed to upload signature.')
      }

      setUploadedSignatures((prev) => ({ ...prev, [activeAppId]: fileRef.url }))

      const signRes = await signAgreementDocument(activeAppId, activeDoc.agreementId, fileRef.url)
      const signedData = unwrapData(signRes)

      const updatedDocs = docs.map((doc, idx) => {
        if (idx === activeDocIndex || doc.agreementId === activeDoc.agreementId) {
          return {
            ...doc,
            status: signedData?.status || 'signed',
            url: signedData?.signedFileUrl?.url || fileRef.url || doc.url,
            signed: true,
            signedFileUrl: signedData?.signedFileUrl || { url: fileRef.url },
          }
        }
        return doc
      })

      setAgreements((prev) => ({ ...prev, [activeAppId]: updatedDocs }))
      setShowSignatureModal(false)

      const allSigned = updatedDocs.every((doc) => doc.signed)
      if (allSigned) {
        setSignedByApp((prev) => ({ ...prev, [activeAppId]: true }))
        fetchAgreementSummary(activeAppId).then((url) => {
          if (url) setSummaryUrlByApp((prev) => ({ ...prev, [activeAppId]: url }))
        })
      }

      const nextUnsignedIdx = updatedDocs.findIndex((d) => !d.signed)
      if (nextUnsignedIdx >= 0) {
        setActiveDocIndex(nextUnsignedIdx)
        setViewingSummary(false)
        setIsPdfModalOpen(true)
      } else {
        const nextApp = applications.find(
          (app) =>
            String(app.applicationId) !== String(activeAppId) &&
            !signedByApp[app.applicationId] &&
            (agreements[app.applicationId] || []).some((d) => !d.signed)
        )
        if (nextApp) {
          const nextDocs = agreements[nextApp.applicationId] || []
          const nextUnsigned = nextDocs.findIndex((d) => !d.signed)
          setActiveAppId(nextApp.applicationId)
          setActiveDocIndex(nextUnsigned >= 0 ? nextUnsigned : 0)
          setViewingSummary(false)
          setIsPdfModalOpen(true)
        } else {
          setIsPdfModalOpen(true)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit signature.')
    } finally {
      setIsSigningDoc(false)
    }
  }

  const submitFinalApplications = async () => {
    if (!isRobotVerified) {
      const msg = 'Please complete the Google reCAPTCHA security verification challenge.'
      setError(msg)
      setErrors((prev) => ({ ...prev, recaptcha: msg }))
      requestAnimationFrame(() => {
        const captchaEl = document.getElementById('google-recaptcha-wrapper')
        captchaEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      return
    }

    setLoading(true)
    setError('')
    try {
      await Promise.all(
        applications.map((app) => {
          const signatureUrl = uploadedSignatures[app.applicationId]
          return saveApplication({
            currentStep: 9,
            agreedTermsAndConditon: true,
            merchantSignatureFileUrl: signatureUrl ? { url: signatureUrl } : undefined,
            status: 'pending',
            applicationId: app.applicationId,
          })
        })
      )
      onComplete(applications)
    } catch (err) {
      setError(err.message || 'Failed to submit application.')
    } finally {
      setLoading(false)
    }
  }

  const next = async () => {
    const nextErrors = validate(step, values, solutions, plans, products, shipments, checkedByApp, applications, isRobotVerified)
    setErrors(nextErrors)
    setError('')

    if (Object.keys(nextErrors).length) {
      if (nextErrors.accepted) {
        setError(nextErrors.accepted)
      } else if (nextErrors.recaptcha) {
        setError(nextErrors.recaptcha)
      } else {
        const firstErrorKey = Object.keys(nextErrors)[0]
        setError(nextErrors[firstErrorKey] || 'Please review and fix the highlighted fields above.')
      }
      requestAnimationFrame(() => {
        const firstErrEl = document.querySelector('[aria-invalid="true"], [data-error="true"], .border-rose-500')
        firstErrEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        firstErrEl?.focus?.()
      })
      return
    }

    setLoading(true)
    try {
      if (step === 8) {
        const unsignedApp = applications.find((app) => {
          const isSigned = Boolean(signedByApp[app.applicationId])
          const docs = agreements[app.applicationId] || []
          return !isSigned && docs.length > 0
        })

        if (unsignedApp) {
          const docs = agreements[unsignedApp.applicationId] || []
          const firstUnsignedIdx = docs.findIndex((d) => !d.signed)
          setActiveAppId(unsignedApp.applicationId)
          setActiveDocIndex(firstUnsignedIdx >= 0 ? firstUnsignedIdx : 0)
          setViewingSummary(false)
          setIsPdfModalOpen(true)
          return
        }

        await submitFinalApplications()
      } else {
        await saveCurrentStep()
        if (step === 1 && values.ownerSameAsLegal) {
          setValues((current) => ({
            ...current,
            residentialAddress: current.legalAddress,
            ownerShipZip: current.legalZipCode,
            ownerShipCity: current.legalCity,
            ownerShipState: current.legalState,
            ownerPhoneNumber: current.contactNumber,
            ownerEmail: current.email,
          }))
        }
        setStep((current) => current + 1)
        setErrors({})
        requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setLoading(false)
    }
  }

  const back = () => {
    setErrors({})
    setError('')
    setStep((current) => Math.max(0, current - 1))
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }

  const setShipment = (id, key, value) => setShipments((current) => ({
    ...current,
    [id]: { ...current[id], [key]: value },
  }))

  const updateMerchantOwnedPreference = (applicationId, key, value) => {
    setShipments((current) => ({
      ...current,
      [applicationId]: {
        ...current[applicationId],
        merchantOwnedPreferences: {
          ...(current[applicationId]?.merchantOwnedPreferences || {}),
          [key]: value,
        },
      },
    }))
  }

  const businessFields = (prefix = '') => (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field
        id={`${prefix}address`}
        label="Address"
        required
        value={values[`${prefix}Address`]}
        onChange={(event) => change(`${prefix}Address`, event.target.value)}
        error={errors[`${prefix}Address`]}
      />
      <Field
        id={`${prefix}zip`}
        label="ZIP Code"
        required
        value={values[`${prefix}ZipCode`]}
        onChange={(event) => change(`${prefix}ZipCode`, digits(event.target.value, 5))}
        placeholder="78701"
        maxLength={5}
        error={errors[`${prefix}ZipCode`]}
      />
      <Field
        id={`${prefix}city`}
        label="City"
        required
        value={values[`${prefix}City`]}
        onChange={(event) => change(`${prefix}City`, event.target.value)}
        error={errors[`${prefix}City`]}
      />
      <SelectField
        id={`${prefix}state`}
        label="State"
        required
        value={values[`${prefix}State`]}
        onChange={(event) => change(`${prefix}State`, event.target.value)}
        options={states}
        error={errors[`${prefix}State`]}
      />
    </div>
  )

  const activeDocs = activeAppId ? agreements[activeAppId] || [] : []
  const activeIsAllSigned = activeDocs.length > 0 && activeDocs.every((d) => d.signed)

  return (
    <div ref={topRef} className="min-w-0 max-w-full scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-4 sm:p-8">
        <Progress current={step} />
      </div>

      <div className="min-w-0 p-4 sm:p-8 lg:p-10">
        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {/* Step 0: Services */}
        {step === 0 && (
          <>
            <StepTitle title="Select your services" description="Choose every service your business needs. A separate linked application will be created for each selection." />
            {errors.solutions && <p tabIndex="-1" data-error="true" className="mb-4 text-sm font-bold text-rose-600">{errors.solutions}</p>}
            {loadingData ? (
              <LoaderCircle className="mx-auto my-16 animate-spin text-primary" size={36} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {catalog.services.map((service) => {
                  const selected = solutions.includes(service.solution)
                  const ServiceIcon = solutionIcons[service.solution] || WalletCards
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => setSolutions((current) => selected ? current.filter((item) => item !== service.solution) : [...current, service.solution])}
                      className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition ${selected ? 'border-primary bg-mist shadow-md' : 'border-slate-200 hover:border-primary/50 hover:shadow-sm'}`}
                    >
                      <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition ${selected ? 'bg-primary text-white' : 'bg-mist text-primary group-hover:bg-primary group-hover:text-white'}`}>
                        <ServiceIcon size={27} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-navy">{service.title}</strong>
                        <span className="mt-1 block text-sm capitalize text-slate-500">{String(service.solution).replaceAll('-', ' ')}</span>
                      </span>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}>
                        {selected && <Check size={16} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Step 1: Business Information */}
        {step === 1 && (
          <>
            <StepTitle title="Business information" description="Tell us about the legal entity and the business location where you operate." />
            <h3 className="mb-4 text-lg font-extrabold text-navy">Legal information</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="legalName" label="Legal Business Name" required value={values.legalName} onChange={(event) => change('legalName', event.target.value)} error={errors.legalName} />
              <Field id="contactNumber" label="Legal Phone Number" required value={values.contactNumber} onChange={(event) => change('contactNumber', phone(event.target.value))} error={errors.contactNumber} />
            </div>
            <div className="mt-5">{businessFields('legal')}</div>
            {solutions.includes('ebt') && (
              <div className="mt-5">
                <Field id="ebtFnsNumber" label="EBT FNS Number" required value={values.ebtFnsNumber} onChange={(event) => change('ebtFnsNumber', event.target.value)} error={errors.ebtFnsNumber} tooltip="Food and Nutrition Service 7-digit retailer authorization number." />
              </div>
            )}
            <label className="mt-6 flex items-center gap-3 font-semibold text-slate-700">
              <input type="checkbox" checked={values.sameAsLegal} onChange={(event) => change('sameAsLegal', event.target.checked)} className="h-5 w-5 accent-primary" />
              Business information is the same as legal information
            </label>
            {!values.sameAsLegal && (
              <div className="mt-7 border-t border-slate-200 pt-7">
                <h3 className="mb-4 text-lg font-extrabold text-navy">DBA information</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="businessName" label="Business Name (DBA)" required value={values.businessName} onChange={(event) => change('businessName', event.target.value)} error={errors.businessName} />
                  <Field id="dbaPhoneNumber" label="DBA Phone Number" required value={values.dbaPhoneNumber} onChange={(event) => change('dbaPhoneNumber', phone(event.target.value))} error={errors.dbaPhoneNumber} />
                </div>
                <div className="mt-5">{businessFields('dba')}</div>
              </div>
            )}
            <div className="mt-7 grid gap-5 border-t border-slate-200 pt-7 sm:grid-cols-2">
              <SelectField
                id="taxType"
                label="Type of Tax ID"
                required
                value={values.taxType || 'FEIN'}
                onChange={(event) => change('taxType', event.target.value)}
                options={['FEIN', 'EIN']}
                error={errors.taxType}
                tooltip="Federal Tax Identification type (FEIN or EIN assigned by IRS)."
              />
              <Field
                id="feinNumber"
                label="FEIN / Tax ID Number (9 Digits)"
                required
                value={values.feinNumber}
                onChange={(event) => change('feinNumber', digits(event.target.value, 9))}
                placeholder="123456789"
                maxLength={9}
                error={errors.feinNumber}
                tooltip="9-digit Federal Employer Identification Number assigned by the IRS."
              />
              <SelectField id="ownerShipType" label="Ownership Type" required value={values.ownerShipType} onChange={(event) => change('ownerShipType', event.target.value)} options={['Sole Proprietorship', 'Partnership', 'Corporation', 'LLC', 'Non-Profit']} error={errors.ownerShipType} />
              <Field id="businessStartDate" label="Business Start Date" type="date" value={values.businessStartDate} onChange={(event) => change('businessStartDate', event.target.value)} />
              <SelectField id="businessType" label="Business Type" required value={values.businessType} onChange={(event) => change('businessType', event.target.value)} options={['Retail', 'Restaurant', 'Service', 'E-Commerce', 'Wholesale', 'Other']} error={errors.businessType} tooltip="Primary business category determining rate classification." />
              <Field id="email" label="Business Email" required type="email" value={values.email} onChange={(event) => change('email', event.target.value)} error={errors.email} />
              <Field id="website" label="Website URL" type="url" placeholder="https://" value={values.website} onChange={(event) => change('website', event.target.value)} />
              <Field id="productsDescription" label="Products / Services Description" required value={values.productsDescription} onChange={(event) => change('productsDescription', event.target.value)} error={errors.productsDescription} tooltip="Brief explanation of what goods or services your business sells." />
            </div>
          </>
        )}

        {/* Step 2: Ownership Information */}
        {step === 2 && (
          <>
            <StepTitle title="Ownership information" description="Provide details for the primary owner or authorized principal." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="ownerFirstName" label="Owner First Name" required value={values.ownerFirstName} onChange={(event) => change('ownerFirstName', event.target.value)} error={errors.ownerFirstName} />
              <Field id="ownerLastName" label="Owner Last Name" required value={values.ownerLastName} onChange={(event) => change('ownerLastName', event.target.value)} error={errors.ownerLastName} />
              <Field id="date" label="Date of Birth" required type="date" value={values.date} onChange={(event) => change('date', event.target.value)} error={errors.date} tooltip="Owner must be at least 18 years old to execute merchant agreements." />
              <MaskedField
                id="socialSecurityNumber"
                label="Social Security Number (9 Digits)"
                required
                value={values.socialSecurityNumber}
                onChange={(event) => change('socialSecurityNumber', digits(event.target.value, 9))}
                placeholder="123456789"
                maxLength={9}
                inputMode="numeric"
                error={errors.socialSecurityNumber}
                tooltip="Required by federal banking laws for identity verification and anti-money laundering compliance."
              />
            </div>
            <label className="mt-6 flex items-center gap-3 font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={values.ownerSameAsLegal}
                onChange={(event) => {
                  const checked = event.target.checked
                  change('ownerSameAsLegal', checked)
                  if (checked) {
                    setValues((current) => ({
                      ...current,
                      residentialAddress: current.legalAddress,
                      ownerShipZip: current.legalZipCode,
                      ownerShipCity: current.legalCity,
                      ownerShipState: current.legalState,
                      ownerPhoneNumber: current.contactNumber,
                      ownerEmail: current.email,
                    }))
                  }
                }}
                className="h-5 w-5 accent-primary"
              />
              Owner information is the same as legal information
            </label>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field id="residentialAddress" label="Residential Address" required value={values.residentialAddress} onChange={(event) => change('residentialAddress', event.target.value)} error={errors.residentialAddress} />
              <Field id="ownerShipZip" label="ZIP Code" required value={values.ownerShipZip} onChange={(event) => change('ownerShipZip', digits(event.target.value, 5))} placeholder="78701" maxLength={5} error={errors.ownerShipZip} />
              <Field id="ownerShipCity" label="City" required value={values.ownerShipCity} onChange={(event) => change('ownerShipCity', event.target.value)} error={errors.ownerShipCity} />
              <SelectField id="ownerShipState" label="State" required value={values.ownerShipState} onChange={(event) => change('ownerShipState', event.target.value)} options={states} error={errors.ownerShipState} />
              <Field id="ownerPhoneNumber" label="Owner Phone Number" required value={values.ownerPhoneNumber} onChange={(event) => change('ownerPhoneNumber', phone(event.target.value))} error={errors.ownerPhoneNumber} />
              <Field id="ownerEmail" label="Owner Email" required type="email" value={values.ownerEmail} onChange={(event) => change('ownerEmail', event.target.value)} error={errors.ownerEmail} />
            </div>
            <div className="mt-6">
              <Field id="dLFiles" label="Driver License or Government ID (Upload)" required error={errors.dLFiles} tooltip="Front and back photo of government-issued driver license or passport.">
                <input
                  id="dLFiles"
                  type="file"
                  multiple
                  onChange={(event) => change('dLFiles', [...event.target.files])}
                  className={`${formControlClasses} file:mr-4 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:font-bold file:text-primary`}
                />
              </Field>
            </div>
          </>
        )}

        {/* Step 3: Financial Information */}
        {step === 3 && (
          <>
            <StepTitle title="Financial information" description="Enter the settlement account and expected processing figures." />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="bankName" label="Bank Name" value={values.bankName} onChange={(event) => change('bankName', event.target.value)} placeholder="e.g. Chase, Bank of America" />
              <MaskedField
                id="accountNumber"
                label="Account Number"
                required
                value={values.accountNumber}
                onChange={(event) => change('accountNumber', event.target.value)}
                placeholder="Settlement checking account number"
                error={errors.accountNumber}
                tooltip="Settlement checking account where daily batch deposits will be credited."
              />
              <MaskedField
                id="routingNumber"
                label="Routing Number (9 Digits)"
                required
                value={values.routingNumber}
                onChange={(event) => change('routingNumber', digits(event.target.value, 9))}
                placeholder="9-digit bank routing number"
                maxLength={9}
                inputMode="numeric"
                error={errors.routingNumber}
                tooltip="9-digit ABA routing number identifying your financial institution."
              />
              <MaskedField
                id="taxCode"
                label="Tax Exempt Code (Optional)"
                value={values.taxCode}
                onChange={(event) => change('taxCode', event.target.value)}
                placeholder="Exemption certificate code if applicable"
                tooltip="Optional state or federal tax exemption certificate number."
              />
              <div className="sm:col-span-2">
                <Field id="bankFiles" label="Void Check or Bank Letter" required error={errors.bankFiles} tooltip="Required by bank underwriting to verify account ownership and deposit routing.">
                  <input
                    id="bankFiles"
                    type="file"
                    multiple
                    onChange={(event) => change('bankFiles', [...event.target.files])}
                    className={`${formControlClasses} file:mr-4 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:font-bold file:text-primary`}
                  />
                </Field>
              </div>
              {solutions.some((solution) => saleSolutions.has(solution)) && (
                <>
                  <Field id="averageSale" label="Average Sale ($)" required type="number" min="0" step="0.01" value={values.averageSale} onChange={(event) => change('averageSale', event.target.value)} error={errors.averageSale} tooltip="Estimated average single transaction ticket amount in dollars." />
                  <Field id="maxSale" label="Maximum Sale ($)" required type="number" min="0" step="0.01" value={values.maxSale} onChange={(event) => change('maxSale', event.target.value)} error={errors.maxSale} tooltip="Highest single transaction amount you expect to process." />
                  <Field id="monthlySale" label="Estimated Monthly Volume ($)" required type="number" min="0" step="0.01" value={values.monthlySale} onChange={(event) => change('monthlySale', event.target.value)} error={errors.monthlySale} tooltip="Total expected credit card sales volume per month." />
                </>
              )}
              <div className="sm:col-span-2">
                <Field id="comment" label="Comments / Notes" value={values.comment} onChange={(event) => change('comment', event.target.value)} placeholder="Any special instructions or underwriting notes" />
              </div>
            </div>
          </>
        )}

        {/* Step 4: Plan Selection */}
        {step === 4 && (
          <>
            <StepTitle title="Select a plan" description="Choose one available pricing plan for each requested service." />
            {errors.plan && <p tabIndex="-1" data-error="true" className="mb-4 font-bold text-rose-600">{errors.plan}</p>}
            <div className="space-y-8">
              {applications.map((application) => {
                const available = catalog.plans.filter(
                  (plan) => String(plan.service).toLowerCase() === application.solution.toLowerCase()
                )
                const currentPlan = plans[application.applicationId]
                const normalizedCurrentPlan = (currentPlan || '').toLowerCase()

                return (
                  <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <h3 className="mb-4 text-lg font-extrabold capitalize text-navy">
                      {getServiceLabel(application.solution)}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {available.map((plan) => {
                        const isSelected = currentPlan === plan.name
                        const details = getPlanDetails(plan)
                        const PlanIcon = details.Icon

                        return (
                          <button
                            type="button"
                            key={plan.id}
                            onClick={() => setPlans((current) => ({ ...current, [application.applicationId]: plan.name }))}
                            className={`group relative flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-center transition ${isSelected ? 'border-primary bg-mist shadow-md' : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-sm'}`}
                          >
                            <span className={`absolute right-3.5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border transition ${isSelected ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'}`}>
                              {isSelected && <Check size={12} />}
                            </span>

                            <div className="flex flex-col items-center">
                              <span className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${isSelected ? 'bg-primary text-white' : 'bg-mist text-primary group-hover:bg-primary group-hover:text-white'}`}>
                                <PlanIcon size={24} />
                              </span>
                              <strong className="mt-3.5 text-base font-extrabold text-navy">{details.title}</strong>
                              {details.rate && (
                                <p className="mt-1 text-base font-black text-primary">
                                  {details.rate}
                                </p>
                              )}
                              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                                {details.desc}
                              </p>
                            </div>

                            {details.feeNote && (
                              <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-400">
                                {details.feeNote}
                              </p>
                            )}
                          </button>
                        )
                      })}
                      {!available.length && (
                        <p className="col-span-full rounded-xl bg-mist p-4 text-sm font-semibold text-primary-dark">
                          No plans are currently configured for this service. Standard rates apply.
                        </p>
                      )}
                    </div>

                    {/* ATM Plan Conditional Flow */}
                    {application.solution === 'atm' && (normalizedCurrentPlan.includes('owner') || normalizedCurrentPlan.includes('placement')) && (
                      <div className="mt-8 rounded-2xl border border-primary/20 bg-slate-50/70 p-5 sm:p-6 space-y-5">
                        <div className="flex items-center gap-2">
                          <Banknote size={20} className="text-primary" />
                          <h4 className="text-base font-extrabold text-navy">
                            ATM Configuration & Requirements ({normalizedCurrentPlan.includes('owner') ? 'Ownership' : 'Placement'})
                          </h4>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                          <SelectField
                            id="atmInternetPlan"
                            label="Internet / Data Plan"
                            required
                            value={values.atmInternetPlan}
                            onChange={(e) => change('atmInternetPlan', e.target.value)}
                            options={[
                              'Wireless Cellular Data ($15/month)',
                              'Merchant High-Speed Internet (Free)',
                              'Standard Phone Line',
                            ]}
                            error={errors.atmInternetPlan}
                            tooltip="Connectivity method required for ATM transaction authorization."
                          />

                          {normalizedCurrentPlan.includes('owner') && (
                            <>
                              <Field
                                id="atmSurchargeAmount"
                                label="Surcharge Amount ($)"
                                required
                                value={values.atmSurchargeAmount}
                                onChange={(e) => change('atmSurchargeAmount', e.target.value)}
                                placeholder="3.00"
                                error={errors.atmSurchargeAmount}
                                tooltip="Fee charged to ATM cardholders per cash withdrawal."
                              />
                              <SelectField
                                id="atmOwnershipOption"
                                label="ATM Ownership Option"
                                required
                                value={values.atmOwnershipOption}
                                onChange={(e) => change('atmOwnershipOption', e.target.value)}
                                options={[
                                  'Buy New ATM from Dolphin',
                                  'Use Existing ATM Machine',
                                  'Rent to Own Program',
                                ]}
                                error={errors.atmOwnershipOption}
                                tooltip="Method of ATM machine procurement."
                              />
                              <SelectField
                                id="atmModel"
                                label="ATM Model"
                                required
                                value={values.atmModel}
                                onChange={(e) => change('atmModel', e.target.value)}
                                options={[
                                  'Hyosung Halo II',
                                  'Genmega G2500',
                                  'Hantle 1700W',
                                  'Genmega Onyx',
                                  'Other Approved Model',
                                ]}
                                error={errors.atmModel}
                                tooltip="ATM hardware manufacturer and model designation."
                              />
                            </>
                          )}

                          {normalizedCurrentPlan.includes('placement') && (
                            <SelectField
                              id="atmEstimatedMonthlyTransactions"
                              label="Estimated Monthly ATM Transactions"
                              required
                              value={values.atmEstimatedMonthlyTransactions}
                              onChange={(e) => change('atmEstimatedMonthlyTransactions', e.target.value)}
                              options={[
                                '100 - 250 transactions/mo',
                                '250 - 500 transactions/mo',
                                '500 - 1000 transactions/mo',
                                '1000+ transactions/mo',
                              ]}
                              error={errors.atmEstimatedMonthlyTransactions}
                              tooltip="Estimated foot traffic withdrawals for placement program qualification."
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )
              })}
            </div>

            {/* General Fee Explanation Disclosure for all plans */}
            <div className="mt-6 rounded-2xl border border-primary/20 bg-slate-50/80 p-4 sm:p-5 text-xs leading-relaxed text-slate-600">
              <p>
                <strong className="text-navy">*DMS Monthly Fee</strong> refers to the Dolphin Merchant Service Monthly Fee, which includes PCI compliance support, gateway connectivity, and customer service.
              </p>
            </div>
          </>
        )}

        {/* Step 5: Hardware Selection */}
        {step === 5 && (
          <>
            <StepTitle title="Hardware and equipment" description="Select the products you need, or tell us you already have compatible hardware." />
            {errors.products && <p tabIndex="-1" data-error="true" className="mb-4 font-bold text-rose-600">{errors.products}</p>}

            {/* Hardware Live Search Bar */}
            <div className="relative mb-6">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search hardware by device name (PAX, Clover, printer, scanner...)"
                value={hardwareSearch}
                onChange={(e) => setHardwareSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-10 pr-10 text-sm font-medium text-navy placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {hardwareSearch && (
                <button
                  type="button"
                  onClick={() => setHardwareSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="space-y-9">
              {applications.map((application) => {
                const selection = products[application.applicationId] || { own: false, items: {} }
                let available = catalog.products.filter((product) => product.category?.solution === application.solution)
                if (hardwareSearch.trim()) {
                  const q = hardwareSearch.toLowerCase().trim()
                  available = available.filter((p) => (p.name + ' ' + (p.description || '')).toLowerCase().includes(q))
                }

                return (
                  <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-extrabold capitalize text-navy">{getServiceLabel(application.solution)}</h3>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={selection.own}
                          onChange={(event) => setProducts((current) => ({
                            ...current,
                            [application.applicationId]: { own: event.target.checked, items: event.target.checked ? {} : selection.items },
                          }))}
                          className="h-5 w-5 accent-primary"
                        />
                        I already have hardware
                      </label>
                    </div>

                    {!selection.own && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {available.map((product) => {
                          const quantity = selection.items[product.id] || 0
                          const price = Number(product.sellingPrice ?? product.price ?? 0)
                          const imageUrl = getProductImageUrl(product)

                          return (
                            <div key={product.id} className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition ${quantity ? 'border-primary bg-mist shadow-sm' : 'border-slate-200 bg-white'}`}>
                              <div className="flex gap-3.5 items-start">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-1 overflow-hidden">
                                  <img
                                    src={imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                      e.currentTarget.src = getProductImageUrl(product)
                                    }}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <strong className="block truncate text-sm font-extrabold text-navy" title={product.name}>
                                      {product.name}
                                    </strong>
                                    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${isItemInStock(product) ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                                      {isItemInStock(product) ? 'In stock' : 'Special order'}
                                    </span>
                                  </div>
                                  <p className="mt-1 font-black text-primary text-base">${price.toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-xs font-bold text-slate-500">Select Quantity:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white font-bold hover:bg-slate-50 transition"
                                    onClick={() => setProducts((current) => ({
                                      ...current,
                                      [application.applicationId]: {
                                        ...selection,
                                        items: { ...selection.items, [product.id]: Math.max(0, quantity - 1) },
                                      },
                                    }))}
                                  >
                                    -
                                  </button>
                                  <span className="w-7 text-center font-bold text-navy text-sm">{quantity}</span>
                                  <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white font-bold hover:bg-slate-50 transition"
                                    onClick={() => setProducts((current) => ({
                                      ...current,
                                      [application.applicationId]: {
                                        ...selection,
                                        items: { ...selection.items, [product.id]: quantity + 1 },
                                      },
                                    }))}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {!available.length && (
                          <p className="col-span-full rounded-xl bg-mist p-4 text-sm font-semibold text-slate-600">
                            {hardwareSearch ? 'No equipment matching your search.' : 'No equipment items required for this service.'}
                          </p>
                        )}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          </>
        )}

        {/* Step 6: Preferences */}
        {step === 6 && (
          <>
            <StepTitle title="Application preferences" description="Configure service-specific preferences supplied by our application system." />
            <div className="space-y-9">
              {applications.map((application) => {
                const definitions = catalog.preferences
                  .filter((item) => item.formName === preferenceForms[application.solution])
                  .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
                const appValues = preferences[application.applicationId] || {}
                return (
                  <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <h3 className="mb-4 text-lg font-extrabold capitalize text-navy">{getServiceLabel(application.solution)}</h3>
                    <div className="grid gap-5 sm:grid-cols-2">
                      {definitions.map((definition) => {
                        const setValue = (value) => setPreferences((current) => ({
                          ...current,
                          [application.applicationId]: { ...appValues, [definition.name]: value },
                        }))
                        if (definition.preference === 'switch') {
                          return (
                            <label key={definition.name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 font-bold text-navy">
                              <input
                                type="checkbox"
                                checked={Boolean(appValues[definition.name])}
                                onChange={(event) => setValue(event.target.checked)}
                                className="h-5 w-5 accent-primary"
                              />
                              {definition.name}
                            </label>
                          )
                        }
                        if (definition.preference === 'dropdown') {
                          return (
                            <SelectField
                              key={definition.name}
                              id={`pref-${application.applicationId}-${definition.order}`}
                              label={definition.name}
                              value={appValues[definition.name] || ''}
                              onChange={(event) => setValue(event.target.value)}
                              options={(definition.extra || []).map((item) => typeof item === 'string' ? item : { value: item.value || item.title || item.name, label: item.title || item.name || item.value })}
                            />
                          )
                        }
                        return (
                          <Field
                            key={definition.name}
                            id={`pref-${application.applicationId}-${definition.order}`}
                            label={definition.name}
                            type={definition.preference === 'datePicker' ? 'date' : definition.preference === 'timePicker' ? 'time' : 'text'}
                            value={appValues[definition.name] || ''}
                            onChange={(event) => setValue(event.target.value)}
                          />
                        )
                      })}
                      {!definitions.length && (
                        <p className="col-span-full rounded-xl bg-mist p-4 text-sm font-semibold text-slate-600">
                          No additional configuration needed for this service.
                        </p>
                      )}
                    </div>
                  </section>
                )
              })}
            </div>
          </>
        )}

        {/* Step 7: Delivery & Payment (Auto Pre-filled) */}
        {step === 7 && (
          <>
            <StepTitle title="Delivery and payment" description="Choose how each equipment order should be fulfilled and paid." />
            <div className="space-y-10">
              {applications.map((application) => {
                const form = shipments[application.applicationId]
                if (!form) return null
                const ownHardware = products[application.applicationId]?.own
                const inStockAmount = getInStockTotal(application.applicationId)

                return (
                  <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                    <h3 className="text-lg font-extrabold capitalize text-navy">{getServiceLabel(application.solution)}</h3>
                    {errors[`shipment-${application.applicationId}`] && (
                      <p className="mt-3 font-bold text-rose-600">{errors[`shipment-${application.applicationId}`]}</p>
                    )}
                    {errors[`payment-${application.applicationId}`] && (
                      <p className="mt-3 font-bold text-rose-600">{errors[`payment-${application.applicationId}`]}</p>
                    )}

                    {/* Fulfillment Method */}
                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {(ownHardware ? ['MerchantOwned'] : ['Shipping', 'Pickup', 'MerchantOwned']).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setShipment(application.applicationId, 'type', type)}
                          className={`rounded-xl border px-4 py-3 font-bold transition ${(ownHardware || form.type === 'MerchantOwned' ? type === 'MerchantOwned' : form.type === type) ? 'border-primary bg-mist text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          {type === 'MerchantOwned' ? 'Merchant-Owned' : type}
                        </button>
                      ))}
                    </div>

                    {/* Merchant-Owned Form */}
                    {(form.type === 'MerchantOwned' || ownHardware) && (
                      <div className="mt-6 space-y-5">
                        <div className="rounded-xl border border-primary/20 bg-mist p-4">
                          <p className="text-sm font-bold text-navy">
                            Merchant-Owned Equipment Details
                          </p>
                          <p className="mt-1 text-xs text-slate-600">
                            Please provide details about your existing equipment and terminal setup for this service.
                          </p>
                        </div>

                        {(() => {
                          const formName = merchantOwnedForms[application.solution]
                          const preferenceDefs = (catalog.preferences || [])
                            .filter((item) => item.formName === formName)
                            .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))

                          if (!preferenceDefs.length) {
                            return (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">
                                No additional merchant-owned equipment preferences required for this service.
                              </div>
                            )
                          }

                          const moValues = form.merchantOwnedPreferences || {}

                          return (
                            <div className="grid gap-5 sm:grid-cols-2">
                              {preferenceDefs.map((def) => {
                                const val = moValues[def.name] ?? ''

                                if (def.preference === 'switch') {
                                  return (
                                    <label
                                      key={def.name}
                                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 font-bold text-navy"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={Boolean(val)}
                                        onChange={(e) => updateMerchantOwnedPreference(application.applicationId, def.name, e.target.checked)}
                                        className="h-5 w-5 accent-primary"
                                      />
                                      {def.name}
                                    </label>
                                  )
                                }

                                if (def.preference === 'dropdown') {
                                  const options = (def.extra || []).map((item) =>
                                    typeof item === 'string'
                                      ? item
                                      : { value: item.value || item.title || item.name, label: item.title || item.name || item.value }
                                  )
                                  return (
                                    <SelectField
                                      key={def.name}
                                      id={`mo-${application.applicationId}-${def.order}`}
                                      label={def.name}
                                      value={val}
                                      onChange={(e) => updateMerchantOwnedPreference(application.applicationId, def.name, e.target.value)}
                                      options={options}
                                    />
                                  )
                                }

                                return (
                                  <Field
                                    key={def.name}
                                    id={`mo-${application.applicationId}-${def.order}`}
                                    label={def.name}
                                    type={def.preference === 'datePicker' ? 'date' : def.preference === 'timePicker' ? 'time' : 'text'}
                                    value={val}
                                    onChange={(e) => updateMerchantOwnedPreference(application.applicationId, def.name, e.target.value)}
                                  />
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>
                    )}

                    {/* Shipping Form (Pre-populated) */}
                    {form.type === 'Shipping' && !ownHardware && (
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Field id={`recipient-${application.applicationId}`} label="Recipient Name" required value={form.recipientName} onChange={(event) => setShipment(application.applicationId, 'recipientName', event.target.value)} />
                        <Field id={`company-${application.applicationId}`} label="Company Name" value={form.companyName} onChange={(event) => setShipment(application.applicationId, 'companyName', event.target.value)} />
                        <Field id={`recipient-phone-${application.applicationId}`} label="Phone Number" required value={form.recipientPhone} onChange={(event) => setShipment(application.applicationId, 'recipientPhone', phone(event.target.value))} />
                        <Field id={`shipping-email-${application.applicationId}`} label="Email Address" required type="email" value={form.email} onChange={(event) => setShipment(application.applicationId, 'email', event.target.value)} />
                        <Field id={`shipping-address-${application.applicationId}`} label="Shipping Address" required value={form.address} onChange={(event) => setShipment(application.applicationId, 'address', event.target.value)} />
                        <Field id={`shipping-floor-${application.applicationId}`} label="Floor / Suite / Street 2" value={form.floorStreet} onChange={(event) => setShipment(application.applicationId, 'floorStreet', event.target.value)} />
                        <Field id={`shipping-city-${application.applicationId}`} label="City" required value={form.city} onChange={(event) => setShipment(application.applicationId, 'city', event.target.value)} />
                        <SelectField id={`shipping-state-${application.applicationId}`} label="State" required value={form.state} onChange={(event) => setShipment(application.applicationId, 'state', event.target.value)} options={states} />
                        <Field id={`shipping-zip-${application.applicationId}`} label="ZIP Code" required value={form.zipCode} onChange={(event) => setShipment(application.applicationId, 'zipCode', digits(event.target.value, 5))} placeholder="78701" maxLength={5} />
                      </div>
                    )}

                    {/* Pickup Form */}
                    {form.type === 'Pickup' && !ownHardware && (
                      <div className="mt-6 grid gap-5 sm:grid-cols-2">
                        <Field id={`pickup-loc-${application.applicationId}`} label="Pickup Location Name" required value={form.pickupLocationName} onChange={(event) => setShipment(application.applicationId, 'pickupLocationName', event.target.value)} />
                        <Field id={`pickup-contact-${application.applicationId}`} label="Contact Name" required value={form.contactName} onChange={(event) => setShipment(application.applicationId, 'contactName', event.target.value)} />
                        <Field id={`pickup-date-${application.applicationId}`} label="Pickup Date" required type="date" value={form.pickupDate} onChange={(event) => setShipment(application.applicationId, 'pickupDate', event.target.value)} />
                        <Field id={`pickup-notes-${application.applicationId}`} label="Special Instructions" value={form.specialInstructions} onChange={(event) => setShipment(application.applicationId, 'specialInstructions', event.target.value)} />
                      </div>
                    )}

                    {/* Payment Form (if equipment needed) */}
                    {form.type !== 'MerchantOwned' && !ownHardware && (() => {
                      const hasInStock = appHasInStockItems(application.applicationId)
                      const availablePaymentTypes = hasInStock
                        ? ['Pay Now', 'Lease', 'Pay Later']
                        : ['Lease', 'Pay Later']
                      const activePaymentType = !hasInStock && form.paymentType === 'Pay Now'
                        ? 'Pay Later'
                        : form.paymentType

                      return (
                        <div className="mt-8 border-t border-slate-200 pt-7">
                          <h4 className="font-extrabold text-navy">Payment Transaction</h4>
                          <div className={`mt-4 grid gap-3 ${availablePaymentTypes.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
                            {availablePaymentTypes.map((paymentType) => (
                              <button
                                key={paymentType}
                                type="button"
                                onClick={() => setShipment(application.applicationId, 'paymentType', paymentType)}
                                className={`rounded-xl border px-4 py-3 font-bold transition ${activePaymentType === paymentType ? 'border-primary bg-mist text-primary shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                {paymentType}
                              </button>
                            ))}
                          </div>

                          {activePaymentType === 'Pay Now' && hasInStock && (
                            <div className="mt-6 space-y-5">
                              <div className="rounded-xl border border-primary/20 bg-mist p-4">
                                <p className="text-sm font-bold text-navy">
                                  Amount to pay now: <span className="text-primary">${inStockAmount.toFixed(2)}</span> (in-stock items only)
                                </p>
                              </div>
                              <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                  <Field id={`nameOnCard-${application.applicationId}`} label="Name on Card" required value={form.nameOnCard} onChange={(event) => setShipment(application.applicationId, 'nameOnCard', event.target.value)} />
                                  <Field id={`cardNumber-${application.applicationId}`} label="Card Number" required value={form.cardNumber} onChange={(event) => setShipment(application.applicationId, 'cardNumber', formatCardNumber(event.target.value))} placeholder="XXXX XXXX XXXX XXXX" maxLength={19} />
                                </div>
                                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                  <Field
                                    id={`expiryDate-${application.applicationId}`}
                                    label="Expiration (MM/YY)"
                                    required
                                    value={form.expiryDate}
                                    onChange={(event) => setShipment(application.applicationId, 'expiryDate', formatExpiryInput(event.target.value))}
                                    placeholder="MM/YY"
                                    maxLength={5}
                                  />
                                  <Field id={`cvv-${application.applicationId}`} label="Card Code (CVV)" required type="password" value={form.cvv} onChange={(event) => setShipment(application.applicationId, 'cvv', digits(event.target.value, 4))} maxLength={4} />
                                </div>
                                <Field id={`cardBillingAddress-${application.applicationId}`} label="Billing Address" required value={form.billingAddress} onChange={(event) => setShipment(application.applicationId, 'billingAddress', event.target.value)} />
                              </div>
                            </div>
                          )}

                          {activePaymentType === 'Lease' && (
                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                              <Field id={`leaseTerm-${application.applicationId}`} label="Lease Term (Months)" required value={form.leaseTerm} onChange={(event) => setShipment(application.applicationId, 'leaseTerm', event.target.value)} />
                              <Field id={`monthlyPayment-${application.applicationId}`} label="Monthly Payment ($)" required type="number" min="0" step="0.01" value={form.monthlyPayment} onChange={(event) => setShipment(application.applicationId, 'monthlyPayment', event.target.value)} />
                              <Field id={`startDate-${application.applicationId}`} label="Start Date" required type="date" value={form.startDate} onChange={(event) => setShipment(application.applicationId, 'startDate', event.target.value)} />
                              <Field id={`leaseBillingAddress-${application.applicationId}`} label="Billing Address" required value={form.billingAddress} onChange={(event) => setShipment(application.applicationId, 'billingAddress', event.target.value)} />
                            </div>
                          )}

                          {activePaymentType === 'Pay Later' && (
                            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <p className="text-sm font-semibold text-slate-600">
                                Payment will be collected later. Complete this step now; you can pay when your invoice is due.
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </section>
                )
              })}
            </div>
          </>
        )}

        {/* Step 8: Submit & Agreements */}
        {step === 8 && (
          <>
            <StepTitle title="Review agreements and submit" description="Review the generated agreements, sign electronically, and authorize your application." />

            {loadingAgreements ? (
              <div className="my-16 text-center">
                <LoaderCircle className="mx-auto animate-spin text-primary" size={36} />
                <p className="mt-3 text-sm font-bold text-slate-600">Generating agreement documents...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {applications.map((application) => {
                  const appId = application.applicationId
                  const docs = agreements[appId] || []
                  const hasDocs = docs.length > 0
                  const isSigned = Boolean(signedByApp[appId])
                  const isChecked = Boolean(checkedByApp[appId])
                  const agreementNames = docs.map((d) => d.title).filter(Boolean).join(', ')

                  return (
                    <section key={appId} className="rounded-2xl border border-slate-200 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-extrabold text-navy">{getServiceLabel(application.solution)}</h3>
                        {hasDocs && (
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isSigned ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {isSigned ? <><Check size={14} /> Signed</> : 'Signature Required'}
                          </span>
                        )}
                      </div>

                      {hasDocs ? (
                        <>
                          <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-mist p-4">
                            <Info size={20} className="shrink-0 text-primary" />
                            <p className="text-sm font-medium leading-6 text-slate-700">
                              {docs.length > 1
                                ? `Please review the following agreements generated for your application: ${agreementNames}. Click Review & Sign below to sign your agreements directly in your browser before final submission.`
                                : `Please review the agreement generated for your application. Click Review & Sign below to sign your agreement directly in your browser before final submission.`}
                            </p>
                          </div>

                          {/* Action Bar for Documents */}
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex items-center gap-2">
                              <FileText size={18} className="text-slate-500" />
                              <span className="text-sm font-bold text-navy">
                                {docs.length} Agreement Document{docs.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {!isSigned && (
                                <Button type="button" size="sm" onClick={() => handleOpenPdfModal(appId)}>
                                  <PencilLine size={15} /> Review & Sign
                                </Button>
                              )}
                              {isSigned && (
                                <>
                                  <Button type="button" size="sm" variant="outline" onClick={() => handleOpenPdfModal(appId)}>
                                    <Eye size={15} /> View Signed PDF
                                  </Button>
                                  {summaryUrlByApp[appId] && (
                                    <Button type="button" size="sm" variant="outline" onClick={() => downloadAgreementSummary(appId)}>
                                      <Download size={15} /> Download Summary
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                          <p className="font-semibold text-navy">Terms and Conditions</p>
                          <p className="mt-2">
                            By submitting this application, you agree to provide accurate and complete information. We reserve the right to verify all information provided and may request additional documentation.
                          </p>
                        </div>
                      )}

                      {/* Acceptance Checkbox */}
                      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setCheckedByApp((prev) => ({ ...prev, [appId]: checked }))
                            if (checked) {
                              setErrors((prev) => ({ ...prev, accepted: '' }))
                              setError('')
                            }
                          }}
                          className="mt-0.5 h-5 w-5 accent-primary"
                        />
                        <span>I have read and agree to all terms and conditions for {getServiceLabel(application.solution)}.</span>
                      </label>
                      {!isChecked && errors.accepted && (
                        <p className="mt-2 text-xs font-bold text-rose-600">Please check the box to agree to terms.</p>
                      )}
                    </section>
                  )
                })}

                {/* Official Google reCAPTCHA Security Verification */}
                <GoogleRecaptcha
                  onVerify={() => {
                    setIsRobotVerified(true)
                    setErrors((prev) => ({ ...prev, recaptcha: '' }))
                    setError('')
                  }}
                  onExpire={() => {
                    setIsRobotVerified(false)
                  }}
                  error={errors.recaptcha}
                />
              </div>
            )}
            {errors.accepted && (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
                {errors.accepted}
              </p>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={back} disabled={loading} className="w-full sm:w-auto">
              <ArrowLeft size={18} /> Back
            </Button>
          ) : <span />}

          <Button
            type="button"
            onClick={next}
            disabled={loading || loadingData || loadingAgreements}
            aria-busy={loading}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <><LoaderCircle className="animate-spin" size={18} /> Saving...</>
            ) : step === 8 ? (
              <>Submit Application <CheckCircle2 size={18} /></>
            ) : (
              <>Save and Continue <ArrowRight size={18} /></>
            )}
          </Button>
        </div>
      </div>

      {/* PDF Document Review Modal */}
      <PdfReviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        documents={activeDocs}
        activeDocIndex={activeDocIndex}
        onSelectDocIndex={(idx) => {
          setViewingSummary(false)
          setActiveDocIndex(idx)
        }}
        viewingSummary={viewingSummary}
        summaryUrl={activeAppId ? summaryUrlByApp[activeAppId] : null}
        onToggleSummary={() => setViewingSummary(!viewingSummary)}
        onDownloadSummary={() => activeAppId && downloadAgreementSummary(activeAppId)}
        onOpenSignModal={() => {
          setIsPdfModalOpen(false)
          setShowSignatureModal(true)
        }}
        onSubmitFinal={() => {
          setIsPdfModalOpen(false)
          submitFinalApplications()
        }}
        isAllSigned={activeIsAllSigned}
      />

      {/* Signature Canvas / Typed Signature Modal */}
      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => {
          setShowSignatureModal(false)
          setIsPdfModalOpen(true)
        }}
        onSubmit={handleSignatureSubmit}
        isSigning={isSigningDoc}
      />
    </div>
  )
}
