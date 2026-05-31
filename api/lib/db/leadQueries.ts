import { getSql } from './neonClient'
import { patchInputToRow, rowToLead, type LeadPatchInput } from './leadMapper'
import { normalizeLeadRow } from './leadRow'
import type { Lead } from '../../../src/types/lead'

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

function rowsToLeads(rows: Record<string, unknown>[]): Lead[] {
  return rows.map((row) => rowToLead(normalizeLeadRow(row)))
}

export async function getLeads(): Promise<Lead[]> {
  const sql = getSql()
  const rows = await sql.query(`${SELECT_LEADS} ORDER BY display_name ASC, company_name ASC`)
  return rowsToLeads(rows as Record<string, unknown>[])
}

export async function getLeadsPage(page: number, pageSize: number): Promise<Lead[]> {
  const sql = getSql()
  const safePage = Math.max(1, page)
  const safeSize = Math.min(Math.max(1, pageSize), 500)
  const offset = (safePage - 1) * safeSize
  const rows = await sql.query(
    `${SELECT_LEADS} ORDER BY display_name ASC, company_name ASC LIMIT $1 OFFSET $2`,
    [safeSize, offset],
  )
  return rowsToLeads(rows as Record<string, unknown>[])
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const sql = getSql()
  const rows = await sql.query(`${SELECT_LEADS} WHERE id = $1 LIMIT 1`, [id])
  const row = (rows as Record<string, unknown>[])[0]
  return row ? rowToLead(normalizeLeadRow(row)) : null
}

export async function countLeads(): Promise<number> {
  const sql = getSql()
  const rows = await sql.query('SELECT count(*)::int AS count FROM leads')
  return Number((rows as { count: number }[])[0]?.count ?? 0)
}

export async function updateLeadEditableFields(
  id: string,
  patch: LeadPatchInput,
): Promise<Lead | null> {
  const existing = await getLeadById(id)
  if (!existing) return null

  const rowPatch = patchInputToRow(patch)
  const sql = getSql()

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
      rowPatch.status ?? existing.status,
      rowPatch.priority ?? existing.priority,
      rowPatch.nextFollowUpAt ?? (existing.nextFollowUpAt || null),
      rowPatch.lastContactedAt ?? (existing.lastContactedAt || null),
      rowPatch.contactName ?? existing.contactName,
      rowPatch.contactRole ?? existing.contactRole,
      rowPatch.contactEmail ?? existing.contactEmail,
      rowPatch.notes ?? existing.notes,
      rowPatch.hasWebsite ?? existing.qualification.hasWebsite,
      rowPatch.websiteNeedsWork ?? existing.qualification.websiteNeedsWork,
      rowPatch.accessibilityOpportunity ?? existing.qualification.accessibilityOpportunity,
      rowPatch.seoOpportunity ?? existing.qualification.seoOpportunity,
      rowPatch.aeoOpportunity ?? existing.qualification.aeoOpportunity,
      rowPatch.decisionMakerFound ?? existing.qualification.decisionMakerFound,
      rowPatch.updatedAt ?? new Date().toISOString(),
    ],
  )

  return getLeadById(id)
}
