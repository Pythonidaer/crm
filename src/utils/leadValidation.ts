import type {
  Lead,
  LeadStatus,
  LeadPriority,
  MatchConfidence,
  LeadFitTier,
  EnrichmentStatus,
  EmailEnrichmentStatus,
} from '../types/lead'
import { resolveDisplayName, scoreLeadFit } from './leadScoring.js'

const VALID_STATUSES: LeadStatus[] = [
  'not_contacted',
  'called',
  'interested',
  'follow_up',
  'proposal_sent',
  'won',
  'lost',
]
const VALID_PRIORITIES: LeadPriority[] = ['low', 'medium', 'high']
const VALID_MATCH_CONFIDENCE: MatchConfidence[] = ['high', 'medium', 'low']
const VALID_LEAD_FIT_TIERS: LeadFitTier[] = ['strong', 'medium', 'weak', 'disqualified']
const VALID_ENRICHMENT_STATUS: EnrichmentStatus[] = [
  'matched',
  'review_needed',
  'not_found',
  'error',
  'not_enriched',
]
const VALID_EMAIL_ENRICHMENT_STATUS: EmailEnrichmentStatus[] = [
  'found',
  'review_needed',
  'not_found',
  'skipped_no_website',
  'error',
]

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function normalizeOptionalString(value: unknown): string | null {
  if (value == null) return null
  const trimmed = String(value).trim()
  return trimmed || null
}

export function applyDefaults(raw: Partial<Lead>): Lead {
  const now = new Date().toISOString()
  const companyName = raw.companyName ?? ''
  const googleDisplayName = normalizeOptionalString(raw.googleDisplayName)
  const phoneNumber =
    normalizeOptionalString(raw.phoneNumber) ??
    normalizeOptionalString((raw as { phone?: string }).phone)
  const website = normalizeOptionalString(raw.website)

  const base = {
    id: raw.id ?? generateId(),
    companyName,
    googleDisplayName,
    displayName: raw.displayName ?? resolveDisplayName(googleDisplayName, companyName),
    address: raw.address ?? '',
    googleFormattedAddress: normalizeOptionalString(raw.googleFormattedAddress),
    city: raw.city ?? '',
    state: raw.state ?? 'MA',
    sector: raw.sector ?? '',
    phoneNumber,
    internationalPhoneNumber: normalizeOptionalString(raw.internationalPhoneNumber),
    website,
    email: normalizeOptionalString(raw.email),
    emailsFound: Array.isArray(raw.emailsFound)
      ? raw.emailsFound.map((e) => String(e).trim()).filter(Boolean)
      : [],
    emailSourceUrl: normalizeOptionalString(raw.emailSourceUrl),
    emailEnrichmentStatus: VALID_EMAIL_ENRICHMENT_STATUS.includes(
      raw.emailEnrichmentStatus as EmailEnrichmentStatus,
    )
      ? (raw.emailEnrichmentStatus as EmailEnrichmentStatus)
      : null,
    emailEnrichmentNotes: normalizeOptionalString(raw.emailEnrichmentNotes),
    emailEnrichedAt: normalizeOptionalString(raw.emailEnrichedAt),
    googlePlaceId: normalizeOptionalString(raw.googlePlaceId),
    googleMapsUri: normalizeOptionalString(raw.googleMapsUri),
    businessStatus: normalizeOptionalString(raw.businessStatus),
    matchConfidence: VALID_MATCH_CONFIDENCE.includes(raw.matchConfidence as MatchConfidence)
      ? (raw.matchConfidence as MatchConfidence)
      : null,
    matchScore: typeof raw.matchScore === 'number' ? raw.matchScore : null,
    enrichmentStatus: VALID_ENRICHMENT_STATUS.includes(raw.enrichmentStatus as EnrichmentStatus)
      ? (raw.enrichmentStatus as EnrichmentStatus)
      : null,
    enrichmentNotes: normalizeOptionalString(raw.enrichmentNotes),
    sourceUrl: raw.sourceUrl ?? '',
    dataSource: raw.dataSource ?? 'manual',
    lastEnrichedAt: normalizeOptionalString(raw.lastEnrichedAt),
    status: VALID_STATUSES.includes(raw.status as LeadStatus)
      ? (raw.status as LeadStatus)
      : 'not_contacted',
    priority: VALID_PRIORITIES.includes(raw.priority as LeadPriority)
      ? (raw.priority as LeadPriority)
      : 'medium',
    contactName: raw.contactName ?? '',
    contactRole: raw.contactRole ?? '',
    contactEmail: raw.contactEmail ?? '',
    lastContactedAt: raw.lastContactedAt ?? '',
    nextFollowUpAt: raw.nextFollowUpAt ?? '',
    notes: raw.notes ?? '',
    qualification: {
      hasWebsite: raw.qualification?.hasWebsite ?? Boolean(website),
      websiteNeedsWork: raw.qualification?.websiteNeedsWork ?? false,
      accessibilityOpportunity:
        raw.qualification?.accessibilityOpportunity ?? false,
      seoOpportunity: raw.qualification?.seoOpportunity ?? false,
      aeoOpportunity: raw.qualification?.aeoOpportunity ?? false,
      decisionMakerFound: raw.qualification?.decisionMakerFound ?? false,
    },
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  }

  const fit =
    typeof raw.leadFitScore === 'number' && VALID_LEAD_FIT_TIERS.includes(raw.leadFitTier as LeadFitTier)
      ? {
          leadFitScore: raw.leadFitScore,
          leadFitTier: raw.leadFitTier as LeadFitTier,
          disqualificationReason: normalizeOptionalString(raw.disqualificationReason),
        }
      : scoreLeadFit(base)

  return {
    ...base,
    leadFitScore: fit.leadFitScore,
    leadFitTier: fit.leadFitTier,
    disqualificationReason: fit.disqualificationReason,
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateLead(raw: Partial<Lead>): ValidationResult {
  const errors: string[] = []
  if (!raw.companyName?.trim()) errors.push('companyName is required')
  if (!raw.city?.trim()) errors.push('city is required')
  if (raw.status && !VALID_STATUSES.includes(raw.status))
    errors.push(`status "${raw.status}" is not valid`)
  if (raw.priority && !VALID_PRIORITIES.includes(raw.priority))
    errors.push(`priority "${raw.priority}" is not valid`)
  return { valid: errors.length === 0, errors }
}
