import { describe, it, expect } from 'vitest'
import { getLeads, saveLeads, getLead, upsertLead, deleteLead, clearLeads } from '../leadStorage'
import { applyDefaults } from '../leadValidation'

function makeLead(overrides?: object) {
  return applyDefaults({ companyName: 'Test Co', city: 'Salem', ...overrides })
}

describe('leadStorage', () => {
  it('returns empty array when nothing stored', () => {
    expect(getLeads()).toEqual([])
  })

  it('saves and retrieves leads', () => {
    const lead = makeLead()
    saveLeads([lead])
    expect(getLeads()).toHaveLength(1)
    expect(getLeads()[0].companyName).toBe('Test Co')
  })

  it('gets a single lead by id', () => {
    const lead = makeLead()
    saveLeads([lead])
    expect(getLead(lead.id)?.id).toBe(lead.id)
  })

  it('returns undefined for unknown id', () => {
    expect(getLead('does-not-exist')).toBeUndefined()
  })

  it('upserts a new lead', () => {
    const lead = makeLead()
    upsertLead(lead)
    expect(getLeads()).toHaveLength(1)
  })

  it('updates an existing lead', () => {
    const lead = makeLead()
    upsertLead(lead)
    upsertLead({ ...lead, companyName: 'Updated' })
    const leads = getLeads()
    expect(leads).toHaveLength(1)
    expect(leads[0].companyName).toBe('Updated')
  })

  it('deletes a lead by id', () => {
    const lead = makeLead()
    saveLeads([lead])
    deleteLead(lead.id)
    expect(getLeads()).toHaveLength(0)
  })

  it('clearLeads removes all leads', () => {
    saveLeads([makeLead(), makeLead()])
    clearLeads()
    expect(getLeads()).toHaveLength(0)
  })
})
