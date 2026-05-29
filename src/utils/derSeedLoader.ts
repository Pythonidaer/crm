import type { Lead } from '../types/lead'
import { importLeads } from './leadImportExport'
import { getLeads, saveLeads } from './leadStorage'

const derSeedFiles = import.meta.glob<Partial<Lead>[]>(
  './derData/*.json',
  { eager: true, import: 'default' },
)

/** Load all DER seed JSON files into localStorage, skipping duplicates. */
export function seedFromDerDataFiles(): number {
  let current = getLeads()
  let added = 0

  for (const rows of Object.values(derSeedFiles)) {
    const { imported } = importLeads(JSON.stringify(rows), current)
    if (imported.length > 0) {
      current = [...current, ...imported]
      added += imported.length
    }
  }

  if (added > 0) saveLeads(current)
  return added
}

/** On first visit (empty CRM), auto-load any DER seed JSON files. */
export function seedDerDataIfEmpty(): number {
  if (getLeads().length > 0) return 0
  return seedFromDerDataFiles()
}

export function listDerSeedFiles(): string[] {
  return Object.keys(derSeedFiles).map((p) => p.replace('./derData/', ''))
}
