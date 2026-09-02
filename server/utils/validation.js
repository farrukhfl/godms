const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[\d\s().-]{10,25}$/

const solutionOptions = new Set([
  'Credit Card Processing',
  'POS Solutions',
  'POS',
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

function validateCommonFields(body, { phoneRequired = true } = {}) {
  const values = {
    name: clean(body.name),
    businessName: clean(body.businessName),
    phone: clean(body.phone),
    email: clean(body.email).toLowerCase(),
  }
  const errors = {}

  if (!values.name) errors.name = 'Name is required.'
  else if (values.name.length > 100) errors.name = 'Name must be 100 characters or fewer.'

  if (!values.businessName && body.businessName !== undefined) {
    errors.businessName = 'Business name is required.'
  } else if (values.businessName.length > 150) {
    errors.businessName = 'Business name must be 150 characters or fewer.'
  }

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (phoneRequired) {
    if (!values.phone) errors.phone = 'Phone number is required.'
    else if (!phonePattern.test(values.phone) || phoneDigits.length < 10 || phoneDigits.length > 15) errors.phone = 'Enter a valid phone number.'
  } else if (values.phone && (!phonePattern.test(values.phone) || phoneDigits.length < 10 || phoneDigits.length > 15)) {
    errors.phone = 'Enter a valid phone number with at least 10 digits.'
  }

  if (!values.email) errors.email = 'Email address is required.'
  else if (values.email.length > 254 || !emailPattern.test(values.email)) errors.email = 'Enter a valid email address.'

  return { values, errors }
}

export function validateContactSubmission(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {}
  const { values, errors } = validateCommonFields(body, { phoneRequired: Boolean(body.phone) })
  
  const rawService = clean(body.service || body.solution)
  values.service = rawService
  values.solution = rawService
  values.message = clean(body.message)

  if (!rawService) {
    errors.service = 'Select the service you are interested in.'
  } else if (!solutionOptions.has(rawService)) {
    // Check case-insensitive match
    const matched = Array.from(solutionOptions).find((opt) => opt.toLowerCase() === rawService.toLowerCase())
    if (matched) {
      values.service = matched
      values.solution = matched
    } else {
      errors.service = 'Select a valid service.'
    }
  }

  if (!values.message) errors.message = 'Message is required.'
  else if (values.message.length > 5000) errors.message = 'Message must be 5,000 characters or fewer.'

  return { values, errors }
}

export function validateCareerSubmission(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {}
  const values = {
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    phone: clean(body.phone),
    message: clean(body.message),
    resumeFileName: clean(body.resumeFileName || body.resumeName),
  }
  const errors = {}

  if (!values.name) errors.name = 'Please enter your name.'
  else if (values.name.length > 100) errors.name = 'Name must be 100 characters or fewer.'

  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!emailPattern.test(values.email)) errors.email = 'Enter a valid email address.'

  const phoneDigits = values.phone.replace(/\D/g, '')
  if (!values.phone) errors.phone = 'Please enter your phone number.'
  else if (phoneDigits.length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'

  if (!values.message) errors.message = 'Tell us briefly about the work that interests you.'
  else if (values.message.length > 5000) errors.message = 'Message must be 5,000 characters or fewer.'

  return { values, errors }
}

export function validateReferralSubmission(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) body = {}
  const values = {
    firstName: clean(body.firstName),
    lastName: clean(body.lastName),
    phone: clean(body.phone),
    email: clean(body.email).toLowerCase(),
    companyName: clean(body.companyName),
    companyWebsite: clean(body.companyWebsite),
    source: clean(body.source),
    service: clean(body.service),
    consent: Boolean(body.consent),
  }
  const errors = {}

  if (!values.firstName) errors.firstName = 'Please enter your first name.'
  if (!values.lastName) errors.lastName = 'Please enter your last name.'
  
  const phoneDigits = values.phone.replace(/\D/g, '')
  if (!values.phone) errors.phone = 'Please enter your phone number.'
  else if (phoneDigits.length < 10) errors.phone = 'Enter a valid phone number with at least 10 digits.'

  if (!values.email) errors.email = 'Please enter your email address.'
  else if (!emailPattern.test(values.email)) errors.email = 'Enter a valid email address.'

  if (!values.companyName) errors.companyName = 'Please enter your company name.'
  if (!values.source) errors.source = 'Select how you know DMS.'
  if (!values.service) errors.service = 'Select a service to refer.'
  if (!values.consent) errors.consent = 'Consent is required before submitting.'

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
