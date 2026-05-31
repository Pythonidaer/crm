import { importLeads } from './leadImportExport'
import { getLeads, saveLeads } from './leadStorage'
import { applyDefaults } from './leadValidation'
import { hasEmail } from './leadFilters'
import { matchKey } from './leadMergeKey.js'
import enrichedLeads from './leads/salem-leads.enriched.json'
import type { Lead } from '../types/lead'

export const ENRICHED_DATA_VERSION = '7'

function emailEnrichmentFingerprint(leads: Lead[]): string {
  return leads
    .filter((l) => l.emailEnrichmentStatus)
    .map(
      (l) =>
        `${l.id}|${l.emailEnrichmentStatus}|${l.email ?? ''}|${(l.emailsFound ?? []).join(',')}`,
    )
    .sort()
    .join('\n')
}

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

function bundledLeads(): Lead[] {
  return (enrichedLeads as Partial<Lead>[]).map((raw) => applyDefaults(raw))
}

function countEmailEnrichment(leads: Lead[]) {
  return {
    withEmail: leads.filter((l) => hasEmail(l)).length,
    withStatus: leads.filter((l) => l.emailEnrichmentStatus).length,
  }
}

/** True when bundled JSON has email enrichment that localStorage is missing. */
export function bundledEmailDataIsNewer(stored: Lead[]): boolean {
  const bundled = bundledLeads()
  const bundledCounts = countEmailEnrichment(bundled)
  const localCounts = countEmailEnrichment(stored)

  if (bundledCounts.withEmail > localCounts.withEmail) return true
  if (bundledCounts.withStatus > localCounts.withStatus) return true
  if (emailEnrichmentFingerprint(bundled) !== emailEnrichmentFingerprint(stored)) return true

  return false
}

export function shouldSyncEnrichedDataset(storedVersion: string | null, stored: Lead[]): boolean {
  if (stored.length === 0) return true
  if (storedVersion !== ENRICHED_DATA_VERSION) return true
  return bundledEmailDataIsNewer(stored)
}

/** Replace local leads with merged enriched dataset, preserving CRM workflow fields. */
export function syncEnrichedDataset(): number {
  const storedVersion = localStorage.getItem('jonnovative_crm_enriched_version')
  const existing = getLeads()

  if (!shouldSyncEnrichedDataset(storedVersion, existing)) return 0

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
  const current = getLeads()
  if (current.length === 0) {
    const synced = bundledLeads()
    saveLeads(synced)
    localStorage.setItem('jonnovative_crm_enriched_version', ENRICHED_DATA_VERSION)
    return synced.length
  }

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
