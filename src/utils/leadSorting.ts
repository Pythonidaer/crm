import type { Lead, LeadSortKey } from '../types/lead'

const STATUS_ORDER: Record<string, number> = {
  not_contacted: 0,
  called: 1,
  interested: 2,
  follow_up: 3,
  proposal_sent: 4,
  won: 5,
  lost: 6,
}

export function sortLeads(
  leads: Lead[],
  key: LeadSortKey,
  direction: 'asc' | 'desc' = 'asc',
): Lead[] {
  const sorted = [...leads].sort((a, b) => {
    let result = 0
    if (key === 'status') {
      result = (STATUS_ORDER[a.status] ?? 0) - (STATUS_ORDER[b.status] ?? 0)
    } else if (key === 'leadFitScore') {
      result = (a.leadFitScore ?? 0) - (b.leadFitScore ?? 0)
    } else {
      const aVal = (a[key] ?? '').toString().toLowerCase()
      const bVal = (b[key] ?? '').toString().toLowerCase()
      result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    }
    return direction === 'desc' ? -result : result
  })
  return sorted
}
