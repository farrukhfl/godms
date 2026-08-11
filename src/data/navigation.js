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
  { label: 'Credit Card Processing', path: '/solutions/credit-card-processing', icon: CreditCard },
  { label: 'POS Solutions', path: '/solutions/pos', icon: MonitorSmartphone },
  { label: 'Merchant Cash Advance', path: '/solutions/cash-advance', icon: Banknote },
  { label: 'ACH Processing', path: '/solutions/ach-processing', icon: CircleDollarSign },
  { label: 'EBT Processing', path: '/solutions/ebt-processing', icon: WalletCards },
  { label: 'ATM Placement', path: '/solutions/atm-placement', icon: Landmark },
  { label: 'AirVac Placement', path: '/solutions/airvac', icon: Wind },
  { label: 'Web 360+', path: '/solutions/web-360', icon: ScanLine },
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
