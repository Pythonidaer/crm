import { importLeads } from './leadImportExport'
import { getLeads, saveLeads } from './leadStorage'
import { applyDefaults } from './leadValidation'
import { matchKey } from './leadMergeKey.js'
import enrichedLeads from './leads/salem-leads.enriched.json'
import type { Lead } from '../types/lead'

export const ENRICHED_DATA_VERSION = '2'

const CRM_PRESERVE_KEYS: (keyof Lead)[] = [
  'status',
  'priority',
  'contactName',
  'contactRole',
  'contactEmail',
  'lastContactedAt',
  'nextFollowUpAt',
  'notes',
  'qualification',
]

function mergeCrmFields(enriched: Partial<Lead>, existing: Lead): Lead {
  const preserved = Object.fromEntries(
    CRM_PRESERVE_KEYS.map((key) => [key, existing[key]]),
  ) as Partial<Lead>

  return applyDefaults({
    ...enriched,
    ...preserved,
    id: enriched.id ?? existing.id,
    createdAt: existing.createdAt,
  })
}

/** Replace local leads with merged enriched dataset, preserving CRM workflow fields. */
export function syncEnrichedDataset(): number {
  const storedVersion = localStorage.getItem('jonnovative_crm_enriched_version')
  if (storedVersion === ENRICHED_DATA_VERSION) return 0

  const existing = getLeads()
  const existingByKey = new Map(existing.map((lead) => [matchKey(lead), lead]))

  const synced = (enrichedLeads as Partial<Lead>[]).map((raw) => {
    const prev = existingByKey.get(matchKey(raw))
    return prev ? mergeCrmFields(raw, prev) : applyDefaults(raw)
  })

  saveLeads(synced)
  localStorage.setItem('jonnovative_crm_enriched_version', ENRICHED_DATA_VERSION)
  return synced.length
}

/** Load the merged enriched Salem dataset into localStorage, skipping duplicates. */
export function seedFromEnrichedLeads(): number {
  let current = getLeads()
  const { imported } = importLeads(JSON.stringify(enrichedLeads), current)
  if (imported.length === 0) return 0
  saveLeads([...current, ...imported])
  localStorage.setItem('jonnovative_crm_enriched_version', ENRICHED_DATA_VERSION)
  return imported.length
}

/** Sync enriched dataset or seed on first visit. */
export function seedEnrichedLeadsIfEmpty(): number {
  if (getLeads().length === 0) return seedFromEnrichedLeads()
  return syncEnrichedDataset()
}

/** @deprecated Use seedFromEnrichedLeads */
export function seedFromDerDataFiles(): number {
  return seedFromEnrichedLeads()
}

/** @deprecated Use seedEnrichedLeadsIfEmpty */
export function seedDerDataIfEmpty(): number {
  return seedEnrichedLeadsIfEmpty()
}

export function listDerSeedFiles(): string[] {
  return ['salem-leads.enriched.json']
}

export function getEnrichedLeadCount(): number {
  return enrichedLeads.length
}

export { matchKey }
