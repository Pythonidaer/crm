import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import type { Lead } from '../src/types/lead'

export const config = {
  maxDuration: 60,
}

const SELECT_LEADS = `
  SELECT
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
  FROM leads
`

function getSql() {
  const url = process.env['DATABASE_URL']
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

function toIsoOrEmpty(value: string | Date | null | undefined): string {
  if (value == null) return ''
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }
  const trimmed = String(value).trim()
  if (!trimmed) return ''
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

function rowToLead(raw: Record<string, unknown>): Lead {
  const emailsFound = raw['emailsFound']
  return {
    id: String(raw['id'] ?? ''),
    companyName: String(raw['companyName'] ?? ''),
    displayName: String(raw['displayName'] ?? raw['companyName'] ?? ''),
    googleDisplayName: (raw['googleDisplayName'] as string | null) ?? null,
    address: String(raw['address'] ?? ''),
    googleFormattedAddress: (raw['googleFormattedAddress'] as string | null) ?? null,
    city: String(raw['city'] ?? ''),
    state: String(raw['state'] ?? 'MA'),
    sector: String(raw['sector'] ?? ''),
    phoneNumber: (raw['phoneNumber'] as string | null) ?? null,
    internationalPhoneNumber: (raw['internationalPhoneNumber'] as string | null) ?? null,
    website: (raw['website'] as string | null) ?? null,
    email: (raw['email'] as string | null) ?? null,
    emailsFound: Array.isArray(emailsFound)
      ? emailsFound.map((e) => String(e).trim()).filter(Boolean)
      : [],
    emailSourceUrl: (raw['emailSourceUrl'] as string | null) ?? null,
    emailEnrichmentStatus: (raw['emailEnrichmentStatus'] as Lead['emailEnrichmentStatus']) ?? null,
    emailEnrichmentNotes: (raw['emailEnrichmentNotes'] as string | null) ?? null,
    emailEnrichedAt: toIsoOrEmpty(raw['emailEnrichedAt'] as string | Date | null | undefined) || null,
    googlePlaceId: (raw['googlePlaceId'] as string | null) ?? null,
    googleMapsUri: (raw['googleMapsUri'] as string | null) ?? null,
    businessStatus: (raw['businessStatus'] as string | null) ?? null,
    matchConfidence: (raw['matchConfidence'] as Lead['matchConfidence']) ?? null,
    matchScore: typeof raw['matchScore'] === 'number' ? raw['matchScore'] : null,
    enrichmentStatus: (raw['enrichmentStatus'] as Lead['enrichmentStatus']) ?? null,
    enrichmentNotes: (raw['enrichmentNotes'] as string | null) ?? null,
    sourceUrl: String(raw['sourceUrl'] ?? ''),
    dataSource: String(raw['dataSource'] ?? 'manual'),
    lastEnrichedAt: toIsoOrEmpty(raw['lastEnrichedAt'] as string | Date | null | undefined) || null,
    status: (raw['status'] as Lead['status']) ?? 'not_contacted',
    priority: (raw['priority'] as Lead['priority']) ?? 'medium',
    contactName: String(raw['contactName'] ?? ''),
    contactRole: String(raw['contactRole'] ?? ''),
    contactEmail: String(raw['contactEmail'] ?? ''),
    lastContactedAt: toIsoOrEmpty(raw['lastContactedAt'] as string | Date | null | undefined),
    nextFollowUpAt: toIsoOrEmpty(raw['nextFollowUpAt'] as string | Date | null | undefined),
    notes: String(raw['notes'] ?? ''),
    qualification: {
      hasWebsite: Boolean(raw['hasWebsite']),
      websiteNeedsWork: Boolean(raw['websiteNeedsWork']),
      accessibilityOpportunity: Boolean(raw['accessibilityOpportunity']),
      seoOpportunity: Boolean(raw['seoOpportunity']),
      aeoOpportunity: Boolean(raw['aeoOpportunity']),
      decisionMakerFound: Boolean(raw['decisionMakerFound']),
    },
    leadFitScore: Number(raw['leadFitScore'] ?? 0),
    leadFitTier: (raw['leadFitTier'] as Lead['leadFitTier']) ?? 'medium',
    disqualificationReason: (raw['disqualificationReason'] as string | null) ?? null,
    createdAt: toIsoOrEmpty(raw['createdAt'] as string | Date | null | undefined),
    updatedAt: toIsoOrEmpty(raw['updatedAt'] as string | Date | null | undefined),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const sql = getSql()
    const page = Number(Array.isArray(req.query.page) ? req.query.page[0] : req.query.page) || 1
    const pageSize =
      Number(Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize) || 500
    const safeSize = Math.min(Math.max(pageSize, 1), 500)
    const offset = (Math.max(page, 1) - 1) * safeSize

    const countRows = await sql.query('SELECT count(*)::int AS count FROM leads')
    const total = Number((countRows as { count: number }[])[0]?.count ?? 0)

    const rows = await sql.query(
      `${SELECT_LEADS} ORDER BY display_name ASC, company_name ASC LIMIT $1 OFFSET $2`,
      [safeSize, offset],
    )

    const leads = (rows as Record<string, unknown>[]).map(rowToLead)
    const hasMore = page * safeSize < total

    res.status(200).json({ leads, total, page, pageSize: safeSize, hasMore })
  } catch (err) {
    console.error('[api/leads]', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('DATABASE_URL')) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
