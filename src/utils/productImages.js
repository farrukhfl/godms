// Product image resolution & dedicated hardware vector visuals

function createSvgDataUri(svgContent) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`
}

// 1. POS Thermal Receipt Printer SVG
const printerSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Printer Base Body -->
  <rect x="110" y="190" width="280" height="220" rx="28" fill="#1E293B"/>
  <rect x="120" y="200" width="260" height="200" rx="22" fill="#0F172A"/>
  <!-- Printer Top Lid -->
  <path d="M125 190 Q250 160 375 190 L365 240 L135 240 Z" fill="#334155"/>
  <rect x="140" y="195" width="220" height="12" rx="6" fill="#090D16"/>
  <!-- Paper Feeding Out -->
  <path d="M150 195 L150 100 Q150 85 165 85 L335 85 Q350 85 350 100 L350 195 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Paper Content Lines -->
  <rect x="175" y="110" width="150" height="8" rx="4" fill="#0284C7"/>
  <rect x="175" y="128" width="110" height="6" rx="3" fill="#94A3B8"/>
  <rect x="175" y="142" width="150" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="175" y="156" width="130" height="6" rx="3" fill="#CBD5E1"/>
  <rect x="175" y="170" width="90" height="6" rx="3" fill="#94A3B8"/>
  <!-- Printer Controls & Lights -->
  <circle cx="160" cy="275" r="7" fill="#10B981"/>
  <circle cx="185" cy="275" r="7" fill="#F59E0B"/>
  <circle cx="210" cy="275" r="7" fill="#EF4444"/>
  <!-- Feed Button -->
  <rect x="300" y="260" width="65" height="30" rx="8" fill="#1E293B" stroke="#475569" stroke-width="2"/>
  <text x="332" y="279" fill="#94A3B8" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">FEED</text>
  <!-- Brand Plate -->
  <rect x="180" y="340" width="140" height="32" rx="8" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>
  <text x="250" y="361" fill="#38BDF8" font-size="12" font-family="sans-serif" font-weight="900" letter-spacing="1" text-anchor="middle">THERMAL POS</text>
</svg>
`)

// 2. Smart POS Touch Terminal (PAX / Dejavoo / Smart Wireless)
const smartTerminalSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Terminal Body Outer -->
  <rect x="140" y="60" width="220" height="380" rx="36" fill="#1E293B"/>
  <rect x="148" y="68" width="204" height="364" rx="30" fill="#0F172A"/>
  <!-- Integrated Printer Compartment Top -->
  <rect x="170" y="80" width="160" height="28" rx="8" fill="#334155"/>
  <rect x="185" y="90" width="130" height="6" rx="3" fill="#0F172A"/>
  <!-- Touch Screen Display -->
  <rect x="165" y="125" width="170" height="240" rx="18" fill="#1E293B" stroke="#334155" stroke-width="2"/>
  <rect x="172" y="132" width="156" height="226" rx="14" fill="#0284C7"/>
  <!-- Screen Elements -->
  <circle cx="250" cy="180" r="28" fill="#FFFFFF" fill-opacity="0.2"/>
  <path d="M240 180 L247 187 L262 172" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="250" y="235" fill="#FFFFFF" font-size="20" font-family="sans-serif" font-weight="900" text-anchor="middle">$0.00</text>
  <text x="250" y="255" fill="#BAE6FD" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">TAP, INSERT OR SWIPE</text>
  <!-- Contactless NFC Wave Symbol -->
  <path d="M235 285 Q250 275 265 285" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M230 293 Q250 279 270 293" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M225 301 Q250 283 275 301" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/>
  <!-- Bottom EMV Chip Card Slot -->
  <rect x="175" y="390" width="150" height="16" rx="8" fill="#334155"/>
  <rect x="195" y="395" width="110" height="6" rx="3" fill="#090D16"/>
</svg>
`)

// 3. Countertop POS Station / Clover Station
const posStationSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- POS Monitor Screen Frame -->
  <rect x="80" y="90" width="340" height="230" rx="24" fill="#0F172A" stroke="#334155" stroke-width="3"/>
  <rect x="95" y="105" width="310" height="200" rx="16" fill="#0284C7"/>
  <!-- Screen Dashboard Graphic -->
  <rect x="115" y="125" width="120" height="40" rx="10" fill="#FFFFFF" fill-opacity="0.2"/>
  <text x="175" y="150" fill="#FFFFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">NEW ORDER</text>
  <rect x="250" y="125" width="135" height="160" rx="12" fill="#FFFFFF"/>
  <rect x="265" y="145" width="105" height="10" rx="5" fill="#0F172A"/>
  <rect x="265" y="165" width="80" height="8" rx="4" fill="#94A3B8"/>
  <rect x="265" y="180" width="95" height="8" rx="4" fill="#94A3B8"/>
  <rect x="265" y="245" width="105" height="25" rx="8" fill="#10B981"/>
  <text x="317" y="262" fill="#FFFFFF" font-size="11" font-family="sans-serif" font-weight="bold" text-anchor="middle">CHECKOUT</text>
  <!-- Screen Stand -->
  <path d="M225 320 L275 320 L290 400 L210 400 Z" fill="#475569"/>
  <!-- Heavy Base Plate -->
  <ellipse cx="250" cy="410" rx="110" ry="25" fill="#1E293B"/>
  <ellipse cx="250" cy="405" rx="100" ry="20" fill="#334155"/>
</svg>
`)

// 4. Barcode Scanner (Handheld & Presentation)
const scannerSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Scanner Head Body -->
  <path d="M150 140 Q150 100 190 100 L310 100 Q350 100 350 140 L340 230 Q330 250 300 250 L200 250 Q170 250 160 230 Z" fill="#0F172A"/>
  <!-- Optical Scan Window Front -->
  <rect x="180" y="120" width="140" height="90" rx="18" fill="#1E293B" stroke="#38BDF8" stroke-width="3"/>
  <rect x="195" y="135" width="110" height="60" rx="10" fill="#0284C7"/>
  <!-- Laser Beam Line -->
  <line x1="160" y1="165" x2="340" y2="165" stroke="#EF4444" stroke-width="5" stroke-linecap="round"/>
  <!-- Scanner Ergonomic Handle -->
  <path d="M220 250 L200 400 Q200 420 225 425 L275 425 Q300 420 300 400 L280 250 Z" fill="#1E293B"/>
  <!-- Trigger Button -->
  <rect x="190" y="260" width="25" height="40" rx="6" fill="#F59E0B"/>
  <!-- Rubber Grip Accents -->
  <rect x="235" y="320" width="30" height="6" rx="3" fill="#475569"/>
  <rect x="235" y="340" width="30" height="6" rx="3" fill="#475569"/>
  <rect x="235" y="360" width="30" height="6" rx="3" fill="#475569"/>
</svg>
`)

// 5. Commercial Cash Drawer
const cashDrawerSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Cash Drawer Steel Enclosure -->
  <rect x="70" y="150" width="360" height="220" rx="20" fill="#0F172A" stroke="#334155" stroke-width="4"/>
  <rect x="85" y="165" width="330" height="190" rx="14" fill="#1E293B"/>
  <!-- Front Drawer Face Plate -->
  <rect x="95" y="180" width="310" height="160" rx="10" fill="#0F172A"/>
  <!-- Dual Media Slots -->
  <rect x="120" y="200" width="110" height="12" rx="6" fill="#334155"/>
  <rect x="270" y="200" width="110" height="12" rx="6" fill="#334155"/>
  <!-- Key Lock Mechanism -->
  <circle cx="250" cy="265" r="18" fill="#CBD5E1"/>
  <circle cx="250" cy="265" r="14" fill="#94A3B8"/>
  <rect x="248" y="258" width="4" height="14" rx="2" fill="#0F172A"/>
  <!-- Heavy Duty Handle / Bevel -->
  <rect x="180" y="305" width="140" height="14" rx="7" fill="#334155"/>
</svg>
`)

// 6. Retail ATM Machine
const atmMachineSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- ATM Upper Fascia / Sign -->
  <rect x="160" y="40" width="180" height="60" rx="16" fill="#0284C7"/>
  <text x="250" y="80" fill="#FFFFFF" font-size="28" font-family="sans-serif" font-weight="900" letter-spacing="4" text-anchor="middle">ATM</text>
  <!-- ATM Safe Body -->
  <rect x="140" y="110" width="220" height="340" rx="24" fill="#1E293B" stroke="#334155" stroke-width="4"/>
  <rect x="155" y="125" width="190" height="180" rx="16" fill="#0F172A"/>
  <!-- ATM Display Screen -->
  <rect x="175" y="140" width="150" height="90" rx="10" fill="#0284C7"/>
  <text x="250" y="190" fill="#FFFFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">INSERT CARD</text>
  <!-- Card Reader & Receipt Slots -->
  <rect x="175" y="245" width="60" height="10" rx="5" fill="#10B981"/>
  <rect x="265" y="245" width="60" height="10" rx="5" fill="#38BDF8"/>
  <!-- Cash Dispenser Shutter -->
  <rect x="170" y="340" width="160" height="40" rx="12" fill="#0F172A" stroke="#475569" stroke-width="2"/>
  <rect x="190" y="355" width="120" height="10" rx="5" fill="#10B981"/>
</svg>
`)

// 7. Thermal Receipt Paper Rolls Case
const paperRollsSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Stacked Paper Roll 1 (Back Left) -->
  <ellipse cx="180" cy="180" rx="60" ry="25" fill="#E2E8F0"/>
  <rect x="120" y="180" width="120" height="90" fill="#F1F5F9"/>
  <ellipse cx="180" cy="270" rx="60" ry="25" fill="#CBD5E1"/>
  <ellipse cx="180" cy="180" rx="16" ry="7" fill="#475569"/>
  <!-- Stacked Paper Roll 2 (Back Right) -->
  <ellipse cx="320" cy="180" rx="60" ry="25" fill="#E2E8F0"/>
  <rect x="260" y="180" width="120" height="90" fill="#F1F5F9"/>
  <ellipse cx="320" cy="270" rx="60" ry="25" fill="#CBD5E1"/>
  <ellipse cx="320" cy="180" rx="16" ry="7" fill="#475569"/>
  <!-- Front Paper Roll (Hero Center) -->
  <ellipse cx="250" cy="250" rx="75" ry="30" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <rect x="175" y="250" width="150" height="110" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <ellipse cx="250" cy="360" rx="75" ry="30" fill="#E2E8F0"/>
  <!-- Core Hole & Blue Band -->
  <ellipse cx="250" cy="250" rx="22" ry="9" fill="#1E293B"/>
  <rect x="175" y="290" width="150" height="25" fill="#0284C7"/>
  <text x="250" y="307" fill="#FFFFFF" font-size="10" font-family="sans-serif" font-weight="bold" text-anchor="middle">THERMAL 50 PACK</text>
</svg>
`)

// 8. Terminal Stand / Mount / Accessories
const accessorySvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Swivel Mounting Head -->
  <rect x="140" y="120" width="220" height="140" rx="20" fill="#1E293B" stroke="#334155" stroke-width="3"/>
  <rect x="160" y="140" width="180" height="100" rx="12" fill="#0F172A"/>
  <circle cx="250" cy="190" r="22" fill="#0284C7"/>
  <!-- Heavy Duty Pole Arm -->
  <rect x="230" y="260" width="40" height="120" rx="8" fill="#475569"/>
  <rect x="242" y="270" width="16" height="100" rx="4" fill="#334155"/>
  <!-- Flanged Base Mount -->
  <ellipse cx="250" cy="390" rx="100" ry="25" fill="#1E293B"/>
  <ellipse cx="250" cy="385" rx="90" ry="20" fill="#334155"/>
  <circle cx="180" cy="385" r="5" fill="#94A3B8"/>
  <circle cx="320" cy="385" r="5" fill="#94A3B8"/>
</svg>
`)

// 9. Clover Handheld / Flex Pocket Device
const cloverFlexSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <!-- Clover Clean White Chassis -->
  <rect x="150" y="70" width="200" height="360" rx="36" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4"/>
  <!-- Top Printer Cover -->
  <rect x="170" y="90" width="160" height="35" rx="10" fill="#F1F5F9"/>
  <!-- Big Touch Display -->
  <rect x="165" y="140" width="170" height="230" rx="16" fill="#0F172A"/>
  <circle cx="250" cy="230" r="32" fill="#10B981"/>
  <path d="M238 230 L246 238 L262 222" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="250" y="285" fill="#FFFFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">APPROVED</text>
  <!-- Clover Logo / Icon Indicator -->
  <circle cx="250" cy="395" r="10" fill="#10B981"/>
</svg>
`)

// 10. Service / Technical Setup
const serviceSvg = createSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" fill="none">
  <rect width="500" height="500" rx="32" fill="#F8FAFC"/>
  <circle cx="250" cy="230" r="110" fill="#E0F2FE"/>
  <circle cx="250" cy="230" r="90" fill="#0284C7"/>
  <!-- Shield & Checkmark -->
  <path d="M250 170 L295 190 L295 245 Q295 285 250 305 Q205 285 205 245 L205 190 Z" fill="#FFFFFF"/>
  <path d="M232 235 L244 247 L268 223" stroke="#0284C7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Badge Label -->
  <rect x="150" y="360" width="200" height="36" rx="12" fill="#0F172A"/>
  <text x="250" y="383" fill="#38BDF8" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">CERTIFIED SERVICE</text>
</svg>
`)

// Comprehensive matcher mapping all 119 items to their best visual representation
const hardwareVisualRules = [
  // 1. Specific Receipt Printers (Star Micronics, Epson, MC Print, TSP)
  {
    test: (name, desc) => /mc\s*print|star|tsp|epson|tm\s*t88|tm\s*t20|tm\s*l90|kitchen\s*printer|printer|label\s*printer/i.test(`${name} ${desc}`),
    image: printerSvg,
  },

  // 2. Clover POS & Accessories
  {
    test: (name) => /clover\s*station|duo|solo/i.test(name),
    image: posStationSvg,
  },
  {
    test: (name) => /clover\s*flex|flex\s*3|flex\s*4|clover\s*compact|clover\s*go/i.test(name),
    image: cloverFlexSvg,
  },
  {
    test: (name) => /clover\s*mini|mini\s*3|kiosk/i.test(name),
    image: posStationSvg,
  },
  {
    test: (name) => /clover/i.test(name),
    image: cloverFlexSvg,
  },

  // 3. Barcode Scanners (Zebra, Symbol, DS9808, DS9308, Handheld, 2D)
  {
    test: (name, desc) => /scanner|barcode|ds9808|ds9308|symbol|zebra|scan/i.test(`${name} ${desc}`),
    image: scannerSvg,
  },

  // 4. Cash Drawers & Scales
  {
    test: (name, desc) => /drawer|cash\s*drawer|volcora|scale|weight\s*scale/i.test(`${name} ${desc}`),
    image: cashDrawerSvg,
  },

  // 5. Retail ATM Machines & Parts (Hyosung, Halo, Genmega, Hantle, Tranax, CDU)
  {
    test: (name, desc) => /atm|hyosung|halo|genmega|hantle|1800\s*se|g1900|g2500|cdu|double\s*detect/i.test(`${name} ${desc}`),
    image: atmMachineSvg,
  },

  // 6. Smart Terminals (PAX A920, A77, A35, S300, S80, Dejavoo Z11, Z8, Z6, QD4, Ingenico Desk 3500, Lane 3000)
  {
    test: (name, desc) => /pax|dejavoo|ingenico|verifone|terminal|pin\s*pad|cardpointe|vp3300|magtek|sredkey|augusta/i.test(`${name} ${desc}`),
    image: smartTerminalSvg,
  },

  // 7. POS Workstations, Systems & Touchscreens
  {
    test: (name, desc) => /pos|point\s*of\s*sale|station|register|touch\s*screen|server\s*pc/i.test(`${name} ${desc}`),
    image: posStationSvg,
  },

  // 8. Thermal Paper Rolls & Supplies
  {
    test: (name, desc) => /paper|thermal\s*roll|rolls|ribbon|ink/i.test(`${name} ${desc}`),
    image: paperRollsSvg,
  },

  // 9. Stands, Cables, Routers & Hardware Accessories
  {
    test: (name, desc) => /stand|cable|swivel|mount|power|router|tp\s*link|bracket|port|bump\s*bar/i.test(`${name} ${desc}`),
    image: accessorySvg,
  },

  // 10. Technical Services, Programming, Encryption
  {
    test: (name, desc) => /service|encryption|tsys|programming|fee|storage|cloud/i.test(`${name} ${desc}`),
    image: serviceSvg,
  },
]

export function extractBackendImageUrl(item) {
  if (!item) return null

  // 1. Array fileUrl: [{ url: '...' }]
  if (Array.isArray(item.fileUrl) && item.fileUrl.length > 0) {
    const first = item.fileUrl[0]
    if (typeof first === 'string' && first.startsWith('http')) return first
    if (first && typeof first === 'object' && first.url) return first.url
  }

  // 2. Object fileUrl: { url: '...' }
  if (item.fileUrl && typeof item.fileUrl === 'object' && item.fileUrl.url) {
    return item.fileUrl.url
  }

  // 3. String fileUrl: 'https://...'
  if (typeof item.fileUrl === 'string' && item.fileUrl.startsWith('http')) {
    return item.fileUrl
  }

  // 4. pictureUrl
  if (typeof item.pictureUrl === 'string' && item.pictureUrl.startsWith('http')) {
    return item.pictureUrl
  }
  if (item.pictureUrl && typeof item.pictureUrl === 'object' && item.pictureUrl.url) {
    return item.pictureUrl.url
  }

  return null
}

export function getProductImageUrl(item) {
  if (!item) return smartTerminalSvg

  // 1. If backend has uploaded a valid image URL, use it
  const backendUrl = extractBackendImageUrl(item)
  if (backendUrl) return backendUrl

  // 2. Match device-specific vector visual
  const name = String(item.name || '')
  const desc = String(item.description || '')
  const rule = hardwareVisualRules.find((r) => r.test(name, desc))
  if (rule?.image) return rule.image

  // 3. Fallback based on category solution
  const solution = String(item.category?.solution || '').toLowerCase()
  if (solution === 'credit-card') return smartTerminalSvg
  if (solution === 'pos') return posStationSvg
  if (solution === 'atm') return atmMachineSvg

  return smartTerminalSvg
}

export function getAllProductImages(item) {
  if (!item) return [smartTerminalSvg]
  const list = []

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

  // Dedicated visual
  const fallback = getProductImageUrl(item)
  if (fallback && !list.includes(fallback)) {
    list.push(fallback)
  }

  return list.length ? list : [smartTerminalSvg]
}
