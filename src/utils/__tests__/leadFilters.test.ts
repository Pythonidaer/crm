import { describe, it, expect } from 'vitest'
import { filterLeads } from '../leadFilters'
import { MOCK_LEADS } from '../mockLeadData'

const empty = { search: '', city: '', sector: '', selector: '', status: '', priority: '' }

describe('filterLeads', () => {
  it('returns all leads with empty filters', () => {
    expect(filterLeads(MOCK_LEADS, empty)).toHaveLength(MOCK_LEADS.length)
  })

  it('filters by city', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, city: 'Salem' })
    expect(result.every((l) => l.city === 'Salem')).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('filters by sector', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, sector: 'Manufacturing' })
    expect(result.every((l) => l.sector === 'Manufacturing')).toBe(true)
  })

  it('filters by selector', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, selector: 'Food Manufacturing' })
    expect(result.every((l) => l.selector === 'Food Manufacturing')).toBe(true)
  })

  it('filters by status', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, status: 'called' })
    expect(result.every((l) => l.status === 'called')).toBe(true)
  })

  it('filters by priority', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, priority: 'high' })
    expect(result.every((l) => l.priority === 'high')).toBe(true)
  })

  it('filters by search text (company name)', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, search: 'aqua' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((l) => l.companyName.toLowerCase().includes('aqua'))).toBe(true)
  })

  it('returns empty array when no matches', () => {
    const result = filterLeads(MOCK_LEADS, { ...empty, city: 'Boston' })
    expect(result).toHaveLength(0)
  })
})
