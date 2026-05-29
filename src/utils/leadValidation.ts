import type { Lead, LeadStatus, LeadPriority } from '../types/lead'

const VALID_STATUSES: LeadStatus[] = [
  'not_contacted',
  'called',
  'interested',
  'follow_up',
  'proposal_sent',
  'won',
  'lost',
]
const VALID_PRIORITIES: LeadPriority[] = ['low', 'medium', 'high']

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function applyDefaults(raw: Partial<Lead>): Lead {
  const now = new Date().toISOString()
  return {
    id: raw.id ?? generateId(),
    companyName: raw.companyName ?? '',
    address: raw.address ?? '',
    city: raw.city ?? '',
    state: raw.state ?? 'MA',
    sector: raw.sector ?? '',
    selector: raw.selector ?? '',
    phone: raw.phone ?? '',
    website: raw.website ?? '',
    status: VALID_STATUSES.includes(raw.status as LeadStatus)
      ? (raw.status as LeadStatus)
      : 'not_contacted',
    priority: VALID_PRIORITIES.includes(raw.priority as LeadPriority)
      ? (raw.priority as LeadPriority)
      : 'medium',
    contactName: raw.contactName ?? '',
    contactRole: raw.contactRole ?? '',
    contactEmail: raw.contactEmail ?? '',
    lastContactedAt: raw.lastContactedAt ?? '',
    nextFollowUpAt: raw.nextFollowUpAt ?? '',
    notes: raw.notes ?? '',
    qualification: {
      hasWebsite: raw.qualification?.hasWebsite ?? false,
      websiteNeedsWork: raw.qualification?.websiteNeedsWork ?? false,
      accessibilityOpportunity:
        raw.qualification?.accessibilityOpportunity ?? false,
      seoOpportunity: raw.qualification?.seoOpportunity ?? false,
      aeoOpportunity: raw.qualification?.aeoOpportunity ?? false,
      decisionMakerFound: raw.qualification?.decisionMakerFound ?? false,
    },
    sourceUrl: raw.sourceUrl ?? '',
    createdAt: raw.createdAt ?? now,
    updatedAt: raw.updatedAt ?? now,
  }
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateLead(raw: Partial<Lead>): ValidationResult {
  const errors: string[] = []
  if (!raw.companyName?.trim()) errors.push('companyName is required')
  if (!raw.city?.trim()) errors.push('city is required')
  if (raw.status && !VALID_STATUSES.includes(raw.status))
    errors.push(`status "${raw.status}" is not valid`)
  if (raw.priority && !VALID_PRIORITIES.includes(raw.priority))
    errors.push(`priority "${raw.priority}" is not valid`)
  return { valid: errors.length === 0, errors }
}
