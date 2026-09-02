// Product image resolution & dedicated hardware visual assets from public/All products and vector fallbacks

const localProductPhotos = [
  // Terminal PIN Pads
  { test: (n) => /pax.*a77/i.test(n), url: '/All products/terminal pin pads/PAX-A77.webp' },
  { test: (n) => /pax.*a35/i.test(n), url: '/All products/terminal pin pads/PAXA35woStand.webp' },
  { test: (n) => /pax.*sp20/i.test(n), url: '/All products/terminal pin pads/PAX-SP20-V4-1.png' },
  { test: (n) => /desk.*3500/i.test(n), url: '/All products/terminal pin pads/Desk3500-573x1024.png' },
  { test: (n) => /move.*5000/i.test(n), url: '/All products/terminal pin pads/Ingenico_Move5000-573x1024.png' },
  { test: (n) => /lane.*8000/i.test(n), url: '/All products/terminal pin pads/Ingenico_Lane8000.jpg' },
  { test: (n) => /lane.*5000/i.test(n), url: '/All products/terminal pin pads/Ingenico_Lane5000.png' },
  { test: (n) => /lane.*3000/i.test(n), url: '/All products/terminal pin pads/Ingenico_Lane3000.jpg' },
  { test: (n) => /lane.*7000/i.test(n), url: '/All products/terminal pin pads/Ingenico-LANE7000.jpg' },
  { test: (n) => /ict.*250/i.test(n), url: '/All products/terminal pin pads/Ingenico-ICT-250DC.jpg' },
  { test: (n) => /ict.*220/i.test(n), url: '/All products/terminal pin pads/Incenigo-ICT220.jpg' },
  { test: (n) => /v400m/i.test(n), url: '/All products/terminal pin pads/Verifone_v400m.jpg' },
  { test: (n) => /v400c/i.test(n), url: '/All products/terminal pin pads/Verifone_v400c.png' },
  { test: (n) => /fd200/i.test(n), url: '/All products/terminal pin pads/FD200.jpg' },
  { test: (n) => /fd150/i.test(n), url: '/All products/terminal pin pads/FD150.jpg' },
  { test: (n) => /nexgo/i.test(n), url: '/All products/terminal pin pads/NexgoN5.png' },

  // Point of Sale Systems
  { test: (n) => /clover.*duo/i.test(n), url: '/All products/point of sale/Clover-Station-Duo-2-LTE-Bundle-1024x688.png' },
  { test: (n) => /clover.*solo/i.test(n), url: '/All products/point of sale/Clover-Station-Solo-Bundle.png' },
  { test: (n) => /clover.*mini|mini\s*3/i.test(n), url: '/All products/point of sale/mini3-1024x688.png' },
  { test: (n) => /dolphin.*pos|pos.*bundle|pos.*screen/i.test(n), url: '/All products/point of sale/POS Screen Final.png' },

  // Printers
  { test: (n) => /star.*tsp|tsp.*143/i.test(n), url: '/All products/printer/Star-Micros-TSP143III.png' },
  { test: (n) => /epson.*tm.*l90/i.test(n), url: '/All products/printer/Epson-TM-L90.png' },
  { test: (n) => /tm.*t20|tm.*t88/i.test(n), url: '/All products/printer/tmt20iii_main.jpg' },
  { test: (n) => /clover.*kitchen.*printer|kitchen.*printer/i.test(n), url: '/All products/printer/Clover-Kitchen-Printer.jpg' },
  { test: (n) => /mc\s*print|printer/i.test(n), url: '/All products/printer/Star-Micros-TSP143III.png' },

  // Barcode Scanners
  { test: (n) => /zebra.*ds9308|ds9308/i.test(n), url: '/All products/barcode scanner/Zebra-DS9308-hands-free.png' },
  { test: (n) => /clover.*2d.*scanner|2d.*scanner/i.test(n), url: '/All products/barcode scanner/Clover-2D-Hand-Held-Barcode-Scanner.jpg' },
  { test: (n) => /symbol|ds9808|scanner/i.test(n), url: '/All products/barcode scanner/symbol.jpg' },

  // Point of Sale Equipment
  { test: (n) => /clover.*cash.*drawer|volcora|cash.*drawer/i.test(n), url: '/All products/point of sale equipment/Clover-Cash-Drawer.jpg' },
  { test: (n) => /clover.*weight.*scale|weight.*scale|scale/i.test(n), url: '/All products/point of sale equipment/Clover-Weight-Scale.jpg' },
  { test: (n) => /clover.*kds|kitchen.*display/i.test(n), url: '/All products/point of sale equipment/Clover-Kitchen-Display-1024x688.jpg' },
  { test: (n) => /clover.*go/i.test(n), url: '/All products/point of sale equipment/Clover-Go-Gen-3-Reader.png' },
  { test: (n) => /clover.*flex/i.test(n), url: '/All products/clover accessories/Clover-Flex-Travel-Kit.png' },

  // ATM Hardware
  { test: (n) => /halo|halo2|hyosung/i.test(n), url: '/All products/atm ccessories/Halo2Shell_Side.png' },
  { test: (n) => /g2500|genmega|hantle/i.test(n), url: '/All products/atm ccessories/G2500.png' },
  { test: (n) => /atm.*sign|neon/i.test(n), url: '/All products/atm ccessories/ATM-Sign.jpg' },

  // Paper and Ink
  { test: (n) => /thermal.*paper|paper.*roll|rolls|2\s*1\/4|3\s*1\/8/i.test(n), url: '/All products/paper and ink/PaperWebsite.png' },
  { test: (n) => /2ply|2-ply|bond/i.test(n), url: '/All products/paper and ink/2ply.png' },
  { test: (n) => /ink|ribbon|cartridge/i.test(n), url: '/All products/paper and ink/inkcartridge.jpg' },

  // Cables
  { test: (n) => /cable|internet|network|ethernet/i.test(n), url: '/All products/cable/internetcable.jpg' },
]

function createSvgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`
}

const defaultDeviceSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <rect x="140" y="80" width="220" height="340" rx="32" fill="#1E293B"/>
  <rect x="155" y="100" width="190" height="200" rx="18" fill="#0284C7"/>
  <circle cx="250" cy="200" r="32" fill="#FFFFFF" fill-opacity="0.25"/>
  <path d="M238 200 L246 208 L262 192" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="175" y="340" width="150" height="40" rx="10" fill="#334155"/>
  <text x="250" y="365" fill="#38BDF8" font-size="12" font-family="sans-serif" font-weight="bold" text-anchor="middle">DOLPHIN POS</text>
</svg>
`)

export function extractBackendImageUrl(item) {
  if (!item) return null

  // 1. WooCommerce images array: [{ src: '...' }]
  if (Array.isArray(item.images) && item.images.length > 0) {
    const src = item.images[0]?.src || item.images[0]?.url || item.images[0]
    if (typeof src === 'string' && src.startsWith('http')) return src
  }

  // 2. Array fileUrl: [{ url: '...' }]
  if (Array.isArray(item.fileUrl) && item.fileUrl.length > 0) {
    const first = item.fileUrl[0]
    if (typeof first === 'string' && first.startsWith('http')) return first
    if (first && typeof first === 'object' && first.url) return first.url
  }

  // 3. Object fileUrl: { url: '...' }
  if (item.fileUrl && typeof item.fileUrl === 'object' && item.fileUrl.url) {
    return item.fileUrl.url
  }

  // 4. String fileUrl: 'https://...'
  if (typeof item.fileUrl === 'string' && item.fileUrl.startsWith('http')) {
    return item.fileUrl
  }

  // 5. pictureUrl / imageUrl
  if (typeof item.pictureUrl === 'string' && item.pictureUrl.startsWith('http')) {
    return item.pictureUrl
  }
  if (typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http')) {
    return item.imageUrl
  }

  return null
}

export function getProductImageUrl(item) {
  if (!item) return defaultDeviceSvg

  // 1. Check if WooCommerce or Backend has uploaded an image
  const backendUrl = extractBackendImageUrl(item)
  if (backendUrl) return backendUrl

  // 2. Check local photo assets from public/All products
  const name = String(item.name || item.title || '')
  const matchedLocal = localProductPhotos.find((entry) => entry.test(name))
  if (matchedLocal?.url) return matchedLocal.url

  // 3. Fallback visual
  return defaultDeviceSvg
}

export function getAllProductImages(item) {
  if (!item) return [defaultDeviceSvg]
  const list = []

  // WooCommerce images
  if (Array.isArray(item.images)) {
    item.images.forEach((img) => {
      const src = img?.src || img?.url || (typeof img === 'string' ? img : null)
      if (src && !list.includes(src)) list.push(src)
    })
  }

  // Backend image URLs
  if (Array.isArray(item.fileUrl)) {
    item.fileUrl.forEach((f) => {
      const url = f?.url || (typeof f === 'string' ? f : null)
      if (url && !list.includes(url)) list.push(url)
    })
  } else {
    const single = extractBackendImageUrl(item)
    if (single && !list.includes(single)) list.push(single)
  }

  // Local matching photo
  const name = String(item.name || item.title || '')
  const matchedLocal = localProductPhotos.find((entry) => entry.test(name))
  if (matchedLocal?.url && !list.includes(matchedLocal.url)) {
    list.push(matchedLocal.url)
  }

  // Fallback
  if (!list.length) {
    const fallback = getProductImageUrl(item)
    if (fallback) list.push(fallback)
  }

  return list.length ? list : [defaultDeviceSvg]
}
