import { describe, it, expect } from 'vitest'
import { parseLeadPatchBody } from '../leadPatchValidation'

describe('parseLeadPatchBody', () => {
  it('accepts editable CRM fields', () => {
    const { patch, errors } = parseLeadPatchBody({
      status: 'called',
      priority: 'high',
      notes: 'Follow up Monday',
      hasWebsite: true,
    })

    expect(errors).toEqual([])
    expect(patch).toEqual({
      status: 'called',
      priority: 'high',
      notes: 'Follow up Monday',
      hasWebsite: true,
    })
  })

  it('accepts date aliases', () => {
    const { patch, errors } = parseLeadPatchBody({
      nextFollowUp: '2026-06-01T00:00:00.000Z',
      lastContacted: '',
    })

    expect(errors).toEqual([])
    expect(patch.nextFollowUpAt).toBe('2026-06-01T00:00:00.000Z')
    expect(patch.lastContactedAt).toBe('')
  })

  it('rejects invalid status and priority', () => {
    const { errors } = parseLeadPatchBody({
      status: 'invalid',
      priority: 'urgent',
    })

    expect(errors).toEqual([
      'status must be one of: not_contacted, called, interested, follow_up, proposal_sent, won, lost',
      'priority must be one of: low, medium, high',
    ])
  })

  it('ignores protected enrichment fields', () => {
    const { patch, errors } = parseLeadPatchBody({
      companyName: 'Changed Co',
      website: 'https://example.com',
      status: 'interested',
    })

    expect(errors).toEqual([])
    expect(patch).toEqual({ status: 'interested' })
    expect(patch).not.toHaveProperty('companyName')
    expect(patch).not.toHaveProperty('website')
  })

  it('requires at least one editable field', () => {
    const { errors } = parseLeadPatchBody({ companyName: 'Ignored only' })
    expect(errors).toEqual(['No editable fields provided'])
  })

  it('rejects invalid date strings', () => {
    const { errors } = parseLeadPatchBody({
      notes: 'Updated',
      lastContactedAt: 'invalid-date',
    })
    expect(errors).toEqual(['lastContactedAt must be a valid date'])
  })
})
