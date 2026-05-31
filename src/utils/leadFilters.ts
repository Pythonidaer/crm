import type { Lead, LeadFilters } from '../types/lead'

function hasPhone(lead: Lead): boolean {
  return Boolean(lead.phoneNumber || lead.internationalPhoneNumber)
}

export function hasEmail(lead: Lead): boolean {
  return Boolean(lead.email) || (lead.emailsFound?.length ?? 0) > 0
}

export function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((lead) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match =
        lead.companyName.toLowerCase().includes(q) ||
        lead.displayName.toLowerCase().includes(q) ||
        lead.address.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.sector.toLowerCase().includes(q) ||
        (lead.phoneNumber ?? '').toLowerCase().includes(q) ||
        (lead.internationalPhoneNumber ?? '').toLowerCase().includes(q) ||
        (lead.website ?? '').toLowerCase().includes(q) ||
        (lead.email ?? '').toLowerCase().includes(q) ||
        (lead.emailsFound ?? []).some((e) => e.toLowerCase().includes(q))
      if (!match) return false
    }
    if (filters.city && lead.city !== filters.city) return false
    if (filters.sector && lead.sector !== filters.sector) return false
    if (filters.status && lead.status !== filters.status) return false
    if (filters.priority && lead.priority !== filters.priority) return false

    if (filters.matchConfidence) {
      if (filters.matchConfidence === 'none') {
        if (lead.matchConfidence) return false
      } else if (lead.matchConfidence !== filters.matchConfidence) {
        return false
      }
    }

    if (filters.leadFitTier && lead.leadFitTier !== filters.leadFitTier) return false

    if (filters.hasWebsite === 'yes' && !lead.website) return false
    if (filters.hasWebsite === 'no' && lead.website) return false

    if (filters.hasPhone === 'yes' && !hasPhone(lead)) return false
    if (filters.hasPhone === 'no' && hasPhone(lead)) return false

    if (filters.hasEmail === 'yes' && !hasEmail(lead)) return false
    if (filters.hasEmail === 'no' && hasEmail(lead)) return false

    if (filters.emailEnrichmentStatus) {
      const emailStatus = lead.emailEnrichmentStatus ?? 'none'
      if (filters.emailEnrichmentStatus === 'none') {
        if (lead.emailEnrichmentStatus) return false
      } else if (emailStatus !== filters.emailEnrichmentStatus) {
        return false
      }
    }

    if (filters.enrichmentStatus) {
      const status = lead.enrichmentStatus ?? 'not_enriched'
      if (filters.enrichmentStatus === 'none') {
        if (status !== 'not_enriched') return false
      } else if (status !== filters.enrichmentStatus) {
        return false
      }
    }

    return true
  })
}

export function getUniqueValues(leads: Lead[], key: keyof Lead): string[] {
  const set = new Set(leads.map((l) => String(l[key] ?? '')).filter(Boolean))
  return Array.from(set).sort()
}

export const EMPTY_LEAD_FILTERS: LeadFilters = {
  search: '',
  city: '',
  sector: '',
  status: '',
  priority: '',
  matchConfidence: '',
  leadFitTier: '',
  hasWebsite: '',
  hasPhone: '',
  hasEmail: '',
  emailEnrichmentStatus: '',
  enrichmentStatus: '',
}

export function formatEnrichmentStatus(status: Lead['enrichmentStatus']): string {
  return status ?? 'not_enriched'
}

export function formatPhone(lead: Lead): string {
  return lead.phoneNumber || lead.internationalPhoneNumber || '—'
}

export function formatEmail(lead: Lead): string {
  return lead.email ?? lead.emailsFound?.[0] ?? '—'
}
