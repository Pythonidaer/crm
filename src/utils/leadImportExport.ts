import type { Lead } from '../types/lead'
import { applyDefaults, validateLead } from './leadValidation'

export interface ImportResult {
  imported: Lead[]
  skipped: number
  errors: string[]
}

function isDuplicate(lead: Lead, existing: Lead[]): boolean {
  return existing.some(
    (e) =>
      e.companyName.trim().toLowerCase() ===
        lead.companyName.trim().toLowerCase() &&
      e.city.trim().toLowerCase() === lead.city.trim().toLowerCase() &&
      e.address.trim().toLowerCase() === lead.address.trim().toLowerCase(),
  )
}

export function importLeads(
  jsonText: string,
  existingLeads: Lead[],
): ImportResult {
  const errors: string[] = []
  let parsed: unknown[]

  try {
    parsed = JSON.parse(jsonText) as unknown[]
    if (!Array.isArray(parsed)) {
      return { imported: [], skipped: 0, errors: ['Input must be a JSON array'] }
    }
  } catch {
    return { imported: [], skipped: 0, errors: ['Invalid JSON'] }
  }

  const imported: Lead[] = []
  let skipped = 0

  for (let i = 0; i < parsed.length; i++) {
    const raw = parsed[i] as Partial<Lead>
    const validation = validateLead(raw)
    if (!validation.valid) {
      errors.push(`Row ${i + 1}: ${validation.errors.join(', ')}`)
      skipped++
      continue
    }
    const lead = applyDefaults(raw)
    if (isDuplicate(lead, [...existingLeads, ...imported])) {
      skipped++
      continue
    }
    imported.push(lead)
  }

  return { imported, skipped, errors }
}

export function exportLeadsToJson(leads: Lead[]): string {
  return JSON.stringify(leads, null, 2)
}

export function downloadLeadsJson(leads: Lead[]): void {
  const json = exportLeadsToJson(leads)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `jonnovative-leads-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
