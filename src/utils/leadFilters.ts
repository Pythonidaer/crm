import type { Lead, LeadFilters } from '../types/lead'

export function filterLeads(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((lead) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const match =
        lead.companyName.toLowerCase().includes(q) ||
        lead.address.toLowerCase().includes(q) ||
        lead.city.toLowerCase().includes(q) ||
        lead.sector.toLowerCase().includes(q) ||
        lead.selector.toLowerCase().includes(q)
      if (!match) return false
    }
    if (filters.city && lead.city !== filters.city) return false
    if (filters.sector && lead.sector !== filters.sector) return false
    if (filters.selector && lead.selector !== filters.selector) return false
    if (filters.status && lead.status !== filters.status) return false
    if (filters.priority && lead.priority !== filters.priority) return false
    return true
  })
}

export function getUniqueValues(leads: Lead[], key: keyof Lead): string[] {
  const set = new Set(leads.map((l) => String(l[key])).filter(Boolean))
  return Array.from(set).sort()
}
