import type { Lead } from '../types/lead'
import type { LeadPatchInput } from '../../lib/db/leadMapper'

export function isDatabaseLeadsEnabled(): boolean {
  return import.meta.env['VITE_USE_DATABASE_LEADS'] === 'true'
}

function apiBaseUrl(): string {
  const configured = import.meta.env['VITE_API_BASE_URL']
  if (typeof configured === 'string' && configured.trim()) {
    return configured.replace(/\/$/, '')
  }
  return ''
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const contentType = response.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        const body = (await response.json()) as { error?: string }
        if (body.error) message = body.error
      } else {
        const text = (await response.text()).trim()
        if (text) message = `${message}: ${text.slice(0, 120)}`
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }
  return response.json() as Promise<T>
}

export async function fetchLeadsFromApi(): Promise<Lead[]> {
  const response = await fetch(`${apiBaseUrl()}/api/leads`)
  return parseJson<Lead[]>(response)
}

export async function fetchLeadFromApi(id: string): Promise<Lead> {
  const response = await fetch(`${apiBaseUrl()}/api/leads/${encodeURIComponent(id)}`)
  return parseJson<Lead>(response)
}

export async function patchLeadViaApi(id: string, patch: LeadPatchInput): Promise<Lead> {
  const response = await fetch(`${apiBaseUrl()}/api/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return parseJson<Lead>(response)
}

export function leadToPatchInput(lead: Lead): LeadPatchInput {
  return {
    status: lead.status,
    priority: lead.priority,
    nextFollowUpAt: lead.nextFollowUpAt,
    lastContactedAt: lead.lastContactedAt,
    contactName: lead.contactName,
    contactRole: lead.contactRole,
    contactEmail: lead.contactEmail,
    notes: lead.notes,
    hasWebsite: lead.qualification.hasWebsite,
    websiteNeedsWork: lead.qualification.websiteNeedsWork,
    accessibilityOpportunity: lead.qualification.accessibilityOpportunity,
    seoOpportunity: lead.qualification.seoOpportunity,
    aeoOpportunity: lead.qualification.aeoOpportunity,
    decisionMakerFound: lead.qualification.decisionMakerFound,
  }
}
