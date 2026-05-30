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
    expect(files).toContain('salem-admin-support-waste-mgmt-remediation.json')
    expect(files).toContain('salem-management-of-companies-and-enterprises.json')
    expect(files).toContain('salem-professional-scientific-and-technical-services.json')
    expect(files).toContain('salem-real-estate-and-rental-and-leasing.json')
    expect(files).toContain('salem-finance-and-insurance.json')
    expect(files).toContain('salem-information.json')
    expect(files).toContain('salem-transportation-and-warehousing-48-and-49.json')
    expect(files).toContain('salem-retail-trade-44-and-45.json')
    expect(files).toContain('salem-wholesale-trade.json')
    expect(files).toContain('salem-manufacturing-31-33.json')
    expect(files).toContain('salem-construction.json')
    expect(files).toContain('salem-utilities.json')
    expect(files).toContain('salem-mining.json')
    expect(files).toContain('salem-agriculture-forestry-fishing-and-hunting.json')
    expect(files).toContain('salem-accommodation-and-food-services.json')
    expect(files).toContain('salem-other-services-except-public-admin.json')
  })

  it('loads all Salem DER seeds when CRM is empty', () => {
    const added = seedDerDataIfEmpty()
    expect(added).toBe(2219)
    expect(getLeads()).toHaveLength(2219)
    expect(getLeads()[0].companyName).toBeTruthy()
  })

  it('does not reload when leads already exist via seedDerDataIfEmpty', () => {
    seedDerDataIfEmpty()
    const addedAgain = seedDerDataIfEmpty()
    expect(addedAgain).toBe(0)
    expect(getLeads()).toHaveLength(2219)
  })

  it('seedFromDerDataFiles skips duplicates on second run', () => {
    seedFromDerDataFiles()
    const added = seedFromDerDataFiles()
    expect(added).toBe(0)
    expect(getLeads()).toHaveLength(2219)
  })

  it('seedFromDerDataFiles merges new sector files into existing leads', () => {
    seedFromDerDataFiles()
    expect(getLeads()).toHaveLength(2219)
    const sectors = new Set(getLeads().map((l) => l.sector))
    expect(sectors.has('Unclassified establishments')).toBe(true)
    expect(sectors.has('Public Administration')).toBe(true)
    expect(sectors.has('Arts, Entertainment, and Recreation')).toBe(true)
    expect(sectors.has('Health Care and Social Assistance')).toBe(true)
    expect(sectors.has('Education Services')).toBe(true)
    expect(sectors.has('Admin., Support, Waste Mgmt, Remediation')).toBe(true)
    expect(sectors.has('Management of Companies and Enterprises')).toBe(true)
    expect(sectors.has('Professiona.l Scientific & Technical Svc')).toBe(true)
    expect(sectors.has('Real Estate and Rental and Leasing')).toBe(true)
    expect(sectors.has('Finance and Insurance')).toBe(true)
    expect(sectors.has('Information')).toBe(true)
    expect(sectors.has('Transportation and Warehousing (48 & 49)')).toBe(true)
    expect(sectors.has('Retail Trade (44 & 45)')).toBe(true)
    expect(sectors.has('Wholesale Trade')).toBe(true)
    expect(sectors.has('Manufacturing (31-33)')).toBe(true)
    expect(sectors.has('Construction')).toBe(true)
    expect(sectors.has('Utilities')).toBe(true)
    expect(sectors.has('Mining')).toBe(true)
    expect(sectors.has('Agriculture, Forestry, Fishing & Hunting')).toBe(true)
    expect(sectors.has('Accommodation and Food Services')).toBe(true)
    expect(sectors.has('Other Services (except Public Admin.)')).toBe(true)
  })
})
