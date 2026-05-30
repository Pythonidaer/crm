import { describe, it, expect, beforeEach } from 'vitest'
import {
  seedEnrichedLeadsIfEmpty,
  seedFromEnrichedLeads,
  syncEnrichedDataset,
  listDerSeedFiles,
  getEnrichedLeadCount,
  ENRICHED_DATA_VERSION,
} from '../derSeedLoader'
import { clearLeads, getLeads } from '../leadStorage'

describe('derSeedLoader', () => {
  beforeEach(() => {
    clearLeads()
    localStorage.removeItem('jonnovative_crm_enriched_version')
  })

  it('lists the merged enriched dataset file', () => {
    expect(listDerSeedFiles()).toEqual(['salem-leads.enriched.json'])
  })

  it('reports enriched lead count from merged dataset', () => {
    expect(getEnrichedLeadCount()).toBe(2219)
  })

  it('loads merged enriched leads when CRM is empty', () => {
    const added = seedEnrichedLeadsIfEmpty()
    expect(added).toBe(2219)
    expect(getLeads()).toHaveLength(2219)
    expect(getLeads()[0].displayName).toBeTruthy()
    expect('selector' in getLeads()[0]).toBe(false)
    expect(getLeads().filter((l) => l.phoneNumber || l.internationalPhoneNumber).length).toBeGreaterThan(
      1000,
    )
  })

  it('syncs enriched dataset over stale local leads', () => {
    localStorage.setItem(
      'jonnovative_crm_leads',
      JSON.stringify([
        {
          id: 'old-1',
          companyName: '3 Kitchens Catering',
          address: 'Essex St',
          city: 'Salem',
          state: 'MA',
          sector: 'Accommodation and Food Services',
          status: 'called',
        },
      ]),
    )

    const synced = syncEnrichedDataset()
    expect(synced).toBe(2219)
    expect(localStorage.getItem('jonnovative_crm_enriched_version')).toBe(ENRICHED_DATA_VERSION)

    const lead = getLeads().find((l) => l.companyName === '3 Kitchens Catering')
    expect(lead?.enrichmentStatus).toBe('matched')
    expect(lead?.phoneNumber || lead?.internationalPhoneNumber).toBeTruthy()
    expect(lead?.status).toBe('called')
  })

  it('does not reload when version is current', () => {
    seedEnrichedLeadsIfEmpty()
    const addedAgain = seedEnrichedLeadsIfEmpty()
    expect(addedAgain).toBe(0)
    expect(getLeads()).toHaveLength(2219)
  })

  it('seedFromEnrichedLeads skips duplicates on second run', () => {
    seedFromEnrichedLeads()
    const added = seedFromEnrichedLeads()
    expect(added).toBe(0)
    expect(getLeads()).toHaveLength(2219)
  })

  it('merged leads preserve sector values', () => {
    seedFromEnrichedLeads()
    const sectors = new Set(getLeads().map((l) => l.sector))
    expect(sectors.has('Mining')).toBe(true)
    expect(sectors.has('Construction')).toBe(true)
    expect(sectors.has('Public Administration')).toBe(true)
  })
})
