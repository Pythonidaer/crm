import type { LeadPriority, LeadStatus } from '../../../src/types/lead'
import type { LeadPatchInput } from './leadMapper'

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

const PATCH_FIELD_ALIASES: Record<string, keyof LeadPatchInput> = {
  nextFollowUpAt: 'nextFollowUpAt',
  nextFollowUp: 'nextFollowUpAt',
  lastContactedAt: 'lastContactedAt',
  lastContacted: 'lastContactedAt',
}

const PATCHABLE_KEYS = new Set<keyof LeadPatchInput>([
  'status',
  'priority',
  'nextFollowUpAt',
  'lastContactedAt',
  'contactName',
  'contactRole',
  'contactEmail',
  'notes',
  'hasWebsite',
  'websiteNeedsWork',
  'accessibilityOpportunity',
  'seoOpportunity',
  'aeoOpportunity',
  'decisionMakerFound',
])

function isNullableDateString(value: unknown): value is string {
  return typeof value === 'string'
}

function parseBoolean(value: unknown, field: string, errors: string[]): boolean | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'boolean') return value
  errors.push(`${field} must be a boolean`)
  return undefined
}

function parseString(value: unknown, field: string, errors: string[]): string | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'string') return value
  errors.push(`${field} must be a string`)
  return undefined
}

export function parseLeadPatchBody(body: unknown): { patch: LeadPatchInput; errors: string[] } {
  const errors: string[] = []
  const patch: LeadPatchInput = {}

  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { patch: {}, errors: ['Request body must be a JSON object'] }
  }

  const input = body as Record<string, unknown>

  for (const [rawKey, value] of Object.entries(input)) {
    const key = PATCH_FIELD_ALIASES[rawKey] ?? (rawKey as keyof LeadPatchInput)
    if (!PATCHABLE_KEYS.has(key)) continue

    switch (key) {
      case 'status':
        if (value === undefined) break
        if (VALID_STATUSES.includes(value as LeadStatus)) {
          patch.status = value as LeadStatus
        } else {
          errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`)
        }
        break
      case 'priority':
        if (value === undefined) break
        if (VALID_PRIORITIES.includes(value as LeadPriority)) {
          patch.priority = value as LeadPriority
        } else {
          errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`)
        }
        break
      case 'nextFollowUpAt':
      case 'lastContactedAt':
        if (value === undefined) break
        if (value === null || isNullableDateString(value)) {
          patch[key] = value ?? ''
        } else {
          errors.push(`${key} must be a string or null`)
        }
        break
      case 'contactName':
      case 'contactRole':
      case 'contactEmail':
      case 'notes': {
        const parsed = parseString(value, key, errors)
        if (parsed !== undefined) patch[key] = parsed
        break
      }
      case 'hasWebsite':
      case 'websiteNeedsWork':
      case 'accessibilityOpportunity':
      case 'seoOpportunity':
      case 'aeoOpportunity':
      case 'decisionMakerFound': {
        const parsed = parseBoolean(value, key, errors)
        if (parsed !== undefined) patch[key] = parsed
        break
      }
    }
  }

  if (errors.length === 0 && Object.keys(patch).length === 0) {
    errors.push('No editable fields provided')
  }

  return { patch, errors }
}
