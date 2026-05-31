import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'
import type { Lead } from '../../src/types/lead'

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
    emailEnrichedAt: (raw['emailEnrichedAt'] as string | null) ?? null,
    googlePlaceId: (raw['googlePlaceId'] as string | null) ?? null,
    googleMapsUri: (raw['googleMapsUri'] as string | null) ?? null,
    businessStatus: (raw['businessStatus'] as string | null) ?? null,
    matchConfidence: (raw['matchConfidence'] as Lead['matchConfidence']) ?? null,
    matchScore: typeof raw['matchScore'] === 'number' ? raw['matchScore'] : null,
    enrichmentStatus: (raw['enrichmentStatus'] as Lead['enrichmentStatus']) ?? null,
    enrichmentNotes: (raw['enrichmentNotes'] as string | null) ?? null,
    sourceUrl: String(raw['sourceUrl'] ?? ''),
    dataSource: String(raw['dataSource'] ?? 'manual'),
    lastEnrichedAt: (raw['lastEnrichedAt'] as string | null) ?? null,
    status: (raw['status'] as Lead['status']) ?? 'not_contacted',
    priority: (raw['priority'] as Lead['priority']) ?? 'medium',
    contactName: String(raw['contactName'] ?? ''),
    contactRole: String(raw['contactRole'] ?? ''),
    contactEmail: String(raw['contactEmail'] ?? ''),
    lastContactedAt: String(raw['lastContactedAt'] ?? ''),
    nextFollowUpAt: String(raw['nextFollowUpAt'] ?? ''),
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
    createdAt: String(raw['createdAt'] ?? ''),
    updatedAt: String(raw['updatedAt'] ?? ''),
  }
}

function leadIdFromRequest(req: VercelRequest): string {
  const raw = req.query['id']
  const value = Array.isArray(raw) ? raw[0] : raw
  return decodeURIComponent(value ?? '')
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const id = leadIdFromRequest(req)
  if (!id) {
    res.status(400).json({ error: 'Lead id is required' })
    return
  }

  try {
    const sql = getSql()

    if (req.method === 'GET') {
      const rows = await sql.query(`${SELECT_LEADS} WHERE id = $1 LIMIT 1`, [id])
      const row = (rows as Record<string, unknown>[])[0]
      if (!row) {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      res.status(200).json(rowToLead(row))
      return
    }

    if (req.method === 'PATCH') {
      const body = (req.body ?? {}) as Record<string, unknown>
      const rows = await sql.query(`${SELECT_LEADS} WHERE id = $1 LIMIT 1`, [id])
      const existing = (rows as Record<string, unknown>[])[0]
      if (!existing) {
        res.status(404).json({ error: 'Lead not found' })
        return
      }

      const current = rowToLead(existing)
      const updatedAt = new Date().toISOString()

      await sql.query(
        `UPDATE leads SET
          status = $2,
          priority = $3,
          next_follow_up_at = $4,
          last_contacted_at = $5,
          contact_name = $6,
          contact_role = $7,
          contact_email = $8,
          notes = $9,
          has_website = $10,
          website_needs_work = $11,
          accessibility_opportunity = $12,
          seo_opportunity = $13,
          aeo_opportunity = $14,
          decision_maker_found = $15,
          updated_at = $16
        WHERE id = $1`,
        [
          id,
          typeof body.status === 'string' ? body.status : current.status,
          typeof body.priority === 'string' ? body.priority : current.priority,
          typeof body.nextFollowUpAt === 'string' ? body.nextFollowUpAt || null : current.nextFollowUpAt || null,
          typeof body.lastContactedAt === 'string' ? body.lastContactedAt || null : current.lastContactedAt || null,
          typeof body.contactName === 'string' ? body.contactName : current.contactName,
          typeof body.contactRole === 'string' ? body.contactRole : current.contactRole,
          typeof body.contactEmail === 'string' ? body.contactEmail : current.contactEmail,
          typeof body.notes === 'string' ? body.notes : current.notes,
          typeof body.hasWebsite === 'boolean' ? body.hasWebsite : current.qualification.hasWebsite,
          typeof body.websiteNeedsWork === 'boolean' ? body.websiteNeedsWork : current.qualification.websiteNeedsWork,
          typeof body.accessibilityOpportunity === 'boolean'
            ? body.accessibilityOpportunity
            : current.qualification.accessibilityOpportunity,
          typeof body.seoOpportunity === 'boolean' ? body.seoOpportunity : current.qualification.seoOpportunity,
          typeof body.aeoOpportunity === 'boolean' ? body.aeoOpportunity : current.qualification.aeoOpportunity,
          typeof body.decisionMakerFound === 'boolean'
            ? body.decisionMakerFound
            : current.qualification.decisionMakerFound,
          updatedAt,
        ],
      )

      const savedRows = await sql.query(`${SELECT_LEADS} WHERE id = $1 LIMIT 1`, [id])
      const saved = (savedRows as Record<string, unknown>[])[0]
      res.status(200).json(rowToLead(saved))
      return
    }

    res.setHeader('Allow', 'GET, PATCH')
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/leads/[id]]', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('DATABASE_URL')) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }
    res.status(500).json({ error: 'Internal server error' })
  }
}
