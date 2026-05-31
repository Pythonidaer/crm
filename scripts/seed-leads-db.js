import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { eq } from 'drizzle-orm'
import { getDb, closeDb } from '../api/lib/db/client.ts'
import { leads } from '../api/lib/db/schema.ts'
import { leadToRow, rowToLead } from '../api/lib/db/leadMapper.ts'
import { applyDefaults } from '../src/utils/leadValidation.ts'
import { matchKey } from '../src/utils/leadMergeKey.js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const seedFile = join(root, 'src/utils/leads/salem-leads.enriched.json')

const CRM_PRESERVE_KEYS = [
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

function isEmpty(value) {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

function mergeMissingFields(enriched, existing) {
  const merged = { ...enriched }

  for (const [key, value] of Object.entries(enriched)) {
    if (CRM_PRESERVE_KEYS.includes(key)) continue
    if (isEmpty(value) && !isEmpty(existing[key])) {
      merged[key] = existing[key]
    }
  }

  for (const key of CRM_PRESERVE_KEYS) {
    merged[key] = existing[key]
  }

  merged.id = existing.id
  merged.createdAt = existing.createdAt
  merged.updatedAt = new Date().toISOString()

  return applyDefaults(merged)
}

function mergeNewLead(raw) {
  return applyDefaults(raw)
}

async function main() {
  const raw = JSON.parse(readFileSync(seedFile, 'utf8'))
  if (!Array.isArray(raw)) {
    throw new Error(`Expected array in ${seedFile}`)
  }

  const db = getDb()
  const existingRows = await db.select().from(leads)
  const existingByKey = new Map(existingRows.map((row) => [row.seedKey, rowToLead(row)]))

  let inserted = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (const item of raw) {
    const key = matchKey(item)
    const existing = existingByKey.get(key)

    try {
      if (existing) {
        const merged = mergeMissingFields(mergeNewLead(item), existing)
        const row = leadToRow(merged, key)
        await db.update(leads).set(row).where(eq(leads.seedKey, key))
        updated += 1
      } else {
        const lead = mergeNewLead(item)
        const row = leadToRow(lead, key)
        await db.insert(leads).values(row)
        inserted += 1
      }
    } catch (err) {
      errors += 1
      console.error(`Error seeding ${item.companyName ?? key}:`, err)
    }
  }

  console.log('Seed complete')
  console.log(`  total input leads: ${raw.length}`)
  console.log(`  inserted: ${inserted}`)
  console.log(`  updated: ${updated}`)
  console.log(`  skipped: ${skipped}`)
  console.log(`  errors: ${errors}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDb()
  })
