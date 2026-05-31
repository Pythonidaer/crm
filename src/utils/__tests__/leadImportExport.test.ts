import { describe, it, expect } from 'vitest'
import { importLeads, exportLeadsToJson } from '../leadImportExport'
import { MOCK_LEADS } from '../mockLeadData'

describe('importLeads', () => {
  it('imports valid leads', () => {
    const json = JSON.stringify([
      { companyName: 'New Co', city: 'Salem', state: 'MA' },
    ])
    const { imported, skipped, errors } = importLeads(json, [])
    expect(imported).toHaveLength(1)
    expect(skipped).toBe(0)
    expect(errors).toHaveLength(0)
  })

  it('returns error for invalid JSON', () => {
    const { errors } = importLeads('not json', [])
    expect(errors[0]).toMatch(/invalid json/i)
  })

  it('returns error if not an array', () => {
    const { errors } = importLeads('{}', [])
    expect(errors[0]).toMatch(/array/i)
  })

  it('skips leads missing required fields', () => {
    const json = JSON.stringify([{ address: 'nowhere' }])
    const { imported, skipped, errors } = importLeads(json, [])
    expect(imported).toHaveLength(0)
    expect(skipped).toBe(1)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('prevents duplicate leads by companyName + city + address', () => {
    const existing = MOCK_LEADS.slice(0, 1)
    const json = JSON.stringify([
      {
        companyName: existing[0].companyName,
        city: existing[0].city,
        address: existing[0].address,
      },
    ])
    const { imported, skipped } = importLeads(json, existing)
    expect(imported).toHaveLength(0)
    expect(skipped).toBe(1)
  })

  it('does not deduplicate leads with different addresses', () => {
    const existing = MOCK_LEADS.slice(0, 1)
    const json = JSON.stringify([
      {
        companyName: existing[0].companyName,
        city: existing[0].city,
        address: '999 Different St',
      },
    ])
    const { imported } = importLeads(json, existing)
    expect(imported).toHaveLength(1)
  })
})

describe('exportLeadsToJson', () => {
  it('produces valid JSON', () => {
    const json = exportLeadsToJson(MOCK_LEADS)
    expect(() => JSON.parse(json)).not.toThrow()
  })

  it('round-trips correctly', () => {
    const json = exportLeadsToJson(MOCK_LEADS)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveLength(MOCK_LEADS.length)
    expect(parsed[0].companyName).toBe(MOCK_LEADS[0].companyName)
  })

  it('includes email enrichment fields in export', () => {
    const lead = {
      ...MOCK_LEADS[0],
      email: 'info@example.com',
      emailsFound: ['info@example.com', 'sales@example.com'],
      emailSourceUrl: 'https://example.com/contact',
      emailEnrichmentStatus: 'found' as const,
      emailEnrichmentNotes: '',
      emailEnrichedAt: '2026-05-31T00:00:00.000Z',
    }
    const parsed = JSON.parse(exportLeadsToJson([lead]))[0]
    expect(parsed.email).toBe('info@example.com')
    expect(parsed.emailsFound).toEqual(['info@example.com', 'sales@example.com'])
    expect(parsed.emailSourceUrl).toBe('https://example.com/contact')
    expect(parsed.emailEnrichmentStatus).toBe('found')
    expect(parsed.emailEnrichedAt).toBe('2026-05-31T00:00:00.000Z')
  })
})
