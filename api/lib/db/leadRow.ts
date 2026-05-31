/** Plain row shape returned from SQL (camelCase aliases). No Drizzle dependency. */
export interface LeadRow {
  id: string
  seedKey: string
  companyName: string
  displayName: string
  address: string
  city: string
  state: string
  sector: string
  phoneNumber: string | null
  internationalPhoneNumber: string | null
  website: string | null
  email: string | null
  sourceUrl: string
  dataSource: string
  googlePlaceId: string | null
  googleDisplayName: string | null
  googleFormattedAddress: string | null
  googleMapsUri: string | null
  businessStatus: string | null
  matchConfidence: string | null
  matchScore: number | null
  enrichmentStatus: string | null
  enrichmentNotes: string | null
  lastEnrichedAt: string | null
  emailsFound: string[]
  emailSourceUrl: string | null
  emailEnrichmentStatus: string | null
  emailEnrichmentNotes: string | null
  emailEnrichedAt: string | null
  status: string
  priority: string
  nextFollowUpAt: string | null
  lastContactedAt: string | null
  contactName: string
  contactRole: string
  contactEmail: string
  notes: string
  hasWebsite: boolean
  websiteNeedsWork: boolean
  accessibilityOpportunity: boolean
  seoOpportunity: boolean
  aeoOpportunity: boolean
  decisionMakerFound: boolean
  leadFitScore: number
  leadFitTier: string
  disqualificationReason: string | null
  createdAt: string
  updatedAt: string
}

export const LEAD_SELECT_SQL = `
  id,
  seed_key AS "seedKey",
  company_name AS "companyName",
  display_name AS "displayName",
  address,
  city,
  state,
  sector,
  phone_number AS "phoneNumber",
  international_phone_number AS "internationalPhoneNumber",
  website,
  email,
  source_url AS "sourceUrl",
  data_source AS "dataSource",
  google_place_id AS "googlePlaceId",
  google_display_name AS "googleDisplayName",
  google_formatted_address AS "googleFormattedAddress",
  google_maps_uri AS "googleMapsUri",
  business_status AS "businessStatus",
  match_confidence AS "matchConfidence",
  match_score AS "matchScore",
  enrichment_status AS "enrichmentStatus",
  enrichment_notes AS "enrichmentNotes",
  last_enriched_at AS "lastEnrichedAt",
  emails_found AS "emailsFound",
  email_source_url AS "emailSourceUrl",
  email_enrichment_status AS "emailEnrichmentStatus",
  email_enrichment_notes AS "emailEnrichmentNotes",
  email_enriched_at AS "emailEnrichedAt",
  status,
  priority,
  next_follow_up_at AS "nextFollowUpAt",
  last_contacted_at AS "lastContactedAt",
  contact_name AS "contactName",
  contact_role AS "contactRole",
  contact_email AS "contactEmail",
  notes,
  has_website AS "hasWebsite",
  website_needs_work AS "websiteNeedsWork",
  accessibility_opportunity AS "accessibilityOpportunity",
  seo_opportunity AS "seoOpportunity",
  aeo_opportunity AS "aeoOpportunity",
  decision_maker_found AS "decisionMakerFound",
  lead_fit_score AS "leadFitScore",
  lead_fit_tier AS "leadFitTier",
  disqualification_reason AS "disqualificationReason",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`

export function normalizeLeadRow(raw: Record<string, unknown>): LeadRow {
  const emailsFound = raw['emailsFound']
  return {
    ...(raw as unknown as LeadRow),
    emailsFound: Array.isArray(emailsFound)
      ? emailsFound.map((e) => String(e).trim()).filter(Boolean)
      : [],
  }
}
