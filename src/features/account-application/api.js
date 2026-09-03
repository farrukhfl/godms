import { clearCustomerToken, getCustomerAccessToken, getCustomerAgentId } from '../../utils/customerToken'
import { wcStoreProducts } from '../../data/storeProducts'
import { getProductImageUrl } from '../../utils/productImages'

const primaryUrl = (import.meta.env.VITE_DRMS_API_BASE_URL || 'https://pos.gotmsolutions.com/api').replace(/\/$/, '')
const fallbackUrl = 'https://pos.gotmsolutions.com/api'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '')

  if (!response.ok) {
    const baseMessage = typeof data === 'object' ? data.message || data.error : data
    const validationMessage = data && typeof data === 'object' && data.errors && typeof data.errors === 'object'
      ? Object.entries(data.errors).map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : value}`).join(' ')
      : ''
    const error = new Error([baseMessage, validationMessage].filter(Boolean).join(' ') || `Request failed (${response.status}).`)
    error.status = response.status
    error.fieldErrors = data?.errors || {}
    throw error
  }

  return data
}

export async function applicationRequest(path, options = {}) {
  const cleanPath = String(path).replace(/^\//, '')
  const send = (targetBase, token) => fetch(`${targetBase}/${cleanPath}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
    },
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  let response
  try {
    let token = await getCustomerAccessToken()
    response = await send(primaryUrl, token)
    if (response.status === 401) {
      clearCustomerToken()
      token = await getCustomerAccessToken({ force: true })
      response = await send(primaryUrl, token)
    } else if (response.status >= 500 && primaryUrl !== fallbackUrl) {
      response = await send(fallbackUrl, token)
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    if (primaryUrl !== fallbackUrl) {
      try {
        const token = await getCustomerAccessToken()
        response = await send(fallbackUrl, token)
      } catch {
        response = null
      }
    }
    if (!response) {
      throw new Error('Unable to connect to the application service. Please try again shortly.')
    }
  }

  return parseResponse(response)
}

export async function saveApplication(body) {
  await getCustomerAccessToken()
  return applicationRequest('application', { method: 'POST', body: { ...body, agentId: getCustomerAgentId() } })
}

const allowedMimeTypes = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export async function uploadApplicationFile(file, type) {
  if (!file) {
    throw new Error('No file provided for upload.')
  }

  // Max 10MB file limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(`File ${file.name || ''} exceeds the 10MB upload limit.`)
  }

  // MIME type validation
  if (file.type && !allowedMimeTypes.has(file.type)) {
    throw new Error('Invalid file type. Allowed formats: PNG, JPG, PDF, DOC, DOCX.')
  }

  const body = new FormData()
  body.append('file', file)
  body.append('type', type)
  return applicationRequest('files', { method: 'POST', body })
}

export function unwrapData(result) {
  return result?.data ?? result
}

export function extractFileReference(result, fallbackName = 'signature.png') {
  const data = unwrapData(result)
  const fileObj = data?.merchantSignatureFileUrl || data?.fileUrl || data?.uploadedFiles || data
  return {
    url: fileObj?.url || (typeof fileObj === 'string' ? fileObj : null),
    mimetype: fileObj?.mimetype || 'image/png',
    originalname: fileObj?.originalname || fallbackName,
  }
}

export function dataUrlToFile(dataUrl, filename = 'signature.png') {
  const [header, encoded] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(encoded)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i)
  }
  return new File([array], filename, { type: mime })
}

export async function signAgreementDocument(applicationId, agreementId, signatureFileUrl) {
  return applicationRequest(`application/${applicationId}/agreement-documents/${agreementId}/sign`, {
    method: 'PUT',
    body: { signatureFileUrl },
  })
}

export async function sendAgreementEmail(applicationId, to, unsignedFileUrl) {
  return applicationRequest(`application/${applicationId}/send-agreement-email`, {
    method: 'POST',
    body: { to, unsignedFileUrl },
  })
}

export async function fetchAgreementSummary(applicationId) {
  try {
    const result = await applicationRequest(`application/${applicationId}/agreement-documents/summary`)
    const data = unwrapData(result)
    return data?.envelopeSummaryFileUrl?.url ?? data?.summaryFileUrl?.url ?? data?.url ?? null
  } catch {
    return null
  }
}

export async function downloadAgreementSummary(applicationId) {
  const token = await getCustomerAccessToken()
  const targetUrl = (primaryUrl !== fallbackUrl ? primaryUrl : fallbackUrl)
  const response = await fetch(`${targetUrl}/application/${applicationId}/agreement-documents/summary?download=true`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error('Failed to download agreement summary.')
  }

  const contentType = response.headers.get('content-type') || ''
  let blob

  if (contentType.includes('application/json')) {
    const json = await response.json().catch(() => ({}))
    const url = json?.data?.summaryFileUrl?.url ?? json?.data?.url ?? json?.url
    if (!url) throw new Error('Agreement summary file URL not found.')
    const fileResponse = await fetch(url)
    if (!fileResponse.ok) throw new Error('Failed to download summary document.')
    blob = await fileResponse.blob()
  } else {
    blob = await response.blob()
  }

  const blobUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = `agreement-summary-${applicationId}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(blobUrl)
}

export async function placeOrder(orderPayload) {
  return applicationRequest('placed-order', {
    method: 'POST',
    body: orderPayload,
  })
}

export async function fetchStoreProducts() {
  try {
    const urls = [
      '/testing-shop/wp-json/wc/store/v1/products?per_page=100',
      'https://testing.godms.com/wp-json/wc/store/v1/products?per_page=100',
    ]

    for (const url of urls) {
      try {
        const response = await fetch(url)
        if (response.ok) {
          const raw = await response.json()
          if (Array.isArray(raw) && raw.length > 0) {
            return raw.map((p) => {
              const rawPrice = p.prices?.price ? (parseInt(p.prices.price, 10) / (10 ** (p.prices.currency_minor_unit || 2))) : 0
              const regularPrice = p.prices?.regular_price ? (parseInt(p.prices.regular_price, 10) / (10 ** (p.prices.currency_minor_unit || 2))) : rawPrice
              const catName = p.categories?.[0]?.name || 'Point of Sale (POS)'
              return {
                id: p.id,
                name: p.name,
                sellingPrice: rawPrice,
                price: rawPrice,
                regularPrice: regularPrice > rawPrice ? regularPrice : null,
                description: (p.short_description || p.description || '').replace(/<[^>]*>?/gm, '').trim(),
                images: p.images || [],
                fileUrl: p.images?.[0]?.src || null,
                imageUrl: getProductImageUrl(p),
                inStock: p.is_in_stock ?? true,
                category: { title: catName, solution: 'pos' },
                categories: p.categories || [],
                sku: p.sku || `DMS-${p.id}`,
                slug: p.slug || '',
              }
            })
          }
        }
      } catch {
        // try next endpoint or fallback to bundled catalog
      }
    }
  } catch {
    // fallback
  }

  return wcStoreProducts
}

export async function submitAgentRequest(agentData) {
  return applicationRequest('agent-request', {
    method: 'POST',
    body: {
      tenantId: 1,
      ...agentData,
    },
  })
}
