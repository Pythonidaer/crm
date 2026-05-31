import type { LeadRow, NewLeadRow } from './schema'
import type { Lead } from '../types/lead'
import { applyDefaults } from '../utils/leadValidation'

function toIsoOrEmpty(value: string | null | undefined): string {
  if (!value) return ''
  return value
}

function toIsoOrNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed || null
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

export function rowToLead(row: LeadRow): Lead {
  return applyDefaults({
    id: row.id,
    companyName: row.companyName,
    displayName: row.displayName,
    address: row.address,
    city: row.city,
    state: row.state,
    sector: row.sector,
    phoneNumber: row.phoneNumber,
    internationalPhoneNumber: row.internationalPhoneNumber,
    website: row.website,
    email: row.email,
    sourceUrl: row.sourceUrl,
    dataSource: row.dataSource,
    googlePlaceId: row.googlePlaceId,
    googleDisplayName: row.googleDisplayName,
    googleFormattedAddress: row.googleFormattedAddress,
    googleMapsUri: row.googleMapsUri,
    businessStatus: row.businessStatus,
    matchConfidence: row.matchConfidence as Lead['matchConfidence'],
    matchScore: row.matchScore,
    enrichmentStatus: row.enrichmentStatus as Lead['enrichmentStatus'],
    enrichmentNotes: row.enrichmentNotes,
    lastEnrichedAt: row.lastEnrichedAt,
    emailsFound: row.emailsFound ?? [],
    emailSourceUrl: row.emailSourceUrl,
    emailEnrichmentStatus: row.emailEnrichmentStatus as Lead['emailEnrichmentStatus'],
    emailEnrichmentNotes: row.emailEnrichmentNotes,
    emailEnrichedAt: row.emailEnrichedAt,
    status: row.status as Lead['status'],
    priority: row.priority as Lead['priority'],
    nextFollowUpAt: toIsoOrEmpty(row.nextFollowUpAt),
    lastContactedAt: toIsoOrEmpty(row.lastContactedAt),
    contactName: row.contactName,
    contactRole: row.contactRole,
    contactEmail: row.contactEmail,
    notes: row.notes,
    qualification: {
      hasWebsite: row.hasWebsite,
      websiteNeedsWork: row.websiteNeedsWork,
      accessibilityOpportunity: row.accessibilityOpportunity,
      seoOpportunity: row.seoOpportunity,
      aeoOpportunity: row.aeoOpportunity,
      decisionMakerFound: row.decisionMakerFound,
    },
    leadFitScore: row.leadFitScore,
    leadFitTier: row.leadFitTier as Lead['leadFitTier'],
    disqualificationReason: row.disqualificationReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
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
