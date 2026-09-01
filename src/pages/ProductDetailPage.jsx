import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LoaderCircle,
  Lock,
  Package,
  RotateCcw,
  ShieldCheck,
  Star,
  Truck,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Button from '../components/ui/Button'
import FormField, { formControlClasses } from '../components/ui/FormField'
import { applicationRequest, placeOrder, unwrapData } from '../features/account-application/api'
import { getAllProductImages, getProductImageUrl } from '../utils/productImages'

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
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

function digits(value, max = 30) {
  return String(value || '').replace(/\D/g, '').slice(0, max)
}

function phoneFormat(value) {
  const number = digits(value, 10)
  if (number.length < 4) return number
  if (number.length < 7) return `(${number.slice(0, 3)}) ${number.slice(3)}`
  return `(${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`
}

function formatCardNumber(value) {
  return String(value || '')
    .replace(/\D/g, '')
    .slice(0, 19)
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

function getRating(productId) {
  const seed = (Number(productId) || 1) * 9301 + 49297
  const rating = 4.7 + ((seed % 4) * 0.1)
  const reviews = 18 + (seed % 95)
  return { rating: rating.toFixed(1), reviews }
}

function CheckoutModal({ product, quantity, isOpen, onClose }) {
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'US',
    street: '',
    city: '',
    state: '',
    zip: '',
  })
  const [shipping, setShipping] = useState({
    firstName: '',
    lastName: '',
    country: 'US',
    street: '',
    city: '',
    state: '',
    zip: '',
  })
  const [shipToDifferentAddress, setShipToDifferentAddress] = useState(false)
  const [payment, setPayment] = useState({
    cardNumber: '',
    expirationDate: '',
    cardCode: '',
    cardholderName: '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  const price = Number(product?.sellingPrice ?? product?.price ?? 0)
  const subtotal = price * quantity
  const tax = 0
  const total = subtotal + tax

  if (!isOpen || !product) return null

  const handleCustomerChange = (key, value) => {
    setCustomer((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const handleShippingChange = (key, value) => {
    setShipping((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [`shipping_${key}`]: '' }))
  }

  const handlePaymentChange = (key, value) => {
    setPayment((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const validateOrder = () => {
    const nextErrors = {}
    const required = (key, val, msg) => {
      if (!String(val || '').trim()) nextErrors[key] = msg
    }

    required('firstName', customer.firstName, 'First name is required.')
    required('lastName', customer.lastName, 'Last name is required.')
    required('email', customer.email, 'Email address is required.')
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    required('phone', customer.phone, 'Phone number is required.')
    if (digits(customer.phone).length < 10) {
      nextErrors.phone = 'Enter a valid 10-digit phone number.'
    }
    required('street', customer.street, 'Street address is required.')
    required('city', customer.city, 'City is required.')
    required('state', customer.state, 'State is required.')
    required('zip', customer.zip, 'ZIP Code is required.')

    // Validate alternative shipping address if enabled
    if (shipToDifferentAddress) {
      required('shipping_firstName', shipping.firstName, 'Shipping first name is required.')
      required('shipping_lastName', shipping.lastName, 'Shipping last name is required.')
      required('shipping_street', shipping.street, 'Shipping street address is required.')
      required('shipping_city', shipping.city, 'Shipping city is required.')
      required('shipping_state', shipping.state, 'Shipping state is required.')
      required('shipping_zip', shipping.zip, 'Shipping ZIP Code is required.')
    }

    // Payment validation
    const cleanCard = digits(payment.cardNumber, 20)
    required('cardNumber', cleanCard, 'Card number is required.')
    if (cleanCard && !isValidLuhn(cleanCard)) {
      nextErrors.cardNumber = 'Enter a valid credit card number.'
    }

    required('expirationDate', payment.expirationDate, 'Expiry date is required.')
    const cleanExpiry = payment.expirationDate.replace(/\D/g, '')
    if (cleanExpiry.length !== 4) {
      nextErrors.expirationDate = 'Expiry must be in MM/YY format.'
    } else {
      const month = parseInt(cleanExpiry.slice(0, 2), 10)
      const year = 2000 + parseInt(cleanExpiry.slice(2, 4), 10)
      const now = new Date()
      if (month < 1 || month > 12) {
        nextErrors.expirationDate = 'Invalid month.'
      } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        nextErrors.expirationDate = 'Card has expired.'
      }
    }

    required('cardCode', payment.cardCode, 'CVV code is required.')
    if (payment.cardCode && (payment.cardCode.length < 3 || payment.cardCode.length > 4)) {
      nextErrors.cardCode = 'CVV must be 3 or 4 digits.'
    }

    return nextErrors
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    const validationErrors = validateOrder()
    setErrors(validationErrors)
    setError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const cleanExpiry = payment.expirationDate.replace(/\D/g, '')
      const formattedExpiry = cleanExpiry.length === 4
        ? `${cleanExpiry.slice(0, 2)}/${cleanExpiry.slice(2, 4)}`
        : payment.expirationDate

      const payload = {
        items: [
          {
            itemServiceId: Number(product.id),
            quantity: Number(quantity),
            price: Number(price),
          },
        ],
        customer: {
          firstName: customer.firstName.trim(),
          lastName: customer.lastName.trim(),
          email: customer.email.trim(),
          phone: digits(customer.phone, 15),
          country: 'US',
          street: customer.street.trim(),
          city: customer.city.trim(),
          state: customer.state.trim(),
          zip: customer.zip.trim(),
        },
        shipToDifferentAddress: Boolean(shipToDifferentAddress),
        tax: Number(tax),
        authorizeNetPayment: {
          card: {
            cardNumber: digits(payment.cardNumber, 20),
            expirationDate: formattedExpiry,
            cardCode: payment.cardCode.trim(),
          },
        },
      }

      if (shipToDifferentAddress) {
        payload.shipping = {
          firstName: shipping.firstName.trim(),
          lastName: shipping.lastName.trim(),
          street: shipping.street.trim(),
          city: shipping.city.trim(),
          state: shipping.state.trim(),
          zip: shipping.zip.trim(),
          country: 'US',
        }
      }

      const result = await placeOrder(payload)
      const data = unwrapData(result)
      setOrderResult(data || { success: true, orderId: `DMS-${Date.now().toString().slice(-6)}` })
    } catch (err) {
      setError(err.message || 'Failed to process order. Please verify your payment details and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Lock size={20} />
            </span>
            <div>
              <h3 className="font-extrabold text-navy">Secure Checkout</h3>
              <p className="text-xs text-slate-500">256-bit encrypted transaction powered by Authorize.Net</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {orderResult ? (
            <div className="my-8 flex flex-col items-center justify-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={48} />
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-primary">Order Confirmed</p>
              <h2 className="mt-2 text-3xl font-extrabold text-navy sm:text-4xl">Thank you for your purchase!</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
                Your order for <strong>{product.name}</strong> (Qty: {quantity}) has been placed successfully. A receipt and shipping tracking details have been sent to <strong>{customer.email}</strong>.
              </p>

              <div className="mt-6 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Order Reference:</span>
                  <strong className="text-navy">{orderResult.orderId || orderResult.id || `DMS-${Date.now().toString().slice(-6)}`}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200">
                  <span className="text-slate-500">Total Charged:</span>
                  <strong className="text-navy">${total.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Ships To:</span>
                  <span className="text-navy">{customer.street}, {customer.city}, {customer.state} {customer.zip}</span>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button onClick={onClose} className="px-6 py-3">
                  Continue Shopping
                </Button>
                <Button to="/open-an-account" variant="outline" className="px-6 py-3">
                  Setup Merchant Account
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {error && (
                <div role="alert" className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
                {/* Left: Customer & Payment Form */}
                <div className="space-y-6">
                  {/* Step 1: Customer Info */}
                  <div>
                    <h4 className="flex items-center gap-2 text-base font-extrabold text-navy">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">1</span>
                      Customer & Shipping Details
                    </h4>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <FormField id="firstName" label="First Name" required error={errors.firstName}>
                        <input
                          id="firstName"
                          value={customer.firstName}
                          onChange={(e) => handleCustomerChange('firstName', e.target.value)}
                          className={`${formControlClasses} ${errors.firstName ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <FormField id="lastName" label="Last Name" required error={errors.lastName}>
                        <input
                          id="lastName"
                          value={customer.lastName}
                          onChange={(e) => handleCustomerChange('lastName', e.target.value)}
                          className={`${formControlClasses} ${errors.lastName ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <FormField id="email" label="Email Address" required error={errors.email}>
                        <input
                          id="email"
                          type="email"
                          value={customer.email}
                          onChange={(e) => handleCustomerChange('email', e.target.value)}
                          placeholder="name@company.com"
                          className={`${formControlClasses} ${errors.email ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <FormField id="phone" label="Phone Number" required error={errors.phone}>
                        <input
                          id="phone"
                          value={customer.phone}
                          onChange={(e) => handleCustomerChange('phone', phoneFormat(e.target.value))}
                          placeholder="(555) 000-0000"
                          className={`${formControlClasses} ${errors.phone ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <div className="sm:col-span-2">
                        <FormField id="street" label="Street Address" required error={errors.street}>
                          <input
                            id="street"
                            value={customer.street}
                            onChange={(e) => handleCustomerChange('street', e.target.value)}
                            placeholder="123 Business St, Suite 100"
                            className={`${formControlClasses} ${errors.street ? 'border-rose-500' : ''}`}
                          />
                        </FormField>
                      </div>
                      <FormField id="city" label="City" required error={errors.city}>
                        <input
                          id="city"
                          value={customer.city}
                          onChange={(e) => handleCustomerChange('city', e.target.value)}
                          className={`${formControlClasses} ${errors.city ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <FormField id="state" label="State" required error={errors.state}>
                        <select
                          id="state"
                          value={customer.state}
                          onChange={(e) => handleCustomerChange('state', e.target.value)}
                          className={`${formControlClasses} ${errors.state ? 'border-rose-500' : ''}`}
                        >
                          <option value="">Select State</option>
                          {states.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </FormField>
                      <FormField id="zip" label="ZIP Code" required error={errors.zip}>
                        <input
                          id="zip"
                          value={customer.zip}
                          onChange={(e) => handleCustomerChange('zip', digits(e.target.value, 5))}
                          placeholder="78701"
                          maxLength={5}
                          className={`${formControlClasses} ${errors.zip ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                    </div>

                    <label className="mt-4 flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={shipToDifferentAddress}
                        onChange={(e) => setShipToDifferentAddress(e.target.checked)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span>Ship to a different address</span>
                    </label>

                    {shipToDifferentAddress && (
                      <div className="mt-4 rounded-2xl border border-primary/20 bg-slate-50/70 p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Truck size={16} className="text-primary" />
                          <h5 className="text-xs font-extrabold uppercase tracking-wider text-navy">
                            Separate Shipping Address
                          </h5>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField id="shipping_firstName" label="Recipient First Name" required error={errors.shipping_firstName}>
                            <input
                              id="shipping_firstName"
                              value={shipping.firstName}
                              onChange={(e) => handleShippingChange('firstName', e.target.value)}
                              className={`${formControlClasses} ${errors.shipping_firstName ? 'border-rose-500' : ''}`}
                            />
                          </FormField>
                          <FormField id="shipping_lastName" label="Recipient Last Name" required error={errors.shipping_lastName}>
                            <input
                              id="shipping_lastName"
                              value={shipping.lastName}
                              onChange={(e) => handleShippingChange('lastName', e.target.value)}
                              className={`${formControlClasses} ${errors.shipping_lastName ? 'border-rose-500' : ''}`}
                            />
                          </FormField>
                          <div className="sm:col-span-2">
                            <FormField id="shipping_street" label="Shipping Street Address" required error={errors.shipping_street}>
                              <input
                                id="shipping_street"
                                value={shipping.street}
                                onChange={(e) => handleShippingChange('street', e.target.value)}
                                placeholder="456 Destination Ave, Suite 200"
                                className={`${formControlClasses} ${errors.shipping_street ? 'border-rose-500' : ''}`}
                              />
                            </FormField>
                          </div>
                          <FormField id="shipping_city" label="City" required error={errors.shipping_city}>
                            <input
                              id="shipping_city"
                              value={shipping.city}
                              onChange={(e) => handleShippingChange('city', e.target.value)}
                              className={`${formControlClasses} ${errors.shipping_city ? 'border-rose-500' : ''}`}
                            />
                          </FormField>
                          <FormField id="shipping_state" label="State" required error={errors.shipping_state}>
                            <select
                              id="shipping_state"
                              value={shipping.state}
                              onChange={(e) => handleShippingChange('state', e.target.value)}
                              className={`${formControlClasses} ${errors.shipping_state ? 'border-rose-500' : ''}`}
                            >
                              <option value="">Select State</option>
                              {states.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </FormField>
                          <FormField id="shipping_zip" label="ZIP Code" required error={errors.shipping_zip}>
                            <input
                              id="shipping_zip"
                              value={shipping.zip}
                              onChange={(e) => handleShippingChange('zip', digits(e.target.value, 5))}
                              placeholder="75001"
                              maxLength={5}
                              className={`${formControlClasses} ${errors.shipping_zip ? 'border-rose-500' : ''}`}
                            />
                          </FormField>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Payment Details */}
                  <div className="border-t border-slate-200 pt-6">
                    <h4 className="flex items-center gap-2 text-base font-extrabold text-navy">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">2</span>
                      Payment Details
                    </h4>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormField id="cardNumber" label="Credit / Debit Card Number" required error={errors.cardNumber}>
                          <div className="relative">
                            <input
                              id="cardNumber"
                              value={payment.cardNumber}
                              onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                              placeholder="4111 1111 1111 1111"
                              maxLength={23}
                              className={`${formControlClasses} pr-10 font-mono ${errors.cardNumber ? 'border-rose-500' : ''}`}
                            />
                            <CreditCard size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </FormField>
                      </div>
                      <FormField id="expirationDate" label="Expiration Date (MM/YY)" required error={errors.expirationDate}>
                        <input
                          id="expirationDate"
                          value={payment.expirationDate}
                          onChange={(e) => handlePaymentChange('expirationDate', formatExpiryInput(e.target.value))}
                          placeholder="12/30"
                          maxLength={5}
                          className={`${formControlClasses} font-mono ${errors.expirationDate ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                      <FormField id="cardCode" label="Card Code (CVV)" required error={errors.cardCode}>
                        <input
                          id="cardCode"
                          type="password"
                          value={payment.cardCode}
                          onChange={(e) => handlePaymentChange('cardCode', digits(e.target.value, 4))}
                          placeholder="123"
                          maxLength={4}
                          className={`${formControlClasses} font-mono ${errors.cardCode ? 'border-rose-500' : ''}`}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* Right: Order Summary */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <h4 className="font-extrabold text-navy">Order Summary</h4>

                    <div className="mt-4 flex gap-3 border-b border-slate-200 pb-4">
                      {getProductImageUrl(product) ? (
                        <img
                          src={getProductImageUrl(product)}
                          alt={product.name}
                          className="h-16 w-16 rounded-xl border border-slate-200 bg-white object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white text-primary">
                          <Package size={24} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-sm font-extrabold text-navy">{product.name}</strong>
                        <span className="text-xs text-slate-500">Qty: {quantity} &times; ${price.toFixed(2)}</span>
                        <p className="text-sm font-black text-primary">${subtotal.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-navy">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard Shipping:</span>
                        <span className="font-bold text-emerald-700">FREE</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax:</span>
                        <span className="font-bold text-navy">${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2.5">
                        <span>Destination:</span>
                        <span className="font-bold text-navy truncate max-w-[180px] text-right">
                          {shipToDifferentAddress
                            ? (shipping.city && shipping.state ? `${shipping.city}, ${shipping.state} (Alternate)` : 'Separate Shipping Address')
                            : (customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'Customer Address')}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-black text-navy">
                        <span>Order Total:</span>
                        <span className="text-primary text-base">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl bg-white p-3 text-[11px] leading-4 text-slate-500 border border-slate-200/80">
                      <p className="flex items-center gap-1.5 font-bold text-navy">
                        <ShieldCheck size={14} className="text-primary" />
                        Authorize.Net Certified Transaction
                      </p>
                      <p className="mt-1">
                        Your payment will be securely processed and hardware will be shipped directly to your location.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full justify-center py-3 text-base font-bold shadow-md"
                    >
                      {isSubmitting ? (
                        <><LoaderCircle className="animate-spin" size={18} /> Processing Order...</>
                      ) : (
                        `Place Your Order • $${total.toFixed(2)}`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState('')
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    applicationRequest('item-services')
      .then((result) => {
        if (!isMounted) return
        const raw = unwrapData(result)
        const items = Array.isArray(raw) ? raw : raw?.data || []
        setAllProducts(items)

        const matched = items.find((item) => String(item.id) === String(id))
        setProduct(matched || null)
        if (matched) {
          const images = getAllProductImages(matched)
          setActiveImage(images[0] || getProductImageUrl(matched) || '')
        }
      })
      .catch(() => {
        if (!isMounted) return
        setProduct(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id])

  const images = useMemo(() => getAllProductImages(product), [product])
  const inStock = isItemInStock(product)
  const price = Number(product?.sellingPrice ?? product?.price ?? 0)
  const originalPrice = price > 0 ? (price * 1.15).toFixed(2) : null
  const { rating, reviews } = getRating(product?.id)

  // Related products
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return []
    return allProducts
      .filter((p) => String(p.id) !== String(product.id) && (p.category?.solution === product.category?.solution || p.categoryId === product.categoryId))
      .slice(0, 4)
  }, [product, allProducts])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center py-20">
        <LoaderCircle className="animate-spin text-primary" size={44} />
        <p className="mt-4 text-sm font-bold text-navy">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <Package size={56} className="mx-auto text-slate-300" />
        <h1 className="mt-4 text-3xl font-extrabold text-navy">Product Not Found</h1>
        <p className="mt-2 text-slate-600">The hardware item you are looking for may be unavailable or moved.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to="/store">Browse POS Store</Button>
          <Button to="/contact" variant="outline">Contact Support</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Seo
        title={`${product.name} | POS Store`}
        description={product.description || `Buy ${product.name} commercial point-of-sale hardware and payment terminal.`}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-slate-200 bg-slate-50/80 py-3.5 text-xs font-semibold text-slate-600">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="hover:text-primary transition">Home</Link>
          <ChevronRight size={13} className="text-slate-400" />
          <Link to="/store" className="hover:text-primary transition">POS Store</Link>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-400">{product.category?.title || 'Equipment'}</span>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="truncate font-bold text-navy">{product.name}</span>
        </div>
      </nav>

      {/* Product Detail Section */}
      <section className="bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.2fr_0.9fr] lg:gap-12">
            {/* 1. Left Image Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <img
                  src={activeImage || getProductImageUrl(product)}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = getProductImageUrl(product)
                  }}
                  className="max-h-full max-w-full object-contain transition duration-300 hover:scale-105"
                />

                <div className="absolute left-4 top-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${inStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                    <span className={`h-2 w-2 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {inStock ? 'In Stock (Ships Today)' : 'Special Order'}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-2 transition ${activeImage === imgUrl ? 'border-primary shadow-md' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Indicators */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-primary shrink-0" />
                  <span>Free Next-Day US Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary shrink-0" />
                  <span>1-Year Hardware Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={18} className="text-primary shrink-0" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={18} className="text-primary shrink-0" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
              </div>
            </div>

            {/* 2. Center Column: Specs & Description */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
                  {product.category?.title || 'POS Store Item'}
                </span>
                {product.sku && <span className="text-xs font-semibold text-slate-400">SKU: {product.sku}</span>}
              </div>

              <h1 className="mt-2.5 text-3xl font-black tracking-tight text-navy sm:text-4xl">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-2 border-b border-slate-100 pb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm font-bold text-navy">{rating}</span>
                <span className="text-xs text-slate-500">({reviews} customer reviews)</span>
                <span className="ml-2 rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                  50+ bought in past month
                </span>
              </div>

              {/* Price Box */}
              <div className="mt-4">
                <div className="flex items-baseline gap-3">
                  <div className="flex items-start text-4xl font-black text-navy">
                    <span className="text-xl font-bold text-slate-500 mt-1">$</span>
                    <span>{Math.floor(price)}</span>
                    <span className="text-xl font-bold text-slate-500 mt-1">.{(price % 1).toFixed(2).slice(2)}</span>
                  </div>
                  {originalPrice && (
                    <span className="text-base text-slate-400 line-through">${originalPrice}</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Direct purchase price • Or qualify for <strong className="text-navy">$0 upfront</strong> with our merchant payment processing program.
                </p>
              </div>

              {/* About This Item */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy">About this item</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {product.description || 'Enterprise-grade payment terminal and point-of-sale hardware engineered for rapid checkout, reliability, and security. Features EMV chip card insertion, contactless tap-to-pay (NFC), high-speed connectivity, and certified processor compatibility.'}
                </p>

                <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>Supports Apple Pay, Google Pay, Contactless Cards, and Chip EMV</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>Pre-configured and tested for immediate setup out of the box</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>PCI-PTS 5.x / 6.x validated security encryption</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span>Free lifetime firmware updates and 24/7 terminal technical support</span>
                  </li>
                </ul>
              </div>

              {/* Technical Specifications Table */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-navy">Product Specifications</h3>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-200">
                      <tr className="bg-slate-50">
                        <td className="w-1/3 px-4 py-2.5 font-bold text-slate-500">Device Model</td>
                        <td className="px-4 py-2.5 font-semibold text-navy">{product.name}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500">Category</td>
                        <td className="px-4 py-2.5 font-semibold text-navy">{product.category?.title || 'Point-of-Sale Hardware'}</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500">Product SKU</td>
                        <td className="px-4 py-2.5 font-mono font-semibold text-navy">{product.sku || product.barcode || `DMS-${product.id}`}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold text-slate-500">Payment Methods</td>
                        <td className="px-4 py-2.5 font-semibold text-navy">EMV Chip, Contactless NFC, Magstripe, PIN Debit</td>
                      </tr>
                      <tr className="bg-slate-50">
                        <td className="px-4 py-2.5 font-bold text-slate-500">Stock Availability</td>
                        <td className="px-4 py-2.5 font-semibold text-emerald-700">{inStock ? 'In Stock (Warehouse Direct)' : 'Special Order'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. Right Column: Amazon Buy Box */}
            <div className="h-fit rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-xl lg:sticky lg:top-28">
              <div className="text-3xl font-black text-navy">
                ${price.toFixed(2)}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Truck size={16} />
                <span>FREE Delivery Tomorrow</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Order within <strong className="text-navy">4 hrs 30 mins</strong> to receive next-day dispatch.
              </p>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="text-sm font-black text-emerald-700">
                  {inStock ? 'In Stock' : 'Available on backorder'}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Ships directly from Dolphin Logistics Center.</p>
              </div>

              {/* Quantity Selector */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <label htmlFor="qty-select" className="text-xs font-bold text-slate-700">Quantity:</label>
                <select
                  id="qty-select"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-navy focus:border-primary focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>

              {/* Subtotal */}
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Subtotal ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                <span className="text-sm font-black text-navy">${(price * quantity).toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-primary/20"
                >
                  <Zap size={18} /> Buy Now
                </Button>

                <Button
                  to="/open-an-account"
                  variant="outline"
                  className="w-full justify-center py-3 text-xs font-bold border-primary/40 text-primary hover:bg-mist"
                >
                  Bundle with Merchant Account ($0 Upfront)
                </Button>
              </div>

              {/* Seller / Fulfillment Guarantee */}
              <div className="mt-6 border-t border-slate-100 pt-4 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex justify-between">
                  <span>Ships from:</span>
                  <span className="font-semibold text-navy">Dolphin Merchant Services</span>
                </div>
                <div className="flex justify-between">
                  <span>Sold by:</span>
                  <span className="font-semibold text-navy">Dolphin Equipment Direct</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-semibold text-navy">Secure Transaction</span>
                </div>
                <div className="flex justify-between">
                  <span>Returns:</span>
                  <span className="font-semibold text-navy">30-day replacement</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Carousel / Grid */}
          {relatedProducts.length > 0 && (
            <div className="mt-20 border-t border-slate-200 pt-16">
              <h3 className="text-2xl font-extrabold text-navy">Customers also viewed</h3>
              <p className="mt-1 text-sm text-slate-500">Popular hardware and accessories in {product.category?.title || 'this category'}</p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((rel) => {
                  const relPrice = Number(rel.sellingPrice ?? rel.price ?? 0)
                  const relImg = getProductImageUrl(rel)
                  return (
                    <article key={rel.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
                      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-slate-50 p-3">
                        <img
                          src={relImg || getProductImageUrl(rel)}
                          alt={rel.name}
                          onError={(e) => {
                            e.currentTarget.src = getProductImageUrl(rel)
                          }}
                          className="max-h-32 object-contain group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <h4 className="mt-3 line-clamp-2 text-sm font-extrabold text-navy group-hover:text-primary transition">{rel.name}</h4>
                      <p className="mt-2 text-lg font-black text-primary">${relPrice.toFixed(2)}</p>
                      <Button to={`/store/product/${rel.id}`} variant="outline" className="mt-4 justify-center text-xs py-2">
                        View Product
                      </Button>
                    </article>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Checkout Modal with /api/placed-order */}
      <CheckoutModal
        product={product}
        quantity={quantity}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  )
}
