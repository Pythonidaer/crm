import { describe, it, expect } from 'vitest'
import { filterLeads, EMPTY_LEAD_FILTERS } from '../leadFilters'
import { MOCK_LEADS } from '../mockLeadData'

describe('filterLeads', () => {
  it('returns all leads with empty filters', () => {
    expect(filterLeads(MOCK_LEADS, EMPTY_LEAD_FILTERS)).toHaveLength(MOCK_LEADS.length)
  })

  it('filters by city', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, city: 'Salem' })
    expect(result.every((l) => l.city === 'Salem')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters by sector', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, sector: 'Manufacturing' })
    expect(result.every((l) => l.sector === 'Manufacturing')).toBe(true)
  })

  it('does not include selector in filter state', () => {
    expect(Object.keys(EMPTY_LEAD_FILTERS)).not.toContain('selector')
  })

  it('filters by status', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, status: 'called' })
    expect(result.every((l) => l.status === 'called')).toBe(true)
  })

  it('filters by priority', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, priority: 'high' })
    expect(result.every((l) => l.priority === 'high')).toBe(true)
  })

  it('filters by lead fit tier', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, leadFitTier: 'strong' })
    expect(result.every((l) => l.leadFitTier === 'strong')).toBe(true)
  })

  it('filters by hasWebsite=yes', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, hasWebsite: 'yes' })
    expect(result.every((l) => Boolean(l.website))).toBe(true)
  })

  it('filters by enrichment status not_enriched', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, enrichmentStatus: 'not_enriched' })
    expect(result.every((l) => (l.enrichmentStatus ?? 'not_enriched') === 'not_enriched')).toBe(true)
  })

  it('filters by hasPhone using international number', () => {
    const lead = { ...MOCK_LEADS[0], phoneNumber: null, internationalPhoneNumber: '+1 978-555-0100' }
    expect(filterLeads([lead], { ...EMPTY_LEAD_FILTERS, hasPhone: 'yes' })).toHaveLength(1)
  })

  it('filters by hasEmail=yes when email or emailsFound present', () => {
    const withEmail = { ...MOCK_LEADS[0], email: 'info@example.com', emailsFound: [] }
    const withFound = { ...MOCK_LEADS[1], email: null, emailsFound: ['contact@example.com'] }
    const without = { ...MOCK_LEADS[2], email: null, emailsFound: [] }
    expect(filterLeads([withEmail], { ...EMPTY_LEAD_FILTERS, hasEmail: 'yes' })).toHaveLength(1)
    expect(filterLeads([withFound], { ...EMPTY_LEAD_FILTERS, hasEmail: 'yes' })).toHaveLength(1)
    expect(filterLeads([without], { ...EMPTY_LEAD_FILTERS, hasEmail: 'no' })).toHaveLength(1)
    expect(filterLeads([withEmail], { ...EMPTY_LEAD_FILTERS, hasEmail: 'no' })).toHaveLength(0)
  })

  it('filters by emailEnrichmentStatus review_needed', () => {
    const lead = {
      ...MOCK_LEADS[0],
      email: 'info@example.com',
      emailEnrichmentStatus: 'review_needed' as const,
    }
    const other = { ...MOCK_LEADS[1], email: null, emailEnrichmentStatus: null }
    expect(
      filterLeads([lead, other], { ...EMPTY_LEAD_FILTERS, emailEnrichmentStatus: 'review_needed' }),
    ).toHaveLength(1)
  })

  it('filters by search text (company name)', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, search: 'aqua' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((l) => l.companyName.toLowerCase().includes('aqua'))).toBe(true)
  })

  it('returns empty array when no matches', () => {
    const result = filterLeads(MOCK_LEADS, { ...EMPTY_LEAD_FILTERS, city: 'Boston' })
    expect(result).toHaveLength(0)
  })
})
