import { describe, it, expect } from 'vitest'
import { applyDefaults, validateLead } from '../leadValidation'

describe('applyDefaults', () => {
  it('fills in required fields with safe defaults', () => {
    const lead = applyDefaults({})
    expect(lead.state).toBe('MA')
    expect(lead.status).toBe('not_contacted')
    expect(lead.priority).toBe('medium')
    expect(lead.qualification.hasWebsite).toBe(false)
    expect(lead.emailsFound).toEqual([])
    expect(lead.emailEnrichmentStatus).toBeNull()
    expect(lead.companyName).toBe('')
    expect(lead.id).toBeTruthy()
  })

  it('preserves provided values', () => {
    const lead = applyDefaults({ companyName: 'Acme', city: 'Boston', status: 'called', priority: 'high' })
    expect(lead.companyName).toBe('Acme')
    expect(lead.city).toBe('Boston')
    expect(lead.status).toBe('called')
    expect(lead.priority).toBe('high')
  })

  it('falls back to not_contacted for invalid status', () => {
    const lead = applyDefaults({ status: 'garbage' as never })
    expect(lead.status).toBe('not_contacted')
  })

  it('falls back to medium for invalid priority', () => {
    const lead = applyDefaults({ priority: 'ultra' as never })
    expect(lead.priority).toBe('medium')
  })
})

describe('validateLead', () => {
  it('returns valid for a lead with companyName and city', () => {
    const result = validateLead({ companyName: 'Acme', city: 'Salem' })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('requires companyName', () => {
    const result = validateLead({ city: 'Salem' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('companyName is required')
  })

  it('requires city', () => {
    const result = validateLead({ companyName: 'Acme' })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('city is required')
  })

  it('rejects invalid status values', () => {
    const result = validateLead({ companyName: 'A', city: 'B', status: 'unknown' as never })
    expect(result.valid).toBe(false)
    expect(result.errors[0]).toMatch(/status/)
  })
})
