import { describe, it, expect, beforeEach } from 'vitest'
import {
  seedEnrichedLeadsIfEmpty,
  seedFromEnrichedLeads,
  syncEnrichedDataset,
  bundledEmailDataIsNewer,
  listDerSeedFiles,
  getEnrichedLeadCount,
  ENRICHED_DATA_VERSION,
} from '../derSeedLoader'
import { clearLeads, getLeads, saveLeads } from '../leadStorage'
import { hasEmail } from '../leadFilters'

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
    expect(getLeads().filter((l) => hasEmail(l)).length).toBeGreaterThan(0)
  })

  it('preserves email enrichment fields after seed', () => {
    seedEnrichedLeadsIfEmpty()
    const barrio = getLeads().find((l) => l.companyName === 'Barrio Tacos')
    expect(barrio?.email).toBe('info@barrio-tacos.com')
    expect(barrio?.emailsFound).toContain('info@barrio-tacos.com')
    expect(barrio?.emailEnrichmentStatus).toBe('found')
  })

  it('resyncs when version matches but email enrichment is missing locally', () => {
    seedEnrichedLeadsIfEmpty()
    localStorage.setItem('jonnovative_crm_enriched_version', ENRICHED_DATA_VERSION)

    const stripped = getLeads().map((lead) => ({
      ...lead,
      email: null,
      emailsFound: [],
      emailSourceUrl: null,
      emailEnrichmentStatus: null,
      emailEnrichmentNotes: null,
      emailEnrichedAt: null,
    }))
    saveLeads(stripped)
    expect(getLeads().filter((l) => hasEmail(l)).length).toBe(0)
    expect(bundledEmailDataIsNewer(getLeads())).toBe(true)

    const synced = syncEnrichedDataset()
    expect(synced).toBe(2219)
    expect(getLeads().filter((l) => hasEmail(l)).length).toBeGreaterThan(0)

    const barrio = getLeads().find((l) => l.companyName === 'Barrio Tacos')
    expect(barrio?.email).toBe('info@barrio-tacos.com')
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
