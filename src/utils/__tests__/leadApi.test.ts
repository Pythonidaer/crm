import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchLeadsFromApi, fetchLeadFromApi, isDatabaseLeadsEnabled } from '../leadApi'

describe('leadApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('isDatabaseLeadsEnabled reads VITE_USE_DATABASE_LEADS', () => {
    expect(typeof isDatabaseLeadsEnabled()).toBe('boolean')
  })

  it('fetchLeadsFromApi returns parsed leads', async () => {
    const leads = [{ id: 'lead-1', companyName: 'Acme' }]
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ leads, total: 1, page: 1, pageSize: 500, hasMore: false }),
    } as Response)

    await expect(fetchLeadsFromApi()).resolves.toEqual(leads)
    expect(fetch).toHaveBeenCalledWith('/api/leads?page=1&pageSize=500')
  })

  it('fetchLeadFromApi throws on error response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ error: 'Lead not found' }),
    } as Response)

    await expect(fetchLeadFromApi('missing')).rejects.toThrow('Lead not found')
  })
})
