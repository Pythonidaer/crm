import { describe, it, expect } from 'vitest'
import {
  detectChainBrand,
  resolveDisplayName,
  scoreLeadFit,
} from '../leadScoring.js'
import { matchKey } from '../leadMergeKey.js'

describe('resolveDisplayName', () => {
  it('uses googleDisplayName when available', () => {
    expect(resolveDisplayName('Google Name LLC', 'DER Name')).toBe('Google Name LLC')
  })

  it('falls back to companyName when googleDisplayName is empty', () => {
    expect(resolveDisplayName(null, 'DER Name')).toBe('DER Name')
    expect(resolveDisplayName('', 'DER Name')).toBe('DER Name')
  })
})

describe('scoreLeadFit', () => {
  it('scores higher for no website and phone with high match confidence', () => {
    const result = scoreLeadFit({
      companyName: 'Local Plumbing Co',
      googleDisplayName: 'Local Plumbing Co',
      website: null,
      phoneNumber: '(978) 555-0100',
      matchConfidence: 'high',
      enrichmentStatus: 'matched',
      sector: 'Construction',
    })
    expect(result.leadFitScore).toBeGreaterThanOrEqual(70)
    expect(result.leadFitTier).toBe('strong')
    expect(result.disqualificationReason).toBeNull()
  })

  it('marks national chains as disqualified', () => {
    const result = scoreLeadFit({
      companyName: 'Dunkin',
      googleDisplayName: 'Dunkin',
      website: 'https://www.dunkindonuts.com',
      phoneNumber: '(978) 555-0100',
      matchConfidence: 'high',
      enrichmentStatus: 'matched',
      sector: 'Accommodation and Food Services',
    })
    expect(result.leadFitTier).toBe('disqualified')
    expect(result.disqualificationReason).toMatch(/Dunkin/i)
  })

  it('applies not_found penalty', () => {
    const result = scoreLeadFit({
      companyName: 'Unknown Co',
      googleDisplayName: null,
      website: null,
      phoneNumber: null,
      matchConfidence: null,
      enrichmentStatus: 'not_found',
      sector: 'Retail Trade',
    })
    expect(result.leadFitScore).toBeLessThan(70)
  })
})

describe('detectChainBrand', () => {
  it('detects Starbucks', () => {
    expect(detectChainBrand('Starbucks Coffee', 'Starbucks')).toMatchObject({
      label: 'Starbucks',
    })
  })
})

describe('matchKey', () => {
  it('builds a stable key from DER fields including sector', () => {
    expect(
      matchKey({
        companyName: 'Acme Inc',
        address: 'Main St',
        city: 'Salem',
        state: 'MA',
        sector: 'Construction',
      }),
    ).toBe('acme inc|main st|salem|ma|construction')
  })
})
