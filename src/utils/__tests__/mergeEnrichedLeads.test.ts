import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchKey } from '../leadMergeKey.js'
import { resolveDisplayName, scoreLeadFit } from '../leadScoring.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..')
const OUT_FILE = join(ROOT, 'src/utils/leads/salem-leads.enriched.json')

describe('merge-enriched-leads output', () => {
  it('writes salem-leads.enriched.json when merge has been run', () => {
    expect(existsSync(OUT_FILE)).toBe(true)
  })

  it('merged leads omit selector and include displayName', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    expect(Array.isArray(leads)).toBe(true)
    expect(leads.length).toBe(2219)

    const first = leads[0]
    expect(first.selector).toBeUndefined()
    expect(first.companyName).toBeTruthy()
    expect(first.displayName).toBe(
      resolveDisplayName(first.googleDisplayName, first.companyName),
    )
    expect(first.sector).toBeTruthy()
    expect(typeof first.leadFitScore).toBe('number')
    expect(first.leadFitTier).toBeTruthy()
  })

  it('includes all enrichment status buckets', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    const statuses = new Set(leads.map((l: { enrichmentStatus: string }) => l.enrichmentStatus))
    expect(statuses.has('matched')).toBe(true)
    expect(statuses.has('review_needed')).toBe(true)
    expect(statuses.has('not_found')).toBe(true)
  })

  it('assigns deterministic ids from match keys', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    const keys = new Set(
      leads.map((lead: Record<string, string>) =>
        matchKey({
          companyName: lead.companyName,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          sector: lead.sector,
        }),
      ),
    )
    expect(keys.size).toBe(leads.length)
    expect(leads.every((lead: { id: string }) => lead.id.startsWith('lead-'))).toBe(true)
  })

  it('includes scored lead fit on every record', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    for (const lead of leads.slice(0, 20)) {
      const expected = scoreLeadFit(lead)
      expect(lead.leadFitScore).toBe(expected.leadFitScore)
      expect(lead.leadFitTier).toBe(expected.leadFitTier)
    }
  })

  it('populates phone and match confidence for enriched leads', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    const withPhone = leads.filter(
      (l: { phoneNumber?: string; internationalPhoneNumber?: string }) =>
        l.phoneNumber || l.internationalPhoneNumber,
    ).length
    const withMatch = leads.filter((l: { matchConfidence?: string }) => l.matchConfidence).length
    expect(withPhone).toBeGreaterThan(1000)
    expect(withMatch).toBeGreaterThan(1000)
  })

  it('includes email enrichment fields on every record', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    for (const lead of leads.slice(0, 20)) {
      expect(lead).toHaveProperty('email')
      expect(Array.isArray(lead.emailsFound)).toBe(true)
      expect(lead).toHaveProperty('emailSourceUrl')
      expect(lead).toHaveProperty('emailEnrichmentStatus')
      expect(lead).toHaveProperty('emailEnrichmentNotes')
      expect(lead).toHaveProperty('emailEnrichedAt')
      expect(lead.selector).toBeUndefined()
    }
  })

  it('merges email enrichment from website scrape output', () => {
    const leads = JSON.parse(readFileSync(OUT_FILE, 'utf8'))
    const barrio = leads.find((l: { companyName: string }) => l.companyName === 'Barrio Tacos')
    expect(barrio?.email).toBe('info@barrio-tacos.com')
    expect(barrio?.emailEnrichmentStatus).toBe('found')
    expect(barrio?.emailsFound).toContain('info@barrio-tacos.com')
  })
})
