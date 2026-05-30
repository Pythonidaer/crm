/** @typedef {'strong' | 'medium' | 'weak' | 'disqualified'} LeadFitTier */

export const CHAIN_BRANDS = [
  { pattern: 'dunkin', label: 'Dunkin', national: true },
  { pattern: 'starbucks', label: 'Starbucks', national: true },
  { pattern: 'cvs', label: 'CVS', national: true },
  { pattern: 'walgreens', label: 'Walgreens', national: true },
  { pattern: "mcdonald", label: "McDonald's", national: true },
  { pattern: 'target', label: 'Target', national: true },
  { pattern: 'walmart', label: 'Walmart', national: true },
  { pattern: 'bank of america', label: 'Bank of America', national: true },
  { pattern: 'santander', label: 'Santander', national: true },
  { pattern: 'citizens bank', label: 'Citizens Bank', national: true },
  { pattern: 'chase', label: 'Chase', national: true },
  { pattern: 'verizon', label: 'Verizon', national: true },
  { pattern: 'at&t', label: 'AT&T', national: true },
  { pattern: 'att ', label: 'AT&T', national: true },
  { pattern: 'subway', label: 'Subway', national: true },
  { pattern: 'domino', label: "Domino's", national: true },
  { pattern: 'pizza hut', label: 'Pizza Hut', national: true },
  { pattern: 'kfc', label: 'KFC', national: true },
  { pattern: 'burger king', label: 'Burger King', national: true },
  { pattern: 'taco bell', label: 'Taco Bell', national: true },
  { pattern: '7-eleven', label: '7-Eleven', national: true },
  { pattern: 'dollar tree', label: 'Dollar Tree', national: true },
  { pattern: 'dollar general', label: 'Dollar General', national: true },
  { pattern: 'home depot', label: 'Home Depot', national: true },
  { pattern: 'lowes', label: "Lowe's", national: true },
  { pattern: 'best buy', label: 'Best Buy', national: true },
]

const FRANCHISE_PATTERNS = [
  'franchise',
  '#',
  'store #',
  'location #',
]

const SERVICE_SECTOR_PATTERNS = [
  'professional',
  'construction',
  'retail trade',
  'accommodation and food',
  'other services',
]

/**
 * @param {string | null | undefined} value
 */
export function normalizeName(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\w\s&'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * @param {string} companyName
 * @param {string | null | undefined} googleDisplayName
 */
export function detectChainBrand(companyName, googleDisplayName) {
  const haystack = normalizeName(`${companyName} ${googleDisplayName ?? ''}`)
  for (const brand of CHAIN_BRANDS) {
    if (haystack.includes(brand.pattern)) return brand
  }
  return null
}

/**
 * @param {string} companyName
 * @param {string | null | undefined} googleDisplayName
 */
export function detectFranchise(companyName, googleDisplayName) {
  const haystack = normalizeName(`${companyName} ${googleDisplayName ?? ''}`)
  return FRANCHISE_PATTERNS.some((p) => haystack.includes(p))
}

/**
 * @param {string | null | undefined} sector
 */
export function isGovernmentSector(sector) {
  return normalizeName(sector).includes('public administration')
}

/**
 * @param {string | null | undefined} sector
 */
export function isStrongServiceSector(sector) {
  const normalized = normalizeName(sector)
  return SERVICE_SECTOR_PATTERNS.some((p) => normalized.includes(p))
}

/**
 * @param {string} companyName
 * @param {string | null | undefined} googleDisplayName
 */
export function looksIndependentLocal(companyName, googleDisplayName, chainBrand, franchise) {
  if (chainBrand || franchise) return false
  const name = normalizeName(googleDisplayName || companyName)
  if (!name) return false
  if (name.includes('holdings') || name.includes('enterprises')) return false
  return true
}

/**
 * @param {Record<string, unknown>} lead
 * @returns {{ leadFitScore: number, leadFitTier: LeadFitTier, disqualificationReason: string | null }}
 */
export function scoreLeadFit(lead) {
  let score = 0
  let disqualificationReason = null

  const website = lead.website
  const phoneNumber = lead.phoneNumber
  const internationalPhoneNumber = lead.internationalPhoneNumber
  const matchConfidence = lead.matchConfidence
  const enrichmentStatus = lead.enrichmentStatus
  const sector = lead.sector
  const companyName = String(lead.companyName ?? '')
  const googleDisplayName = lead.googleDisplayName

  if (!website) score += 30
  else score += 10

  if (phoneNumber || internationalPhoneNumber) score += 15

  if (matchConfidence === 'high') score += 20
  else if (matchConfidence === 'medium') score += 10

  const chainBrand = detectChainBrand(companyName, googleDisplayName)
  const franchise = detectFranchise(companyName, googleDisplayName)

  if (looksIndependentLocal(companyName, googleDisplayName, chainBrand, franchise)) {
    score += 15
  }

  if (isStrongServiceSector(sector)) score += 10

  if (chainBrand) {
    score -= chainBrand.national ? 50 : 40
    disqualificationReason = chainBrand.national
      ? `Large national brand detected: ${chainBrand.label}`
      : `Chain/franchise detected: ${chainBrand.label}`
  } else if (franchise) {
    score -= 40
    disqualificationReason = 'Chain/franchise detected'
  }

  if (isGovernmentSector(sector)) {
    score -= 30
    if (!disqualificationReason) {
      disqualificationReason = 'Government/public administration'
    }
  }

  if (
    enrichmentStatus === 'not_found' ||
    enrichmentStatus === 'error' ||
    enrichmentStatus === 'not_enriched'
  ) {
    score -= 20
  }

  score = Math.max(0, Math.min(100, score))

  /** @type {LeadFitTier} */
  let leadFitTier = 'weak'
  if (disqualificationReason) {
    leadFitTier = 'disqualified'
  } else if (score >= 70) {
    leadFitTier = 'strong'
  } else if (score >= 45) {
    leadFitTier = 'medium'
  }

  return { leadFitScore: score, leadFitTier, disqualificationReason }
}

/**
 * @param {string | null | undefined} googleDisplayName
 * @param {string} companyName
 */
export function resolveDisplayName(googleDisplayName, companyName) {
  const google = String(googleDisplayName ?? '').trim()
  const company = String(companyName ?? '').trim()
  return google || company
}
