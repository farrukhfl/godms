import {
  Accessibility,
  Banknote,
  Barcode,
  BookOpen,
  Building2,
  Cable,
  CircleDollarSign,
  CreditCard,
  GraduationCap,
  HeartPulse,
  Landmark,
  MonitorSmartphone,
  Package,
  Printer,
  ReceiptText,
  ScanLine,
  ShoppingBag,
  Store,
  Utensils,
  WalletCards,
  Wind,
} from 'lucide-react'

export const industries = [
  { label: 'Retail', path: '/industries/retail', icon: ShoppingBag, description: 'Fast, flexible checkout for every kind of shop.' },
  { label: 'Hospitality', path: '/industries/hospitality', icon: Utensils, description: 'Keep service moving from table to terminal.' },
  { label: 'Professional Services', path: '/industries/services', icon: Building2, description: 'Simple invoicing and secure client payments.' },
  { label: 'Healthcare', path: '/industries/healthcare', icon: HeartPulse, description: 'Patient-friendly payments built around care.' },
  { label: 'Education', path: '/industries/education', icon: GraduationCap, description: 'Modern payments for schools and campuses.' },
  { label: 'Government', path: '/industries/government', icon: Landmark, description: 'Reliable collection tools for public services.' },
]

export const solutions = [
  { label: 'Credit Card Processing', path: '/solutions/credit-card-processing', icon: CreditCard, description: 'Dual pricing, zero card fees, and next-day funding.' },
  { label: 'POS Solutions', path: '/solutions/pos', icon: MonitorSmartphone, description: 'All-in-one counter workstations with inventory sync.' },
  { label: 'Merchant Cash Advance', path: '/solutions/cash-advance', icon: Banknote, description: 'Revenue-based growth capital up to $250k in 48 hours.' },
  { label: 'ACH Processing', path: '/solutions/ach-processing', icon: CircleDollarSign, description: 'Lower-cost domestic bank transfers and recurring billing.' },
  { label: 'EBT Processing', path: '/solutions/ebt-processing', icon: WalletCards, description: 'Dependable SNAP and eWIC benefit acceptance for retailers.' },
  { label: 'ATM Placement', path: '/solutions/atm-placement', icon: Landmark, description: 'Turnkey managed ATM machines with passive revenue sharing.' },
  { label: 'AirVac Placement', path: '/solutions/airvac', icon: Wind, description: 'Free commercial air and vacuum machines for vehicle sites.' },
  { label: 'Web 360+', path: '/solutions/web-360', icon: ScanLine, description: 'Custom web design, hosting, domains, and connected ecommerce.' },
]

export const storeCategories = [
  { label: 'Terminals & Pin Pads', path: '/store/terminals', icon: CreditCard },
  { label: 'Accessories & Cables', path: '/store/accessories', icon: Cable },
  { label: 'ATM & Accessories', path: '/store/atm-accessories', icon: Landmark },
  { label: 'Barcode Scanners', path: '/store/barcode-scanners', icon: Barcode },
  { label: 'Clover & Accessories', path: '/store/clover', icon: Accessibility },
  { label: 'Point of Sale (POS)', path: '/store/pos', icon: Store },
  { label: 'POS Equipment', path: '/store/pos-equipment', icon: Package },
  { label: 'Printers', path: '/store/printers', icon: Printer },
  { label: 'Paper & Ink', path: '/store/paper-ink', icon: ReceiptText },
]

export const explore = [
  { label: 'About Us', path: '/about', icon: BookOpen },
  { label: 'Careers', path: '/careers', icon: Building2 },
  { label: 'Referral Partner', path: '/referral-partner', icon: CircleDollarSign },
  { label: 'Partner Program', path: '/partner-program', icon: WalletCards },
]

export const navGroups = [
  { label: 'Industries', items: industries },
  { label: 'Solutions', items: solutions },
  { label: 'POS Store', items: storeCategories },
  { label: 'Explore', items: explore },
]
