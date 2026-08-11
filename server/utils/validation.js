const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[\d\s().-]{10,25}$/

const solutionOptions = new Set([
  'Credit Card Processing',
  'POS Solutions',
  'Merchant Cash Advance',
  'ACH Processing',
  'EBT Processing',
  'ATM Placement',
  'AirVac Placement',
  'Web 360+',
])

const volumeOptions = new Set([
  'Under $10,000',
  '$10,000 - $25,000',
  '$25,000 - $50,000',
  '$50,000 - $100,000',
  'Over $100,000',
  'Not processing yet',
])

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validateCommonFields(body) {
  const values = {
    name: clean(body.name),
    businessName: clean(body.businessName),
    phone: clean(body.phone),
    email: clean(body.email).toLowerCase(),
  }
  const errors = {}

  if (!values.name) errors.name = 'Name is required.'
  else if (values.name.length > 100) errors.name = 'Name must be 100 characters or fewer.'

  if (!values.businessName) errors.businessName = 'Business name is required.'
  else if (values.businessName.length > 150) errors.businessName = 'Business name must be 150 characters or fewer.'

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (!values.phone) errors.phone = 'Phone number is required.'
  else if (!phonePattern.test(values.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) errors.phone = 'Enter a valid phone number.'

  if (!values.email) errors.email = 'Email address is required.'
  else if (values.email.length > 254 || !emailPattern.test(values.email)) errors.email = 'Enter a valid email address.'

  return { values, errors }
}

export function validateContactSubmission(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {}
  const { values, errors } = validateCommonFields(body)
  values.solution = clean(body.solution)
  values.message = clean(body.message)

  if (!values.solution) errors.solution = 'Service interested in is required.'
  else if (!solutionOptions.has(values.solution)) errors.solution = 'Select a valid service.'

  if (!values.message) errors.message = 'Message is required.'
  else if (values.message.length > 5000) errors.message = 'Message must be 5,000 characters or fewer.'

  return { values, errors }
}

export function validateAccountApplication(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {}
  const { values, errors } = validateCommonFields(body)
  values.monthlyVolume = clean(body.monthlyVolume)
  values.preferredContact = clean(body.preferredContact)

  if (!values.monthlyVolume) errors.monthlyVolume = 'Monthly processing volume is required.'
  else if (!volumeOptions.has(values.monthlyVolume)) errors.monthlyVolume = 'Select a valid monthly processing volume.'

  if (!values.preferredContact) errors.preferredContact = 'Preferred contact method is required.'
  else if (!['Phone', 'Email'].includes(values.preferredContact)) errors.preferredContact = 'Select a valid contact method.'

  return { values, errors }
}
