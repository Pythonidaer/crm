import type { LeadRow } from './leadRow'

/** Insert/update shape for seed scripts (Drizzle-free). */
export type NewLeadRow = LeadRow & { seedKey: string }

import type {
  EmailEnrichmentStatus,
  EnrichmentStatus,
  Lead,
  LeadFitTier,
  LeadPriority,
  LeadStatus,
  MatchConfidence,
} from '../../../src/types/lead'

function toIsoOrEmpty(value: string | null | undefined): string {
  if (!value) return ''
  return value
}

function toIsoOrNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
}

function normalizeEmailsFound(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => String(entry).trim()).filter(Boolean)
}

export function leadToRow(lead: Lead, seedKey: string): NewLeadRow {
  return {
    id: lead.id,
    seedKey,
    companyName: lead.companyName,
    displayName: lead.displayName,
    address: lead.address,
    city: lead.city,
    state: lead.state,
    sector: lead.sector,
    phoneNumber: lead.phoneNumber,
    internationalPhoneNumber: lead.internationalPhoneNumber,
    website: lead.website,
    email: lead.email,
    sourceUrl: lead.sourceUrl,
    dataSource: lead.dataSource,
    googlePlaceId: lead.googlePlaceId,
    googleDisplayName: lead.googleDisplayName,
    googleFormattedAddress: lead.googleFormattedAddress,
    googleMapsUri: lead.googleMapsUri,
    businessStatus: lead.businessStatus,
    matchConfidence: lead.matchConfidence,
    matchScore: lead.matchScore,
    enrichmentStatus: lead.enrichmentStatus,
    enrichmentNotes: lead.enrichmentNotes,
    lastEnrichedAt: lead.lastEnrichedAt,
    emailsFound: lead.emailsFound ?? [],
    emailSourceUrl: lead.emailSourceUrl,
    emailEnrichmentStatus: lead.emailEnrichmentStatus,
    emailEnrichmentNotes: lead.emailEnrichmentNotes,
    emailEnrichedAt: lead.emailEnrichedAt,
    status: lead.status,
    priority: lead.priority,
    nextFollowUpAt: toIsoOrNull(lead.nextFollowUpAt),
    lastContactedAt: toIsoOrNull(lead.lastContactedAt),
    contactName: lead.contactName,
    contactRole: lead.contactRole,
    contactEmail: lead.contactEmail,
    notes: lead.notes,
    hasWebsite: lead.qualification.hasWebsite,
    websiteNeedsWork: lead.qualification.websiteNeedsWork,
    accessibilityOpportunity: lead.qualification.accessibilityOpportunity,
    seoOpportunity: lead.qualification.seoOpportunity,
    aeoOpportunity: lead.qualification.aeoOpportunity,
    decisionMakerFound: lead.qualification.decisionMakerFound,
    leadFitScore: lead.leadFitScore,
    leadFitTier: lead.leadFitTier,
    disqualificationReason: lead.disqualificationReason,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  }
}

/** Map a DB row to the frontend Lead shape without re-scoring or validation side effects. */
export function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    companyName: row.companyName,
    displayName: row.displayName || row.companyName,
    googleDisplayName: row.googleDisplayName,
    address: row.address ?? '',
    googleFormattedAddress: row.googleFormattedAddress,
    city: row.city,
    state: row.state ?? 'MA',
    sector: row.sector ?? '',
    phoneNumber: row.phoneNumber,
    internationalPhoneNumber: row.internationalPhoneNumber,
    website: row.website,
    email: row.email,
    emailsFound: normalizeEmailsFound(row.emailsFound),
    emailSourceUrl: row.emailSourceUrl,
    emailEnrichmentStatus: row.emailEnrichmentStatus as EmailEnrichmentStatus | null,
    emailEnrichmentNotes: row.emailEnrichmentNotes,
    emailEnrichedAt: row.emailEnrichedAt,
    googlePlaceId: row.googlePlaceId,
    googleMapsUri: row.googleMapsUri,
    businessStatus: row.businessStatus,
    matchConfidence: row.matchConfidence as MatchConfidence | null,
    matchScore: row.matchScore,
    enrichmentStatus: row.enrichmentStatus as EnrichmentStatus | null,
    enrichmentNotes: row.enrichmentNotes,
    sourceUrl: row.sourceUrl ?? '',
    dataSource: row.dataSource ?? 'manual',
    lastEnrichedAt: row.lastEnrichedAt,
    status: row.status as LeadStatus,
    priority: row.priority as LeadPriority,
    contactName: row.contactName ?? '',
    contactRole: row.contactRole ?? '',
    contactEmail: row.contactEmail ?? '',
    lastContactedAt: toIsoOrEmpty(row.lastContactedAt),
    nextFollowUpAt: toIsoOrEmpty(row.nextFollowUpAt),
    notes: row.notes ?? '',
    qualification: {
      hasWebsite: row.hasWebsite,
      websiteNeedsWork: row.websiteNeedsWork,
      accessibilityOpportunity: row.accessibilityOpportunity,
      seoOpportunity: row.seoOpportunity,
      aeoOpportunity: row.aeoOpportunity,
      decisionMakerFound: row.decisionMakerFound,
    },
    leadFitScore: row.leadFitScore,
    leadFitTier: row.leadFitTier as LeadFitTier,
    disqualificationReason: row.disqualificationReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export const PATCHABLE_LEAD_FIELDS = [
  'status',
  'priority',
  'nextFollowUpAt',
  'lastContactedAt',
  'contactName',
  'contactRole',
  'contactEmail',
  'notes',
  'hasWebsite',
  'websiteNeedsWork',
  'accessibilityOpportunity',
  'seoOpportunity',
  'aeoOpportunity',
  'decisionMakerFound',
] as const

export type PatchableLeadField = (typeof PATCHABLE_LEAD_FIELDS)[number]

export interface LeadPatchInput {
  status?: Lead['status']
  priority?: Lead['priority']
  nextFollowUpAt?: string
  lastContactedAt?: string
  contactName?: string
  contactRole?: string
  contactEmail?: string
  notes?: string
  hasWebsite?: boolean
  websiteNeedsWork?: boolean
  accessibilityOpportunity?: boolean
  seoOpportunity?: boolean
  aeoOpportunity?: boolean
  decisionMakerFound?: boolean
}

export function patchInputToRow(patch: LeadPatchInput): Partial<NewLeadRow> {
  const row: Partial<NewLeadRow> = {
    updatedAt: new Date().toISOString(),
  }

  if (patch.status !== undefined) row.status = patch.status
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.nextFollowUpAt !== undefined) row.nextFollowUpAt = toIsoOrNull(patch.nextFollowUpAt)
  if (patch.lastContactedAt !== undefined) row.lastContactedAt = toIsoOrNull(patch.lastContactedAt)
  if (patch.contactName !== undefined) row.contactName = patch.contactName
  if (patch.contactRole !== undefined) row.contactRole = patch.contactRole
  if (patch.contactEmail !== undefined) row.contactEmail = patch.contactEmail
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.hasWebsite !== undefined) row.hasWebsite = patch.hasWebsite
  if (patch.websiteNeedsWork !== undefined) row.websiteNeedsWork = patch.websiteNeedsWork
  if (patch.accessibilityOpportunity !== undefined) {
    row.accessibilityOpportunity = patch.accessibilityOpportunity
  }
  if (patch.seoOpportunity !== undefined) row.seoOpportunity = patch.seoOpportunity
  if (patch.aeoOpportunity !== undefined) row.aeoOpportunity = patch.aeoOpportunity
  if (patch.decisionMakerFound !== undefined) row.decisionMakerFound = patch.decisionMakerFound

  return row
}
