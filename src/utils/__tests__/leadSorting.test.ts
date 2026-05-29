import { describe, it, expect } from 'vitest'
import { sortLeads } from '../leadSorting'
import { MOCK_LEADS } from '../mockLeadData'

describe('sortLeads', () => {
  it('sorts by companyName ascending', () => {
    const result = sortLeads(MOCK_LEADS, 'companyName', 'asc')
    const names = result.map((l) => l.companyName)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('sorts by companyName descending', () => {
    const result = sortLeads(MOCK_LEADS, 'companyName', 'desc')
    const names = result.map((l) => l.companyName)
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)))
  })

  it('sorts by city', () => {
    const result = sortLeads(MOCK_LEADS, 'city', 'asc')
    expect(result[0].city <= result[result.length - 1].city).toBe(true)
  })

  it('sorts by status using defined order', () => {
    const result = sortLeads(MOCK_LEADS, 'status', 'asc')
    const first = result[0].status
    expect(['not_contacted', 'called'].includes(first)).toBe(true)
  })

  it('does not mutate the original array', () => {
    const original = [...MOCK_LEADS]
    sortLeads(MOCK_LEADS, 'companyName', 'asc')
    expect(MOCK_LEADS).toEqual(original)
  })
})
