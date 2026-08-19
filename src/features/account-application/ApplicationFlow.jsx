import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  Globe2,
  Landmark,
  LoaderCircle,
  MonitorSmartphone,
  PackageCheck,
  PenLine,
  ShoppingBasket,
  ShoppingCart,
  UserRound,
  WalletCards,
  Wind,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../../components/ui/Button'
import FormField, { formControlClasses } from '../../components/ui/FormField'
import { applicationRequest, saveApplication, unwrapData, uploadApplicationFile } from './api'

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

const states = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC']
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
const supportedSolutions = new Set(Object.keys(solutionIcons))
const preferenceForms = { atm: 'atm1', 'credit-card': 'credit-card1', 'cash-advance': 'cash-advance1', pos: 'pos1', ebt: 'ebt1', airvac: 'airvac1', website: 'website1', 'ach-processing': 'ach-processing1' }

const initialValues = {
  legalName: '', legalAddress: '', legalZipCode: '', legalCity: '', legalState: '', contactNumber: '', ebtFnsNumber: '',
  sameAsLegal: true, businessName: '', dbaAddress: '', businessZipCode: '', businessCity: '', businessState: '', dbaPhoneNumber: '',
  taxType: '', feinNumber: '', ownerShipType: '', businessStartDate: '', businessType: '', email: '', website: '', productsDescription: '',
  ownerFirstName: '', ownerLastName: '', date: '', ownerSameAsLegal: true, residentialAddress: '', ownerShipZip: '', ownerShipCity: '', ownerShipState: '', ownerPhoneNumber: '', ownerEmail: '', socialSecurityNumber: '', dLFiles: [],
  bankName: '', accountNumber: '', routingNumber: '', bankFiles: [], taxCode: '', averageSale: '', maxSale: '', monthlySale: '', comment: '',
}

function digits(value, max) {
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

function Field({ id, label, required, error, children, ...props }) {
  return (
    <FormField id={id} label={label} required={required} error={error}>
      {children || <input id={id} className={`${formControlClasses} ${error ? 'border-rose-500' : ''}`} {...props} />}
    </FormField>
  )
}

function SelectField({ id, label, required, error, value, onChange, options, placeholder = 'Select an option' }) {
  return (
    <FormField id={id} label={label} required={required} error={error}>
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
  return <div className="mb-7"><h2 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h2><p className="mt-2 leading-7 text-slate-600">{description}</p></div>
}

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const width = canvas.clientWidth
      canvas.width = width * ratio
      canvas.height = 180 * ratio
      const context = canvas.getContext('2d')
      context.scale(ratio, ratio)
      context.lineWidth = 2
      context.lineCap = 'round'
      context.strokeStyle = '#1e293b'
    }
    resize()
  }, [])

  const point = (event) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return [event.clientX - rect.left, event.clientY - rect.top]
  }
  const start = (event) => {
    drawing.current = true
    const context = canvasRef.current.getContext('2d')
    const [x, y] = point(event)
    context.beginPath()
    context.moveTo(x, y)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const move = (event) => {
    if (!drawing.current) return
    const [x, y] = point(event)
    const context = canvasRef.current.getContext('2d')
    context.lineTo(x, y)
    context.stroke()
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    onChange(canvasRef.current.toDataURL('image/png'))
  }
  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return <div><canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className="h-[180px] w-full touch-none rounded-xl border border-slate-300 bg-white" aria-label="Draw your signature" /><button type="button" onClick={clear} className="mt-2 text-sm font-bold text-primary">Clear signature</button></div>
}

function dataUrlFile(value) {
  const [header, encoded] = value.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const bytes = atob(encoded)
  const array = new Uint8Array(bytes.length)
  for (let index = 0; index < bytes.length; index += 1) array[index] = bytes.charCodeAt(index)
  return new File([array], 'signature.png', { type: mime })
}

function validate(step, values, selectedSolutions, plans, products, shipments, accepted, signature, signatureMethod) {
  const errors = {}
  const required = (key, message) => { if (!String(values[key] ?? '').trim()) errors[key] = message }
  if (step === 0 && selectedSolutions.length === 0) errors.solutions = 'Select at least one service.'
  if (step === 1) {
    ['legalName', 'legalAddress', 'legalZipCode', 'legalCity', 'legalState', 'contactNumber', 'taxType', 'feinNumber', 'ownerShipType', 'businessType', 'email', 'productsDescription'].forEach((key) => required(key, 'This field is required.'))
    if (digits(values.contactNumber, 20).length < 10) errors.contactNumber = 'Enter a valid 10-digit phone number.'
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address.'
    if (values.productsDescription && !/\p{L}/u.test(values.productsDescription)) errors.productsDescription = 'Describe what your business sells using words, not only a number.'
    if (selectedSolutions.includes('ebt')) required('ebtFnsNumber', 'FNS number is required for EBT processing.')
    if (!values.sameAsLegal) ['businessName', 'dbaAddress', 'businessZipCode', 'businessCity', 'businessState', 'dbaPhoneNumber'].forEach((key) => required(key, 'This field is required.'))
  }
  if (step === 2) {
    ['ownerFirstName', 'ownerLastName', 'date', 'residentialAddress', 'ownerShipZip', 'ownerShipCity', 'ownerShipState', 'ownerPhoneNumber', 'ownerEmail', 'socialSecurityNumber'].forEach((key) => required(key, 'This field is required.'))
    if (digits(values.ownerPhoneNumber, 20).length < 10) errors.ownerPhoneNumber = 'Enter a valid 10-digit phone number.'
    if (digits(values.socialSecurityNumber, 20).length !== 9) errors.socialSecurityNumber = 'Enter a valid 9-digit Social Security number.'
    if (!values.dLFiles.length) errors.dLFiles = 'Upload a driver license or government-issued ID.'
  }
  if (step === 3) {
    ['accountNumber', 'routingNumber'].forEach((key) => required(key, 'This field is required.'))
    if (!values.bankFiles.length) errors.bankFiles = 'Upload a void check or bank letter.'
    if (selectedSolutions.some((solution) => saleSolutions.has(solution))) ['averageSale', 'maxSale', 'monthlySale'].forEach((key) => required(key, 'This field is required.'))
  }
  if (step === 4 && Object.keys(plans).length < selectedSolutions.length) errors.plan = 'Select one plan for each service.'
  if (step === 5 && Object.values(products).some((selection) => !selection.own && !Object.values(selection.items || {}).some((quantity) => quantity > 0))) errors.products = 'Select hardware or indicate that you already own hardware for each service.'
  if (step === 7) Object.entries(shipments).forEach(([id, form]) => {
    if (form.type === 'Shipping' && (!form.recipientName || !form.recipientPhone || !form.email || !form.address || !form.zipCode || !form.country || !form.state)) errors[`shipment-${id}`] = 'Complete all required shipping fields.'
    if (form.type === 'Pickup' && (!form.pickupLocationName || !form.contactName || !form.pickupDate)) errors[`shipment-${id}`] = 'Complete all required pickup fields.'
    if (form.type !== 'MerchantOwned' && form.paymentType === 'Pay Now' && (!form.nameOnCard || digits(form.cardNumber, 30).length < 13 || !form.expiryDate || !form.cvv || !form.billingAddress)) errors[`payment-${id}`] = 'Complete all required card details.'
    if (form.type !== 'MerchantOwned' && form.paymentType === 'Lease' && (!form.leaseTerm || !form.monthlyPayment || !form.startDate || !form.billingAddress)) errors[`payment-${id}`] = 'Complete all required lease details.'
  })
  if (step === 8) {
    if (!accepted) errors.accepted = 'Accept the terms and conditions to submit.'
    if (signatureMethod === 'electronic' && !signature) errors.signature = 'Draw your signature to continue.'
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
  const [accepted, setAccepted] = useState(false)
  const [signatureMethod, setSignatureMethod] = useState('electronic')
  const [signature, setSignature] = useState('')
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const topRef = useRef(null)

  const applicationIds = applications.map((item) => item.applicationId)
  const change = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  useEffect(() => {
    const controller = new AbortController()
    applicationRequest('item-category/', { signal: controller.signal })
      .then((result) => {
        setCatalog((current) => ({ ...current, services: (unwrapData(result) || []).filter((service) => supportedSolutions.has(service.solution)) }))
        setError('')
      })
      .catch((nextError) => { if (nextError.name !== 'AbortError') setError(nextError.message) })
      .finally(() => { if (!controller.signal.aborted) setLoadingData(false) })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (step !== 4 || catalog.plans.length) return
    applicationRequest('price-plan').then((result) => setCatalog((current) => ({ ...current, plans: unwrapData(result) || [] }))).catch((nextError) => setError(nextError.message))
  }, [step, catalog.plans.length])

  useEffect(() => {
    if (step !== 5 || catalog.products.length) return
    applicationRequest('item-services').then((result) => setCatalog((current) => ({ ...current, products: unwrapData(result) || [] }))).catch((nextError) => setError(nextError.message))
  }, [step, catalog.products.length])

  useEffect(() => {
    if ((step !== 6 && step !== 7) || catalog.preferences.length) return
    applicationRequest('application-preferences').then((result) => setCatalog((current) => ({ ...current, preferences: unwrapData(result) || [] }))).catch((nextError) => setError(nextError.message))
  }, [step, catalog.preferences.length])

  useEffect(() => {
    if (step !== 8 || !applications.length) return
    Promise.all(applications.map(async (application) => {
      const ownsHardware = products[application.applicationId]?.own
      const categoryQuery = ownsHardware && application.categoryId ? `?categoryIds=${application.categoryId}` : ''
      const result = await applicationRequest(`application/${application.applicationId}/agreement-documents${categoryQuery}`)
      return [application.applicationId, unwrapData(result)?.agreementFileUrls || []]
    })).then((entries) => setAgreements(Object.fromEntries(entries))).catch((nextError) => setError(nextError.message))
  }, [step, applications, products])

  useEffect(() => {
    if (!applications.length || Object.keys(shipments).length) return
    const forms = {}
    const selections = {}
    applications.forEach((application) => {
      forms[application.applicationId] = { type: 'Shipping', paymentType: 'Pay Now', recipientName: '', companyName: '', recipientPhone: '', email: values.email, address: values.dbaAddress || values.legalAddress, floorStreet: '', zipCode: values.businessZipCode || values.legalZipCode, country: 'United States', state: values.businessState || values.legalState, pickupLocationName: '', contactName: '', pickupDate: '', specialInstructions: '', nameOnCard: '', cardNumber: '', expiryDate: '', cvv: '', billingAddress: '', leaseTerm: '', monthlyPayment: '', startDate: '' }
      selections[application.applicationId] = { own: false, items: {} }
    })
    setShipments(forms)
    setProducts(selections)
  }, [applications, shipments, values])

  const uploadFiles = async (files, type) => Promise.all(files.map(async (file) => {
    const result = unwrapData(await uploadApplicationFile(file, type))
    return result?.dLFileUrl || result?.bankLetterFileUrl || result?.fileUrl || result
  }))

  const saveCurrentStep = async () => {
    if (step === 0) {
      const result = unwrapData(await saveApplication({ currentStep: 1, solutions, applicationId: null }))
      const raw = result?.applications || []
      const fallback = result?.applicationId || result?.id
      const normalized = (raw.length ? raw : solutions.map((solution) => ({ solution, applicationId: fallback }))).map((item, index) => ({ ...item, solution: item.solution || solutions[index], applicationId: item.applicationId || item.id || fallback, categoryId: catalog.services.find((service) => service.solution === (item.solution || solutions[index]))?.id })).filter((item) => item.applicationId)
      if (!normalized.length) throw new Error('The application service did not return an application ID.')
      setApplications(normalized)
      return
    }
    if (step === 1) {
      await saveApplication({ currentStep: 2, legalName: values.legalName, legalAddress: values.legalAddress, legalZipCode: values.legalZipCode, legalCity: values.legalCity, legalState: values.legalState, contactNumber: values.contactNumber, ebtFnsNumber: values.ebtFnsNumber || undefined, businessName: values.sameAsLegal ? values.legalName : values.businessName, dbaAddress: values.sameAsLegal ? values.legalAddress : values.dbaAddress, businessZipCode: values.sameAsLegal ? values.legalZipCode : values.businessZipCode, businessCity: values.sameAsLegal ? values.legalCity : values.businessCity, businessState: values.sameAsLegal ? values.legalState : values.businessState, dbaPhoneNumber: values.sameAsLegal ? values.contactNumber : values.dbaPhoneNumber, taxType: values.taxType, feinNumber: values.feinNumber, ownerShipType: values.ownerShipType, businessStartDate: values.businessStartDate ? apiDate(values.businessStartDate) : undefined, businessType: values.businessType, email: values.email, website: values.website || undefined, productsDescription: values.productsDescription, source: 'website', applicationIds })
      return
    }
    if (step === 2) {
      const dLFileUrl = await uploadFiles(values.dLFiles, 'applications')
      await saveApplication({ currentStep: 3, merchantFirstName: values.ownerFirstName, merchantLastName: values.ownerLastName, ownerFirstName: values.ownerFirstName, ownerLastName: values.ownerLastName, date: apiDate(values.date), residentialAddress: values.residentialAddress, ownerShipState: values.ownerShipState, ownerShipCity: values.ownerShipCity, ownerShipZip: values.ownerShipZip, socialSecurityNumber: values.socialSecurityNumber, ownerEmail: values.ownerEmail, ownerPhoneNumber: values.ownerPhoneNumber, dLFileUrl, applicationIds })
      return
    }
    if (step === 3) {
      const bankLetterFileUrl = await uploadFiles(values.bankFiles, 'application-bank-letter')
      await saveApplication({ currentStep: 4, bankName: values.bankName, accountNumber: values.accountNumber, routingNumber: values.routingNumber, taxCode: values.taxCode || undefined, averageSale: values.averageSale || undefined, maxSale: values.maxSale || undefined, monthlySale: values.monthlySale || undefined, comment: values.comment || undefined, bankLetterFileUrl, applicationIds })
      return
    }
    if (step === 4) {
      await Promise.all(applications.map((application) => saveApplication({ currentStep: 5, plan: plans[application.applicationId], applicationId: application.applicationId })))
      return
    }
    if (step === 5) {
      await Promise.all(applications.map((application) => {
        const selection = products[application.applicationId]
        const hardware = Object.entries(selection.items || {}).filter(([, quantity]) => quantity > 0).map(([itemServiceId, quantity]) => {
          const item = catalog.products.find((product) => String(product.id) === String(itemServiceId)) || {}
          return { applicationId: application.applicationId, itemServiceId: item.id, pictureUrl: item.fileUrl || item.pictureUrl, name: item.name, price: item.sellingPrice ?? item.price, quantity, inStock: item.inStock }
        })
        return saveApplication({ currentStep: 6, hardware, hasOwnHardware: selection.own, applicationId: application.applicationId })
      }))
      return
    }
    if (step === 6) {
      await Promise.all(applications.map((application) => saveApplication({ currentStep: 7, preferences: preferences[application.applicationId] || {}, applicationId: application.applicationId })))
      return
    }
    if (step === 7) {
      await Promise.all(applications.map((application) => {
        const form = shipments[application.applicationId]
        const shipment = { applicationId: application.applicationId, type: form.type }
        if (form.type === 'Shipping') shipment.shippingDetails = { recipientName: form.recipientName, phoneNumber: form.recipientPhone, email: form.email, address: form.address, floorStreet: form.floorStreet || undefined, zipCode: form.zipCode, country: form.country, state: form.state, companyName: form.companyName || undefined }
        if (form.type === 'Pickup') { shipment.pickupDetails = { pickupLocationName: form.pickupLocationName, contactName: form.contactName, pickupDate: form.pickupDate }; shipment.specialInstructions = form.specialInstructions || undefined }
        const payload = { currentStep: 8, paymentMethod: form.type === 'MerchantOwned' ? 'merchantowned' : form.paymentType === 'Lease' ? 'lease' : form.paymentType === 'Pay Later' ? 'pay-later' : 'card', shipment, applicationId: application.applicationId }
        if (form.paymentType === 'Pay Now' && form.type !== 'MerchantOwned') {
          shipment.cardDetails = { nameOnCard: form.nameOnCard, expiryDate: form.expiryDate.replace(/\D/g, ''), cardNumber: digits(form.cardNumber, 30), cvv: form.cvv, billingAddress: form.billingAddress }
          payload.authorizeNetPayment = { card: { cardNumber: digits(form.cardNumber, 30), expirationDate: form.expiryDate.replace(/\D/g, ''), cardCode: form.cvv }, amount: Object.entries(products[application.applicationId]?.items || {}).reduce((total, [id, quantity]) => total + Number(catalog.products.find((item) => String(item.id) === id)?.sellingPrice || catalog.products.find((item) => String(item.id) === id)?.price || 0) * quantity, 0) }
        }
        if (form.paymentType === 'Pay Later') payload.payLater = true
        if (form.paymentType === 'Lease') shipment.leaseDetails = { leaseTerm: form.leaseTerm, monthlyPayment: form.monthlyPayment, startDate: form.startDate, billingAddress: form.billingAddress }
        return saveApplication(payload)
      }))
    }
  }

  const next = async () => {
    const nextErrors = validate(step, values, solutions, plans, products, shipments, accepted, signature, signatureMethod)
    setErrors(nextErrors)
    setError('')
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"], [data-error="true"]')?.focus())
      return
    }
    setLoading(true)
    try {
      if (step === 8) {
        let uploadedSignature
        if (signatureMethod === 'electronic') {
          const result = unwrapData(await uploadApplicationFile(dataUrlFile(signature), 'application-merchant-signature'))
          uploadedSignature = result?.merchantSignatureFileUrl || result?.fileUrl || result?.uploadedFiles || result
          await Promise.all(applications.flatMap((application) => (agreements[application.applicationId] || []).filter((document) => document.status !== 'signed').map((document) => applicationRequest(`application/${application.applicationId}/agreement-documents/${document.agreementId}/sign`, { method: 'PUT', body: { signatureFileUrl: uploadedSignature } }))))
        } else {
          await Promise.all(applications.flatMap((application) => (agreements[application.applicationId] || []).filter((document) => document.status !== 'signed').map((document) => applicationRequest(`application/${application.applicationId}/send-agreement-email`, { method: 'POST', body: { to: values.email || values.ownerEmail, unsignedFileUrl: document.unsignedFileUrl } }))))
        }
        await Promise.all(applications.map((application) => saveApplication({ currentStep: 9, agreedTermsAndConditon: true, merchantSignatureFileUrl: uploadedSignature, status: 'pending', applicationId: application.applicationId })))
        onComplete(applications)
      } else {
        await saveCurrentStep()
        if (step === 1 && values.ownerSameAsLegal) {
          setValues((current) => ({ ...current, residentialAddress: current.legalAddress, ownerShipZip: current.legalZipCode, ownerShipCity: current.legalCity, ownerShipState: current.legalState, ownerPhoneNumber: current.contactNumber, ownerEmail: current.email }))
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

  const back = () => { setErrors({}); setError(''); setStep((current) => Math.max(0, current - 1)); requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: 'smooth' })) }
  const setShipment = (id, key, value) => setShipments((current) => ({ ...current, [id]: { ...current[id], [key]: value } }))

  const businessFields = (prefix = '') => <div className="grid gap-5 sm:grid-cols-2">
    <Field id={`${prefix}address`} label="Address" required value={values[`${prefix}Address`]} onChange={(event) => change(`${prefix}Address`, event.target.value)} error={errors[`${prefix}Address`]} />
    <Field id={`${prefix}zip`} label="ZIP Code" required value={values[`${prefix}ZipCode`]} onChange={(event) => change(`${prefix}ZipCode`, event.target.value)} error={errors[`${prefix}ZipCode`]} />
    <Field id={`${prefix}city`} label="City" required value={values[`${prefix}City`]} onChange={(event) => change(`${prefix}City`, event.target.value)} error={errors[`${prefix}City`]} />
    <SelectField id={`${prefix}state`} label="State" required value={values[`${prefix}State`]} onChange={(event) => change(`${prefix}State`, event.target.value)} options={states} error={errors[`${prefix}State`]} />
  </div>

  return (
    <div ref={topRef} className="min-w-0 max-w-full scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 p-4 sm:p-8"><Progress current={step} /></div>
      <div className="min-w-0 p-4 sm:p-8 lg:p-10">
        {error && <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}
        {step === 0 && <><StepTitle title="Select your services" description="Choose every service your business needs. A separate linked application will be created for each selection." />{errors.solutions && <p tabIndex="-1" data-error="true" className="mb-4 text-sm font-bold text-rose-600">{errors.solutions}</p>}{loadingData ? <LoaderCircle className="mx-auto my-16 animate-spin text-primary" size={36} /> : <div className="grid gap-4 sm:grid-cols-2">{catalog.services.map((service) => { const selected = solutions.includes(service.solution); const ServiceIcon = solutionIcons[service.solution] || WalletCards; return <button type="button" key={service.id} onClick={() => setSolutions((current) => selected ? current.filter((item) => item !== service.solution) : [...current, service.solution])} className={`group flex items-center gap-4 rounded-2xl border p-5 text-left transition ${selected ? 'border-primary bg-mist shadow-md' : 'border-slate-200 hover:border-primary/50 hover:shadow-sm'}`}><span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition ${selected ? 'bg-primary text-white' : 'bg-mist text-primary group-hover:bg-primary group-hover:text-white'}`}><ServiceIcon size={27} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><strong className="block text-navy">{service.title}</strong><span className="mt-1 block text-sm capitalize text-slate-500">{String(service.solution).replaceAll('-', ' ')}</span></span><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-slate-300'}`}>{selected && <Check size={16} />}</span></button>})}</div>}</>}

        {step === 1 && <><StepTitle title="Business information" description="Tell us about the legal entity and the business location where you operate." /><h3 className="mb-4 text-lg font-extrabold text-navy">Legal information</h3><div className="grid gap-5 sm:grid-cols-2"><Field id="legalName" label="Legal Business Name" required value={values.legalName} onChange={(event) => change('legalName', event.target.value)} error={errors.legalName} /><Field id="contactNumber" label="Legal Phone Number" required value={values.contactNumber} onChange={(event) => change('contactNumber', phone(event.target.value))} error={errors.contactNumber} /></div><div className="mt-5">{businessFields('legal')}</div>{solutions.includes('ebt') && <div className="mt-5"><Field id="ebtFnsNumber" label="EBT FNS Number" required value={values.ebtFnsNumber} onChange={(event) => change('ebtFnsNumber', event.target.value)} error={errors.ebtFnsNumber} /></div>}<label className="mt-6 flex items-center gap-3 font-semibold text-slate-700"><input type="checkbox" checked={values.sameAsLegal} onChange={(event) => change('sameAsLegal', event.target.checked)} className="h-5 w-5 accent-primary" />Business information is the same as legal information</label>{!values.sameAsLegal && <div className="mt-7 border-t border-slate-200 pt-7"><h3 className="mb-4 text-lg font-extrabold text-navy">DBA information</h3><div className="grid gap-5 sm:grid-cols-2"><Field id="businessName" label="Business Name (DBA)" required value={values.businessName} onChange={(event) => change('businessName', event.target.value)} error={errors.businessName} /><Field id="dbaPhoneNumber" label="DBA Phone Number" required value={values.dbaPhoneNumber} onChange={(event) => change('dbaPhoneNumber', phone(event.target.value))} error={errors.dbaPhoneNumber} /></div><div className="mt-5">{businessFields('dba')}</div></div>}<div className="mt-7 grid gap-5 border-t border-slate-200 pt-7 sm:grid-cols-2"><SelectField id="taxType" label="Type of Tax ID" required value={values.taxType} onChange={(event) => change('taxType', event.target.value)} options={['SSN', 'EIN', 'ITIN']} error={errors.taxType} /><Field id="feinNumber" label="Tax ID" required value={values.feinNumber} onChange={(event) => change('feinNumber', event.target.value)} error={errors.feinNumber} /><SelectField id="ownerShipType" label="Ownership Type" required value={values.ownerShipType} onChange={(event) => change('ownerShipType', event.target.value)} options={['Corporation', 'LLC', 'Sole Proprietorship', 'Others']} error={errors.ownerShipType} /><Field id="businessStartDate" label="Business Start Date" type="date" value={values.businessStartDate} onChange={(event) => change('businessStartDate', event.target.value)} /><SelectField id="businessType" label="Business Type" required value={values.businessType} onChange={(event) => change('businessType', event.target.value)} options={['Retail', 'Restaurant', 'E-Commerce/Online', 'Service']} error={errors.businessType} /><Field id="email" label="DBA Email" required type="email" value={values.email} onChange={(event) => change('email', event.target.value)} error={errors.email} /><Field id="website" label="Website" type="url" value={values.website} onChange={(event) => change('website', event.target.value)} /><Field id="productsDescription" label="Description of Products or Services Sold" required placeholder="e.g. Clothing, restaurant meals, or consulting services" value={values.productsDescription} onChange={(event) => change('productsDescription', event.target.value)} error={errors.productsDescription} /></div></>}

        {step === 2 && <><StepTitle title="Ownership information" description="Provide details for the primary owner or authorized principal." /><div className="grid gap-5 sm:grid-cols-2"><Field id="ownerFirstName" label="Owner First Name" required value={values.ownerFirstName} onChange={(event) => change('ownerFirstName', event.target.value)} error={errors.ownerFirstName} /><Field id="ownerLastName" label="Owner Last Name" required value={values.ownerLastName} onChange={(event) => change('ownerLastName', event.target.value)} error={errors.ownerLastName} /><Field id="date" label="Date of Birth" required type="date" value={values.date} onChange={(event) => change('date', event.target.value)} error={errors.date} /><Field id="socialSecurityNumber" label="Social Security Number" required type="password" inputMode="numeric" value={values.socialSecurityNumber} onChange={(event) => change('socialSecurityNumber', digits(event.target.value, 9))} error={errors.socialSecurityNumber} /></div><label className="mt-6 flex items-center gap-3 font-semibold text-slate-700"><input type="checkbox" checked={values.ownerSameAsLegal} onChange={(event) => { const checked = event.target.checked; change('ownerSameAsLegal', checked); if (checked) setValues((current) => ({ ...current, residentialAddress: current.legalAddress, ownerShipZip: current.legalZipCode, ownerShipCity: current.legalCity, ownerShipState: current.legalState, ownerPhoneNumber: current.contactNumber, ownerEmail: current.email })) }} className="h-5 w-5 accent-primary" />Owner information is the same as legal information</label><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id="residentialAddress" label="Residential Address" required value={values.residentialAddress} onChange={(event) => change('residentialAddress', event.target.value)} error={errors.residentialAddress} /><Field id="ownerShipZip" label="ZIP Code" required value={values.ownerShipZip} onChange={(event) => change('ownerShipZip', event.target.value)} error={errors.ownerShipZip} /><Field id="ownerShipCity" label="City" required value={values.ownerShipCity} onChange={(event) => change('ownerShipCity', event.target.value)} error={errors.ownerShipCity} /><SelectField id="ownerShipState" label="State" required value={values.ownerShipState} onChange={(event) => change('ownerShipState', event.target.value)} options={states} error={errors.ownerShipState} /><Field id="ownerPhoneNumber" label="Phone Number" required value={values.ownerPhoneNumber} onChange={(event) => change('ownerPhoneNumber', phone(event.target.value))} error={errors.ownerPhoneNumber} /><Field id="ownerEmail" label="Owner Email" required type="email" value={values.ownerEmail} onChange={(event) => change('ownerEmail', event.target.value)} error={errors.ownerEmail} /><Field id="dLFiles" label="Driver License or Government ID" required error={errors.dLFiles}><input id="dLFiles" type="file" multiple onChange={(event) => change('dLFiles', [...event.target.files])} className={`${formControlClasses} file:mr-4 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:font-bold file:text-primary`} /></Field></div></>}

        {step === 3 && <><StepTitle title="Financial information" description="Enter the settlement account and expected processing figures." /><div className="grid gap-5 sm:grid-cols-2"><Field id="bankName" label="Bank Name" value={values.bankName} onChange={(event) => change('bankName', event.target.value)} /><Field id="accountNumber" label="Account Number" required type="password" value={values.accountNumber} onChange={(event) => change('accountNumber', event.target.value)} error={errors.accountNumber} /><Field id="routingNumber" label="Routing Number" required type="password" inputMode="numeric" value={values.routingNumber} onChange={(event) => change('routingNumber', digits(event.target.value, 9))} error={errors.routingNumber} /><Field id="taxCode" label="Tax Exempt Code" type="password" value={values.taxCode} onChange={(event) => change('taxCode', event.target.value)} /><Field id="bankFiles" label="Void Check or Bank Letter" required error={errors.bankFiles}><input id="bankFiles" type="file" multiple onChange={(event) => change('bankFiles', [...event.target.files])} className={`${formControlClasses} file:mr-4 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-2 file:font-bold file:text-primary`} /></Field>{solutions.some((solution) => saleSolutions.has(solution)) && <><Field id="averageSale" label="Average Sale" required type="number" min="0" step="0.01" value={values.averageSale} onChange={(event) => change('averageSale', event.target.value)} error={errors.averageSale} /><Field id="maxSale" label="Maximum Sale" required type="number" min="0" step="0.01" value={values.maxSale} onChange={(event) => change('maxSale', event.target.value)} error={errors.maxSale} /><Field id="monthlySale" label="Monthly Sale" required type="number" min="0" step="0.01" value={values.monthlySale} onChange={(event) => change('monthlySale', event.target.value)} error={errors.monthlySale} /></>}<Field id="comment" label="Comments" value={values.comment} onChange={(event) => change('comment', event.target.value)} /></div></>}

        {step === 4 && <><StepTitle title="Select a plan" description="Choose one available pricing plan for each requested service." />{errors.plan && <p tabIndex="-1" data-error="true" className="mb-4 font-bold text-rose-600">{errors.plan}</p>}<div className="space-y-8">{applications.map((application) => { const available = catalog.plans.filter((plan) => String(plan.service).toLowerCase() === application.solution.toLowerCase()); return <section key={application.applicationId}><h3 className="mb-3 text-lg font-extrabold capitalize text-navy">{application.solution.replaceAll('-', ' ')}</h3><div className="grid gap-4 sm:grid-cols-2">{available.map((plan) => <button type="button" key={plan.id} onClick={() => setPlans((current) => ({ ...current, [application.applicationId]: plan.id }))} className={`rounded-2xl border p-5 text-left ${plans[application.applicationId] === plan.id ? 'border-primary bg-mist' : 'border-slate-200 hover:border-primary/50'}`}><strong className="text-navy">{plan.name}</strong><p className="mt-2 text-sm leading-6">{plan.description}</p></button>)}{!available.length && <p className="rounded-xl bg-mist p-4 text-sm font-semibold text-primary-dark">No plans are currently available for this service.</p>}</div></section>})}</div></>}

        {step === 5 && <><StepTitle title="Hardware and equipment" description="Select the products you need, or tell us you already have compatible hardware." />{errors.products && <p tabIndex="-1" data-error="true" className="mb-4 font-bold text-rose-600">{errors.products}</p>}<div className="space-y-9">{applications.map((application) => { const selection = products[application.applicationId] || { own: false, items: {} }; const available = catalog.products.filter((product) => product.category?.solution === application.solution); return <section key={application.applicationId}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 className="text-lg font-extrabold capitalize text-navy">{application.solution.replaceAll('-', ' ')}</h3><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={selection.own} onChange={(event) => setProducts((current) => ({ ...current, [application.applicationId]: { own: event.target.checked, items: event.target.checked ? {} : selection.items } }))} className="h-5 w-5 accent-primary" />I already have hardware</label></div>{!selection.own && <div className="grid gap-4 sm:grid-cols-2">{available.map((product) => { const quantity = selection.items[product.id] || 0; return <div key={product.id} className={`rounded-2xl border p-5 ${quantity ? 'border-primary bg-mist' : 'border-slate-200'}`}><div className="flex justify-between gap-4"><div><strong className="text-navy">{product.name}</strong><p className="mt-1 font-bold text-primary">${Number(product.sellingPrice ?? product.price ?? 0).toFixed(2)}</p></div><span className="text-xs font-bold text-slate-500">{product.inStock ? 'In stock' : 'Special order'}</span></div><div className="mt-4 flex items-center gap-3"><button type="button" className="h-9 w-9 rounded-lg border bg-white font-bold" onClick={() => setProducts((current) => ({ ...current, [application.applicationId]: { ...selection, items: { ...selection.items, [product.id]: Math.max(0, quantity - 1) } } }))}>-</button><span className="min-w-6 text-center font-bold">{quantity}</span><button type="button" className="h-9 w-9 rounded-lg bg-primary font-bold text-white" onClick={() => setProducts((current) => ({ ...current, [application.applicationId]: { ...selection, items: { ...selection.items, [product.id]: quantity + 1 } } }))}>+</button></div></div>})}{!available.length && <p className="rounded-xl bg-slate-50 p-4">No hardware is listed for this service.</p>}</div>}</section>})}</div></>}

        {step === 6 && <><StepTitle title="Application preferences" description="Configure the service-specific preferences supplied by our application system." /><div className="space-y-9">{applications.map((application) => { const definitions = catalog.preferences.filter((item) => item.formName === preferenceForms[application.solution]).sort((a, b) => Number(a.order || 0) - Number(b.order || 0)); const appValues = preferences[application.applicationId] || {}; return <section key={application.applicationId}><h3 className="mb-4 text-lg font-extrabold capitalize text-navy">{application.solution.replaceAll('-', ' ')}</h3><div className="grid gap-5 sm:grid-cols-2">{definitions.map((definition) => { const setValue = (value) => setPreferences((current) => ({ ...current, [application.applicationId]: { ...appValues, [definition.name]: value } })); if (definition.preference === 'switch') return <label key={definition.name} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 font-bold text-navy"><input type="checkbox" checked={Boolean(appValues[definition.name])} onChange={(event) => setValue(event.target.checked)} className="h-5 w-5 accent-primary" />{definition.name}</label>; if (definition.preference === 'dropdown') return <SelectField key={definition.name} id={`pref-${application.applicationId}-${definition.order}`} label={definition.name} value={appValues[definition.name] || ''} onChange={(event) => setValue(event.target.value)} options={(definition.extra || []).map((item) => typeof item === 'string' ? item : { value: item.value || item.title || item.name, label: item.title || item.name || item.value })} />; return <Field key={definition.name} id={`pref-${application.applicationId}-${definition.order}`} label={definition.name} type={definition.preference === 'datePicker' ? 'date' : definition.preference === 'timePicker' ? 'time' : 'text'} value={appValues[definition.name] || ''} onChange={(event) => setValue(event.target.value)} />})}{!definitions.length && <p className="text-sm text-slate-500">No additional preferences are required.</p>}</div></section>})}</div></>}

        {step === 7 && <><StepTitle title="Delivery and payment" description="Choose how each equipment order should be fulfilled and paid." /><div className="space-y-10">{applications.map((application) => { const form = shipments[application.applicationId]; if (!form) return null; const ownHardware = products[application.applicationId]?.own; return <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5 sm:p-6"><h3 className="text-lg font-extrabold capitalize text-navy">{application.solution.replaceAll('-', ' ')}</h3>{errors[`shipment-${application.applicationId}`] && <p className="mt-3 font-bold text-rose-600">{errors[`shipment-${application.applicationId}`]}</p>}{errors[`payment-${application.applicationId}`] && <p className="mt-3 font-bold text-rose-600">{errors[`payment-${application.applicationId}`]}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-3">{(ownHardware ? ['MerchantOwned'] : ['Shipping', 'Pickup', 'MerchantOwned']).map((type) => <button key={type} type="button" onClick={() => setShipment(application.applicationId, 'type', type)} className={`rounded-xl border px-4 py-3 font-bold ${form.type === type ? 'border-primary bg-mist text-primary' : 'border-slate-200'}`}>{type === 'MerchantOwned' ? 'Merchant-Owned' : type}</button>)}</div>{form.type === 'Shipping' && <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id={`recipient-${application.applicationId}`} label="Recipient Name" required value={form.recipientName} onChange={(event) => setShipment(application.applicationId, 'recipientName', event.target.value)} /><Field id={`company-${application.applicationId}`} label="Company Name" value={form.companyName} onChange={(event) => setShipment(application.applicationId, 'companyName', event.target.value)} /><Field id={`recipient-phone-${application.applicationId}`} label="Phone Number" required value={form.recipientPhone} onChange={(event) => setShipment(application.applicationId, 'recipientPhone', phone(event.target.value))} /><Field id={`shipping-email-${application.applicationId}`} label="Email" required type="email" value={form.email} onChange={(event) => setShipment(application.applicationId, 'email', event.target.value)} /><Field id={`shipping-address-${application.applicationId}`} label="Shipping Address" required value={form.address} onChange={(event) => setShipment(application.applicationId, 'address', event.target.value)} /><Field id={`floor-${application.applicationId}`} label="Floor / Street" value={form.floorStreet} onChange={(event) => setShipment(application.applicationId, 'floorStreet', event.target.value)} /><Field id={`shipping-zip-${application.applicationId}`} label="ZIP Code" required value={form.zipCode} onChange={(event) => setShipment(application.applicationId, 'zipCode', event.target.value)} /><Field id={`country-${application.applicationId}`} label="Country" required value={form.country} onChange={(event) => setShipment(application.applicationId, 'country', event.target.value)} /><SelectField id={`shipping-state-${application.applicationId}`} label="State" required value={form.state} onChange={(event) => setShipment(application.applicationId, 'state', event.target.value)} options={states} /></div>}{form.type === 'Pickup' && <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id={`pickup-${application.applicationId}`} label="Pickup Location" required value={form.pickupLocationName} onChange={(event) => setShipment(application.applicationId, 'pickupLocationName', event.target.value)} /><Field id={`contact-${application.applicationId}`} label="Contact Name" required value={form.contactName} onChange={(event) => setShipment(application.applicationId, 'contactName', event.target.value)} /><Field id={`pickup-date-${application.applicationId}`} label="Pickup Date" required type="date" min={new Date().toISOString().slice(0, 10)} value={form.pickupDate} onChange={(event) => setShipment(application.applicationId, 'pickupDate', event.target.value)} /><Field id={`instructions-${application.applicationId}`} label="Special Instructions" value={form.specialInstructions} onChange={(event) => setShipment(application.applicationId, 'specialInstructions', event.target.value)} /></div>}{form.type !== 'MerchantOwned' && <><div className="mt-7 grid gap-3 sm:grid-cols-3">{['Pay Now', 'Lease', 'Pay Later'].map((type) => <button key={type} type="button" onClick={() => setShipment(application.applicationId, 'paymentType', type)} className={`rounded-xl border px-4 py-3 font-bold ${form.paymentType === type ? 'border-primary bg-mist text-primary' : 'border-slate-200'}`}>{type}</button>)}</div>{form.paymentType === 'Pay Now' && <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id={`card-name-${application.applicationId}`} label="Name on Card" required value={form.nameOnCard} onChange={(event) => setShipment(application.applicationId, 'nameOnCard', event.target.value)} /><Field id={`card-number-${application.applicationId}`} label="Card Number" required inputMode="numeric" value={form.cardNumber} onChange={(event) => setShipment(application.applicationId, 'cardNumber', digits(event.target.value, 19))} /><Field id={`expiry-${application.applicationId}`} label="Expiry Date (MM/YYYY)" required placeholder="MM/YYYY" value={form.expiryDate} onChange={(event) => setShipment(application.applicationId, 'expiryDate', event.target.value)} /><Field id={`cvv-${application.applicationId}`} label="CVV" required type="password" value={form.cvv} onChange={(event) => setShipment(application.applicationId, 'cvv', digits(event.target.value, 4))} /><Field id={`billing-${application.applicationId}`} label="Billing Address" required value={form.billingAddress} onChange={(event) => setShipment(application.applicationId, 'billingAddress', event.target.value)} /></div>}{form.paymentType === 'Lease' && <div className="mt-6 grid gap-5 sm:grid-cols-2"><Field id={`lease-term-${application.applicationId}`} label="Lease Term" required value={form.leaseTerm} onChange={(event) => setShipment(application.applicationId, 'leaseTerm', event.target.value)} /><Field id={`monthly-${application.applicationId}`} label="Monthly Payment" required type="number" min="0" step="0.01" value={form.monthlyPayment} onChange={(event) => setShipment(application.applicationId, 'monthlyPayment', event.target.value)} /><Field id={`start-${application.applicationId}`} label="Start Date" required type="date" value={form.startDate} onChange={(event) => setShipment(application.applicationId, 'startDate', event.target.value)} /><Field id={`lease-billing-${application.applicationId}`} label="Billing Address" required value={form.billingAddress} onChange={(event) => setShipment(application.applicationId, 'billingAddress', event.target.value)} /></div>}</>}</section>})}</div></>}

        {step === 8 && <><StepTitle title="Review agreements and submit" description="Review the generated agreements, choose a signing method, and authorize your application." /><div className="space-y-6">{applications.map((application) => <section key={application.applicationId} className="rounded-2xl border border-slate-200 p-5"><h3 className="font-extrabold capitalize text-navy">{application.solution.replaceAll('-', ' ')} agreements</h3><div className="mt-3 space-y-2">{(agreements[application.applicationId] || []).map((document) => { const url = document.signedFileUrl?.url || document.unsignedFileUrl?.url; return <a key={document.agreementId} href={url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 font-semibold text-primary hover:bg-mist"><span>{document.title || document.unsignedFileUrl?.originalname || 'Merchant agreement'}</span><span className="text-xs uppercase">{document.status || 'Review'}</span></a>})}{!(agreements[application.applicationId] || []).length && <p className="text-sm text-slate-500">Standard merchant terms and conditions apply to this application.</p>}</div></section>)}</div><fieldset className="mt-7"><legend className="font-extrabold text-navy">Signature method</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{[['electronic', 'Electronic signature'], ['email', 'Email for signature']].map(([value, label]) => <label key={value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 font-bold ${signatureMethod === value ? 'border-primary bg-mist text-primary' : 'border-slate-200'}`}><input type="radio" name="signatureMethod" value={value} checked={signatureMethod === value} onChange={() => setSignatureMethod(value)} className="accent-primary" />{label}</label>)}</div></fieldset>{signatureMethod === 'electronic' && <div className="mt-7"><h3 className="mb-3 font-extrabold text-navy">Draw your signature</h3><SignaturePad onChange={setSignature} />{errors.signature && <p className="mt-2 font-bold text-rose-600">{errors.signature}</p>}</div>}<label className={`mt-7 flex items-start gap-3 rounded-xl border p-4 font-semibold ${errors.accepted ? 'border-rose-400 bg-rose-50' : 'border-slate-200'}`}><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-primary" /><span>I have reviewed and agree to all terms and conditions, and certify that the information provided is complete and accurate.</span></label>{errors.accepted && <p className="mt-2 font-bold text-rose-600">{errors.accepted}</p>}</>}

        <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          {step > 0 ? <Button type="button" variant="outline" onClick={back} disabled={loading} className="w-full sm:w-auto"><ArrowLeft size={18} /> Back</Button> : <span />}
          <Button type="button" onClick={next} disabled={loading || loadingData} aria-busy={loading} className="w-full sm:w-auto">{loading ? <><LoaderCircle className="animate-spin" size={18} /> Saving...</> : step === 8 ? <>Submit Application <CheckCircle2 size={18} /></> : <>Save and Continue <ArrowRight size={18} /></>}</Button>
        </div>
      </div>
    </div>
  )
}
