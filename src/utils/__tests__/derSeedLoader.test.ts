import { describe, it, expect, beforeEach } from 'vitest'
import { seedDerDataIfEmpty, seedFromDerDataFiles, listDerSeedFiles } from '../derSeedLoader'
import { clearLeads, getLeads } from '../leadStorage'

describe('derSeedLoader', () => {
  beforeEach(() => {
    clearLeads()
  })

  it('lists DER seed JSON files', () => {
    const files = listDerSeedFiles()
    expect(files).toContain('salem-unclassified-establishments.json')
    expect(files).toContain('salem-public-administration.json')
    expect(files).toContain('salem-arts-entertainment-and-recreation.json')
    expect(files).toContain('salem-health-care-and-social-assistance.json')
    expect(files).toContain('salem-education-services.json')
  })

  it('loads all Salem DER seeds when CRM is empty', () => {
    const added = seedDerDataIfEmpty()
    expect(added).toBe(738)
    expect(getLeads()).toHaveLength(738)
    expect(getLeads()[0].companyName).toBeTruthy()
  })

  it('does not reload when leads already exist via seedDerDataIfEmpty', () => {
    seedDerDataIfEmpty()
    const addedAgain = seedDerDataIfEmpty()
    expect(addedAgain).toBe(0)
    expect(getLeads()).toHaveLength(738)
  })

  it('seedFromDerDataFiles skips duplicates on second run', () => {
    seedFromDerDataFiles()
    const added = seedFromDerDataFiles()
    expect(added).toBe(0)
    expect(getLeads()).toHaveLength(738)
  })

  it('seedFromDerDataFiles merges new sector files into existing leads', () => {
    seedFromDerDataFiles()
    expect(getLeads()).toHaveLength(738)
    const sectors = new Set(getLeads().map((l) => l.sector))
    expect(sectors.has('Unclassified establishments')).toBe(true)
    expect(sectors.has('Public Administration')).toBe(true)
    expect(sectors.has('Arts, Entertainment, and Recreation')).toBe(true)
    expect(sectors.has('Health Care and Social Assistance')).toBe(true)
    expect(sectors.has('Education Services')).toBe(true)
  })
})
