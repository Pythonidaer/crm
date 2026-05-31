export type LeadStatus =
  | 'not_contacted'
  | 'called'
  | 'interested'
  | 'follow_up'
  | 'proposal_sent'
  | 'won'
  | 'lost'

export type LeadPriority = 'low' | 'medium' | 'high'

export type MatchConfidence = 'high' | 'medium' | 'low'

export type LeadFitTier = 'strong' | 'medium' | 'weak' | 'disqualified'

export type EnrichmentStatus =
  | 'matched'
  | 'review_needed'
  | 'not_found'
  | 'error'
  | 'not_enriched'

export type EmailEnrichmentStatus =
  | 'found'
  | 'review_needed'
  | 'not_found'
  | 'skipped_no_website'
  | 'error'

export interface LeadQualification {
  hasWebsite: boolean
  websiteNeedsWork: boolean
  accessibilityOpportunity: boolean
  seoOpportunity: boolean
  aeoOpportunity: boolean
  decisionMakerFound: boolean
}

export interface Lead {
  id: string
  companyName: string
  displayName: string
  googleDisplayName: string | null
  address: string
  googleFormattedAddress: string | null
  city: string
  state: string
  sector: string
  phoneNumber: string | null
  internationalPhoneNumber: string | null
  website: string | null
  email: string | null
  emailsFound: string[]
  emailSourceUrl: string | null
  emailEnrichmentStatus: EmailEnrichmentStatus | null
  emailEnrichmentNotes: string | null
  emailEnrichedAt: string | null
  googlePlaceId: string | null
  googleMapsUri: string | null
  businessStatus: string | null
  matchConfidence: MatchConfidence | null
  matchScore: number | null
  enrichmentStatus: EnrichmentStatus | null
  enrichmentNotes: string | null
  leadFitScore: number
  leadFitTier: LeadFitTier
  disqualificationReason: string | null
  sourceUrl: string
  dataSource: string
  lastEnrichedAt: string | null
  createdAt: string
  updatedAt: string
  status: LeadStatus
  priority: LeadPriority
  contactName: string
  contactRole: string
  contactEmail: string
  lastContactedAt: string
  nextFollowUpAt: string
  notes: string
  qualification: LeadQualification
}

export type LeadSortKey =
  | 'companyName'
  | 'displayName'
  | 'city'
  | 'sector'
  | 'status'
  | 'leadFitScore'
  | 'nextFollowUpAt'
  | 'lastContactedAt'

export interface LeadFilters {
  search: string
  city: string
  sector: string
  status: string
  priority: string
  matchConfidence: string
  leadFitTier: string
  hasWebsite: string
  hasPhone: string
  hasEmail: string
  emailEnrichmentStatus: string
  enrichmentStatus: string
}
