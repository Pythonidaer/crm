import type { Lead } from '../types/lead'
import { applyDefaults } from './leadValidation'

const STORAGE_KEY = 'jonnovative_crm_leads'

function normalizeLead(raw: Partial<Lead>): Lead {
  return applyDefaults(raw)
}

export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Partial<Lead>[]
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeLead)
  } catch {
    return []
  }
}

export function saveLeads(leads: Lead[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads))
}

export function getLead(id: string): Lead | undefined {
  return getLeads().find((l) => l.id === id)
}

export function upsertLead(lead: Lead): void {
  const leads = getLeads()
  const index = leads.findIndex((l) => l.id === lead.id)
  if (index >= 0) {
    leads[index] = { ...lead, updatedAt: new Date().toISOString() }
  } else {
    leads.push(lead)
  }
  saveLeads(leads)
}

export function deleteLead(id: string): void {
  saveLeads(getLeads().filter((l) => l.id !== id))
}

export function clearLeads(): void {
  localStorage.removeItem(STORAGE_KEY)
}
