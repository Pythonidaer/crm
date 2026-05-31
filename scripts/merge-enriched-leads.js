import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { createHash } from 'crypto'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { matchKey } from '../src/utils/leadMergeKey.js'
import {
  resolveDisplayName,
  scoreLeadFit,
} from '../src/utils/leadScoring.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DER_DIR = join(ROOT, 'src/utils/derData')
const ENRICHED_DIR = join(ROOT, 'src/utils/enrichedData')
const OUT_DIR = join(ROOT, 'src/utils/leads')
const OUT_FILE = join(OUT_DIR, 'salem-leads.enriched.json')

const ENRICHMENT_SOURCES = [
  { file: 'google-places-errors.json', status: 'error' },
  { file: 'google-places-not-found.json', status: 'not_found' },
  { file: 'google-places-review-needed.json', status: 'review_needed' },
  { file: 'google-places-enriched.json', status: 'matched' },
]

const EMAIL_ENRICHMENT_SOURCES = [
  'email-errors.json',
  'email-not-found.json',
  'email-review-needed.json',
  'email-enriched-leads.json',
]

function stableId(key) {
  const hash = createHash('sha256').update(key).digest('hex').slice(0, 12)
  return `lead-${hash}`
}

function readJsonArray(filePath) {
  if (!existsSync(filePath)) return []
  const parsed = JSON.parse(readFileSync(filePath, 'utf8'))
  return Array.isArray(parsed) ? parsed : []
}

function mapEnrichmentStatus(rowStatus, bucketStatus) {
  if (rowStatus === 'enriched') return 'matched'
  if (rowStatus === 'matched') return 'matched'
  if (rowStatus) return rowStatus
  return bucketStatus
}

function loadDerLeads() {
  const files = readdirSync(DER_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  const leads = []
  const seen = new Set()

  for (const file of files) {
    for (const row of readJsonArray(join(DER_DIR, file))) {
      const lead = {
        companyName: String(row.companyName ?? '').trim(),
        address: String(row.address ?? '').trim(),
        city: String(row.city ?? '').trim(),
        state: String(row.state ?? 'MA').trim() || 'MA',
        sector: String(row.sector ?? '').trim(),
        sourceUrl: String(row.sourceUrl ?? '').trim(),
        email: row.email ?? null,
      }

      if (!lead.companyName || !lead.city) continue

      const key = matchKey(lead)
      if (seen.has(key)) continue
      seen.add(key)
      leads.push(lead)
    }
  }

  return leads
}

function loadEnrichmentMap() {
  const map = new Map()
  const counts = {
    matched: 0,
    review_needed: 0,
    not_found: 0,
    error: 0,
  }

  for (const source of ENRICHMENT_SOURCES) {
    const rows = readJsonArray(join(ENRICHED_DIR, source.file))
    for (const row of rows) {
      if (!row.companyName) continue
      const key = matchKey(row)
      const status = mapEnrichmentStatus(row.enrichmentStatus, source.status)
      map.set(key, {
        ...row,
        enrichmentStatus: status,
      })
      counts[status] = (counts[status] ?? 0) + 1
    }
  }

  return { map, counts }
}

function loadEmailEnrichmentMap() {
  const map = new Map()
  const counts = {}

  for (const file of EMAIL_ENRICHMENT_SOURCES) {
    const rows = readJsonArray(join(ENRICHED_DIR, file))
    for (const row of rows) {
      if (!row.companyName) continue
      const key = matchKey(row)
      const status = row.emailEnrichmentStatus ?? 'unknown'
      map.set(key, row)
      counts[status] = (counts[status] ?? 0) + 1
    }
  }

  return { map, counts }
}

function mergeEmailFields(der, emailEnrichment) {
  const preservedEmail = der.email ?? null
  const enrichedPrimary = emailEnrichment?.email ?? null
  const emailsFound = Array.isArray(emailEnrichment?.emailsFound)
    ? emailEnrichment.emailsFound.filter(Boolean)
    : []

  return {
    email: preservedEmail ?? enrichedPrimary ?? null,
    emailsFound,
    emailSourceUrl: emailEnrichment?.emailSourceUrl ?? null,
    emailEnrichmentStatus: emailEnrichment?.emailEnrichmentStatus ?? null,
    emailEnrichmentNotes: emailEnrichment?.emailEnrichmentNotes ?? null,
    emailEnrichedAt: emailEnrichment?.emailEnrichedAt ?? null,
  }
}

function mergeLead(der, enrichment, emailEnrichment) {
  const now = new Date().toISOString()
  const key = matchKey(der)
  const googleDisplayName = enrichment?.googleDisplayName ?? null
  const enrichmentStatus = enrichment?.enrichmentStatus ?? 'not_enriched'
  const emailFields = mergeEmailFields(der, emailEnrichment)

  const merged = {
    id: stableId(key),
    companyName: der.companyName,
    displayName: resolveDisplayName(googleDisplayName, der.companyName),
    googleDisplayName,
    address: der.address,
    googleFormattedAddress: enrichment?.googleFormattedAddress ?? null,
    city: der.city,
    state: der.state,
    sector: der.sector,
    phoneNumber: enrichment?.phoneNumber ?? null,
    internationalPhoneNumber: enrichment?.internationalPhoneNumber ?? null,
    website: enrichment?.website ?? null,
    ...emailFields,
    googlePlaceId: enrichment?.googlePlaceId ?? null,
    googleMapsUri: enrichment?.googleMapsUri ?? null,
    businessStatus: enrichment?.businessStatus ?? null,
    matchConfidence: enrichment?.matchConfidence ?? null,
    matchScore: enrichment?.matchScore ?? null,
    enrichmentStatus,
    enrichmentNotes: enrichment?.enrichmentNotes ?? null,
    sourceUrl: der.sourceUrl,
    dataSource: enrichment?.dataSource ?? 'der',
    lastEnrichedAt: enrichment?.lastEnrichedAt ?? null,
    createdAt: now,
    updatedAt: now,
    status: 'not_contacted',
    priority: 'medium',
    contactName: '',
    contactRole: '',
    contactEmail: '',
    lastContactedAt: '',
    nextFollowUpAt: '',
    notes: '',
    qualification: {
      hasWebsite: Boolean(enrichment?.website),
      websiteNeedsWork: false,
      accessibilityOpportunity: false,
      seoOpportunity: false,
      aeoOpportunity: false,
      decisionMakerFound: false,
    },
  }

  const fit = scoreLeadFit(merged)
  merged.leadFitScore = fit.leadFitScore
  merged.leadFitTier = fit.leadFitTier
  merged.disqualificationReason = fit.disqualificationReason

  return merged
}

function countByStatus(leads) {
  return leads.reduce((acc, lead) => {
    const status = lead.enrichmentStatus ?? 'unknown'
    acc[status] = (acc[status] ?? 0) + 1
    return acc
  }, {})
}

function main() {
  const derLeads = loadDerLeads()
  const { map: enrichmentMap, counts: sourceCounts } = loadEnrichmentMap()
  const { map: emailEnrichmentMap, counts: emailSourceCounts } = loadEmailEnrichmentMap()

  const merged = derLeads.map((der) => {
    const key = matchKey(der)
    return mergeLead(der, enrichmentMap.get(key), emailEnrichmentMap.get(key))
  })

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, `${JSON.stringify(merged, null, 2)}\n`)

  const statusCounts = countByStatus(merged)
  const withPhone = merged.filter((l) => l.phoneNumber || l.internationalPhoneNumber).length
  const withWebsite = merged.filter((l) => l.website).length
  const withMatchConfidence = merged.filter((l) => l.matchConfidence).length
  const withEmail = merged.filter((l) => l.email).length
  const withEmailEnrichment = merged.filter((l) => l.emailEnrichmentStatus).length

  console.log('Merge summary')
  console.log(`  Total DER leads:              ${derLeads.length}`)
  console.log(`  Source file matches:`)
  console.log(`    matched (enriched file):      ${sourceCounts.matched ?? 0}`)
  console.log(`    review_needed:                ${sourceCounts.review_needed ?? 0}`)
  console.log(`    not_found:                    ${sourceCounts.not_found ?? 0}`)
  console.log(`    error:                        ${sourceCounts.error ?? 0}`)
  console.log(`  Email enrichment matches:`)
  for (const [status, count] of Object.entries(emailSourceCounts).sort()) {
    console.log(`    ${status}: ${count}`)
  }
  console.log(`  Total final output records:   ${merged.length}`)
  console.log(`  With phone:                   ${withPhone}`)
  console.log(`  With website:                 ${withWebsite}`)
  console.log(`  With email:                   ${withEmail}`)
  console.log(`  With email enrichment:        ${withEmailEnrichment}`)
  console.log(`  With matchConfidence:         ${withMatchConfidence}`)
  console.log(`  By enrichmentStatus:`)
  for (const [status, count] of Object.entries(statusCounts).sort()) {
    console.log(`    ${status}: ${count}`)
  }
  console.log(`\nWrote ${OUT_FILE}`)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) main()

export { matchKey }
