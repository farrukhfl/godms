/*
 * CONFIRM BEFORE LAUNCH:
 * - The live site also shows 888-696-0939 and info@godms.com in some footer
 *   instances. This rebuild consistently uses the staffed Contact page sales
 *   line (888-696-1049) and sales@godms.com until the discrepancy is resolved.
 * - Address fields remain placeholders.
 * - Confirm company.legalName against the registered business entity.
 */
export const siteConfig = {
  company: {
    fullName: 'Dolphin Merchant Services',
    shortName: 'Dolphin',
    legalName: 'Dolphin Merchant Services LLC',
    posName: 'Dolphin POS',
    logoUrl: 'https://godms.com/wp-content/uploads/2025/10/DMS-Logo-nobg-scaled-1-scaled.png',
  },
  phone: {
    label: 'Call Us',
    display: '888-696-1049',
    href: 'tel:+18886961049',
    hours: 'Mon-Fri, 8am-4pm CST',
  },
  email: 'sales@godms.com',
  emailResponseTime: 'Reply within 1 business hour',
  social: {
    linkedin: 'https://www.linkedin.com/company/dolphin-merchant-services-www-godms-com/',
    instagram: 'https://www.instagram.com/dolphinmerchantservices/',
    facebook: 'https://www.facebook.com/godms2015',
  },
  signInUrl: '/sign-in',
  address: {
    street: '100 Placeholder Plaza, Suite 200',
    city: 'Sample City',
    state: 'NY',
    postalCode: '10000',
    country: 'United States',
  },
}
