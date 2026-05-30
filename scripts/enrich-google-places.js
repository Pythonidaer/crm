import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DER_DIR = join(ROOT, 'src/utils/derData')
const OUT_DIR = join(ROOT, 'src/utils/enrichedData')

const OUTPUT_FILES = {
  enriched: join(OUT_DIR, 'google-places-enriched.json'),
  review: join(OUT_DIR, 'google-places-review-needed.json'),
  notFound: join(OUT_DIR, 'google-places-not-found.json'),
  errors: join(OUT_DIR, 'google-places-errors.json'),
}

const TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'
const TEXT_SEARCH_MASK = 'places.id,places.displayName,places.formattedAddress'
const DETAILS_MASK =
  'id,displayName,formattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsUri,businessStatus'

function loadEnvLocal() {
  const envPath = join(ROOT, '.env.local')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    force: false,
    write: false,
    limit: null,
    delay: 250,
  }

  for (const arg of argv.filter((a) => a !== '--')) {
    if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--force') opts.force = true
    else if (arg === '--write') opts.write = true
    else if (arg.startsWith('--limit=')) {
      opts.limit = Number.parseInt(arg.slice('--limit='.length), 10)
    } else if (arg.startsWith('--delay=')) {
      opts.delay = Number.parseInt(arg.slice('--delay='.length), 10)
    }
  }

  if (opts.dryRun && opts.limit == null) opts.limit = 10

  return opts
}

function dedupeKey(lead) {
  return [lead.companyName, lead.address, lead.city, lead.state]
    .map((s) => String(s ?? '').trim().toLowerCase())
    .join('|')
}

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  const normalized = normalizeText(value)
  if (!normalized) return []
  return normalized.split(' ').filter((t) => t.length > 1)
}

function jaccardSimilarity(aTokens, bTokens) {
  if (aTokens.length === 0 || bTokens.length === 0) return 0
  const aSet = new Set(aTokens)
  const bSet = new Set(bTokens)
  let intersection = 0
  for (const token of aSet) {
    if (bSet.has(token)) intersection++
  }
  const union = aSet.size + bSet.size - intersection
  return union === 0 ? 0 : intersection / union
}

function cityMatches(leadCity, googleAddress) {
  const city = normalizeText(leadCity)
  const address = normalizeText(googleAddress)
  if (!city || !address) return false
  return address.includes(city)
}

function scoreMatch(lead, googleDisplayName, googleFormattedAddress) {
  const cityOk = cityMatches(lead.city, googleFormattedAddress)
  const nameSim = jaccardSimilarity(
    tokenize(lead.companyName),
    tokenize(googleDisplayName),
  )
  const addressSim = jaccardSimilarity(
    tokenize(lead.address),
    tokenize(googleFormattedAddress),
  )

  let score = 0
  if (cityOk) score += 40
  score += Math.round(nameSim * 40)
  score += Math.round(addressSim * 20)

  let matchConfidence = 'low'
  if (score >= 75 && cityOk) matchConfidence = 'high'
  else if (score >= 45) matchConfidence = 'medium'

  const notes = []
  if (!cityOk) notes.push('City mismatch between DER and Google address')
  if (nameSim < 0.35) notes.push('Company name similarity is weak')
  if (addressSim < 0.2 && lead.address) notes.push('Street address similarity is weak')

  return { score, matchConfidence, enrichmentNotes: notes.join('; ') }
}

function displayNameText(displayName) {
  if (!displayName) return ''
  if (typeof displayName === 'string') return displayName
  return displayName.text ?? ''
}

function loadDerLeads() {
  const files = readdirSync(DER_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()

  const leads = []
  const seen = new Set()

  for (const file of files) {
    const rows = JSON.parse(readFileSync(join(DER_DIR, file), 'utf8'))
    if (!Array.isArray(rows)) continue

    for (const row of rows) {
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

      const key = dedupeKey(lead)
      if (seen.has(key)) continue
      seen.add(key)
      leads.push({ ...lead, _key: key })
    }
  }

  return leads
}

function loadExistingEnriched() {
  const map = new Map()
  if (!existsSync(OUTPUT_FILES.enriched)) return map

  try {
    const rows = JSON.parse(readFileSync(OUTPUT_FILES.enriched, 'utf8'))
    if (!Array.isArray(rows)) return map
    for (const row of rows) {
      const key = dedupeKey(row)
      if (row.googlePlaceId) map.set(key, row)
    }
  } catch {
    // ignore corrupt file; will be rewritten on next full run
  }

  return map
}

function loadOutputBucket(filePath) {
  if (!existsSync(filePath)) return []
  try {
    const rows = JSON.parse(readFileSync(filePath, 'utf8'))
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
}

function buildSearchQuery(lead) {
  return [lead.companyName, lead.address, lead.city, lead.state]
    .filter(Boolean)
    .join(' ')
}

function baseRecord(lead, now) {
  return {
    companyName: lead.companyName,
    address: lead.address,
    city: lead.city,
    state: lead.state,
    sector: lead.sector,
    sourceUrl: lead.sourceUrl,
    email: lead.email ?? null,
    lastEnrichedAt: now,
    dataSource: 'google_places',
  }
}

function buildEnrichedRecord(lead, details, match, now) {
  const record = {
    ...baseRecord(lead, now),
    googlePlaceId: details.id ?? null,
    googleDisplayName: displayNameText(details.displayName),
    googleFormattedAddress: details.formattedAddress ?? null,
    internationalPhoneNumber: details.internationalPhoneNumber ?? null,
    googleMapsUri: details.googleMapsUri ?? null,
    businessStatus: details.businessStatus ?? null,
    matchConfidence: match.matchConfidence,
    matchScore: match.score,
    enrichmentNotes: match.enrichmentNotes,
  }

  if (match.matchConfidence === 'high') {
    record.phoneNumber = details.nationalPhoneNumber ?? null
    record.website = details.websiteUri ?? null
    record.enrichmentStatus = 'enriched'
  } else if (match.matchConfidence === 'medium') {
    record.phoneNumber = details.nationalPhoneNumber ?? null
    record.website = details.websiteUri ?? null
    record.enrichmentStatus = 'review_needed'
    record.enrichmentNotes = [record.enrichmentNotes, 'Medium confidence — review before use']
      .filter(Boolean)
      .join('; ')
  } else {
    record.phoneNumber = null
    record.website = null
    record.enrichmentStatus = 'review_needed'
    record.enrichmentNotes = [record.enrichmentNotes, 'Low confidence — contact fields withheld']
      .filter(Boolean)
      .join('; ')
  }

  return record
}

async function textSearch(apiKey, textQuery) {
  const res = await fetch(TEXT_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': TEXT_SEARCH_MASK,
    },
    body: JSON.stringify({ textQuery }),
  })

  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Text Search failed (${res.status})`)
  }

  return body.places?.[0] ?? null
}

async function placeDetails(apiKey, placeId) {
  const resource = placeId.startsWith('places/') ? placeId : `places/${placeId}`
  const url = `https://places.googleapis.com/v1/${resource}`

  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': DETAILS_MASK,
    },
  })

  const body = await res.json()
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Place Details failed (${res.status})`)
  }

  return body
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function removeFromBuckets(buckets, key) {
  for (const name of Object.keys(buckets)) {
    buckets[name] = buckets[name].filter((row) => dedupeKey(row) !== key)
  }
}

async function main() {
  loadEnvLocal()

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error('Missing GOOGLE_MAPS_API_KEY. Add it to .env.local and retry.')
    process.exit(1)
  }

  const opts = parseArgs(process.argv.slice(2))
  const allLeads = loadDerLeads()
  const existingEnriched = loadExistingEnriched()

  const toProcess =
    opts.limit != null ? allLeads.slice(0, opts.limit) : allLeads

  const shouldWrite = !opts.dryRun || opts.write

  const buckets = {
    enriched: loadOutputBucket(OUTPUT_FILES.enriched),
    review: loadOutputBucket(OUTPUT_FILES.review),
    notFound: loadOutputBucket(OUTPUT_FILES.notFound),
    errors: loadOutputBucket(OUTPUT_FILES.errors),
  }

  const runResults = {
    enriched: [],
    review: [],
    notFound: [],
    errors: [],
    skipped: 0,
  }

  const total = toProcess.length
  let index = 0

  console.log(
    `Starting Google Places enrichment (${total} lead${total === 1 ? '' : 's'})${
      opts.dryRun ? ' [DRY RUN]' : ''
    }${opts.force ? ' [FORCE]' : ''}`,
  )

  for (const lead of toProcess) {
    index++
    const key = lead._key

    if (!opts.force && existingEnriched.has(key)) {
      runResults.skipped++
      console.log(`[${index}/${total}] ${lead.companyName} → skipped (already enriched)`)
      continue
    }

    const textQuery = buildSearchQuery(lead)

    try {
      const searchHit = await textSearch(apiKey, textQuery)

      if (!searchHit?.id) {
        const record = {
          ...baseRecord(lead, new Date().toISOString()),
          enrichmentStatus: 'not_found',
          enrichmentNotes: 'No Google Places result for search query',
          matchConfidence: null,
          matchScore: null,
          googlePlaceId: null,
          googleDisplayName: null,
          googleFormattedAddress: null,
          phoneNumber: null,
          internationalPhoneNumber: null,
          website: null,
          googleMapsUri: null,
          businessStatus: null,
        }
        runResults.notFound.push(record)
        removeFromBuckets(buckets, key)
        buckets.notFound.push(record)
        console.log(`[${index}/${total}] ${lead.companyName} → not_found`)
        await sleep(opts.delay)
        continue
      }

      const details = await placeDetails(apiKey, searchHit.id)
      const match = scoreMatch(
        lead,
        displayNameText(details.displayName ?? searchHit.displayName),
        details.formattedAddress ?? searchHit.formattedAddress,
      )

      const record = buildEnrichedRecord(lead, details, match, new Date().toISOString())

      removeFromBuckets(buckets, key)

      if (match.matchConfidence === 'high') {
        runResults.enriched.push(record)
        buckets.enriched.push(record)
        console.log(
          `[${index}/${total}] ${lead.companyName} → enriched (${match.matchConfidence}, score ${match.score})`,
        )
      } else {
        runResults.review.push(record)
        buckets.review.push(record)
        console.log(
          `[${index}/${total}] ${lead.companyName} → review_needed (${match.matchConfidence}, score ${match.score})`,
        )
      }
    } catch (err) {
      const record = {
        ...baseRecord(lead, new Date().toISOString()),
        enrichmentStatus: 'error',
        enrichmentNotes: err instanceof Error ? err.message : String(err),
        matchConfidence: null,
        matchScore: null,
        googlePlaceId: null,
        googleDisplayName: null,
        googleFormattedAddress: null,
        phoneNumber: null,
        internationalPhoneNumber: null,
        website: null,
        googleMapsUri: null,
        businessStatus: null,
      }
      runResults.errors.push(record)
      removeFromBuckets(buckets, key)
      buckets.errors.push(record)
      console.log(`[${index}/${total}] ${lead.companyName} → error (${record.enrichmentNotes})`)
    }

    await sleep(opts.delay)
  }

  if (shouldWrite) {
    mkdirSync(OUT_DIR, { recursive: true })

    writeFileSync(OUTPUT_FILES.enriched, `${JSON.stringify(buckets.enriched, null, 2)}\n`)
    writeFileSync(OUTPUT_FILES.review, `${JSON.stringify(buckets.review, null, 2)}\n`)
    writeFileSync(OUTPUT_FILES.notFound, `${JSON.stringify(buckets.notFound, null, 2)}\n`)
    writeFileSync(OUTPUT_FILES.errors, `${JSON.stringify(buckets.errors, null, 2)}\n`)

    console.log('\nWrote output files:')
    for (const file of Object.values(OUTPUT_FILES)) {
      console.log(`  ${file}`)
    }
  } else {
    console.log('\nDry run complete — no files written (use --write to persist during dry run).')
  }

  console.log('\nSummary:')
  console.log(`  enriched:     ${runResults.enriched.length}`)
  console.log(`  review:       ${runResults.review.length}`)
  console.log(`  not_found:    ${runResults.notFound.length}`)
  console.log(`  errors:       ${runResults.errors.length}`)
  console.log(`  skipped:      ${runResults.skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
