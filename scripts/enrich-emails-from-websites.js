import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const INPUT_FILE = join(ROOT, 'src/utils/leads/salem-leads.enriched.json')
const OUT_DIR = join(ROOT, 'src/utils/enrichedData')

const OUTPUT_FILES = {
  enriched: join(OUT_DIR, 'email-enriched-leads.json'),
  review: join(OUT_DIR, 'email-review-needed.json'),
  notFound: join(OUT_DIR, 'email-not-found.json'),
  errors: join(OUT_DIR, 'email-errors.json'),
}

const REQUEST_TIMEOUT_MS = 12_000
const LEAD_TIMEOUT_MS = 35_000
const MAX_HTML_BYTES = 2_000_000
const MAX_CONTACT_PAGES = 3
const CHECKPOINT_EVERY = 25

const JUNK_LOCAL_PARTS = new Set([
  'example',
  'test',
  'noreply',
  'no-reply',
  'privacy',
  'abuse',
  'webmaster',
])

const JUNK_EMAIL_DOMAINS = new Set([
  'sentry.io',
  'sentry-next.wixpress.com',
  'wixpress.com',
  'wix.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'schema.org',
  'w3.org',
  'example.com',
  'domain.com',
  'email.com',
  'yoursite.com',
])

const USEFUL_LOCAL_PARTS = new Set([
  'info',
  'contact',
  'hello',
  'sales',
  'office',
  'admin',
  'support',
])

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',
])

const CONTACT_PATH_PATTERNS = [
  /\/contact(?:\/|$|\?|#)/i,
  /\/contact-us(?:\/|$|\?|#)/i,
  /\/about(?:\/|$|\?|#)/i,
  /\/about-us(?:\/|$|\?|#)/i,
  /\/team(?:\/|$|\?|#)/i,
]

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

const USER_AGENT =
  'JonnovativeLeadsCRM/1.0 (+https://github.com/jonnovative; email-enrichment)'

function parseArgs(argv) {
  const opts = {
    dryRun: false,
    force: false,
    write: false,
    limit: null,
    delay: 200,
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

function loadLeads() {
  if (!existsSync(INPUT_FILE)) {
    throw new Error(`Input file not found: ${INPUT_FILE}`)
  }

  const rows = JSON.parse(readFileSync(INPUT_FILE, 'utf8'))
  if (!Array.isArray(rows)) {
    throw new Error(`Expected array in ${INPUT_FILE}`)
  }

  return rows
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms: ${label}`))
    }, ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

function websiteCacheKey(rawUrl) {
  try {
    const u = new URL(rawUrl)
    u.hash = ''
    u.search = ''
    return u.href.replace(/\/$/, '').toLowerCase()
  } catch {
    return String(rawUrl).toLowerCase()
  }
}

function normalizeWebsite(raw) {
  const value = String(raw ?? '').trim()
  if (!value) return null
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.href
  } catch {
    return null
  }
}

function decodeHtmlEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
}

function deobfuscateEmails(text) {
  return text
    .replace(/\b([A-Za-z0-9._%+-]+)\s*(?:\[at\]|\(at\)|@)\s*([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/gi, '$1@$2')
    .replace(/\b([A-Za-z0-9._%+-]+)\s*(?:\[dot\]|\(dot\))\s*([A-Za-z0-9.-]+)\b/gi, '$1.$2')
}

function normalizeEmail(raw) {
  const email = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/^mailto:/i, '')
    .split('?')[0]
    .replace(/[.,;:!?)>\]}]+$/, '')

  if (!EMAIL_REGEX.test(email)) return null
  EMAIL_REGEX.lastIndex = 0

  const [local, domain] = email.split('@')
  if (!local || !domain || domain.includes('..')) return null
  if (domain.endsWith('.png') || domain.endsWith('.jpg') || domain.endsWith('.gif')) return null
  if (local.length > 64 || domain.length > 255) return null

  return `${local}@${domain}`
}

function extractEmailsFromHtml(html) {
  const found = new Set()
  const decoded = deobfuscateEmails(decodeHtmlEntities(html))

  for (const match of decoded.matchAll(EMAIL_REGEX)) {
    const normalized = normalizeEmail(match[0])
    if (normalized) found.add(normalized)
  }

  for (const match of html.matchAll(/href=["']mailto:([^"'>\s]+)/gi)) {
    const normalized = normalizeEmail(match[1])
    if (normalized) found.add(normalized)
  }

  return [...found]
}

function localPart(email) {
  return email.split('@')[0] ?? ''
}

function domainPart(email) {
  return email.split('@')[1] ?? ''
}

function isJunkEmail(email) {
  const local = localPart(email)
  const prefix = local.split('+')[0]
  const domain = domainPart(email)

  if (JUNK_LOCAL_PARTS.has(prefix)) return true
  if (JUNK_EMAIL_DOMAINS.has(domain)) return true
  if (domain.endsWith('.wixpress.com') || domain.endsWith('.sentry.io')) return true
  if (/^[0-9a-f]{20,}@/i.test(email)) return true

  return false
}

function isUsefulEmail(email) {
  const prefix = localPart(email).split('+')[0]
  return USEFUL_LOCAL_PARTS.has(prefix)
}

function isQuestionableEmail(email, websiteHost) {
  const domain = domainPart(email)
  if (FREE_EMAIL_DOMAINS.has(domain)) return true
  if (websiteHost && !domain.endsWith(websiteHost) && !websiteHost.endsWith(domain)) {
    return true
  }
  return !isUsefulEmail(email)
}

function websiteHostFromUrl(websiteUrl) {
  try {
    const host = new URL(websiteUrl).hostname.toLowerCase()
    return host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function scoreEmail(email, websiteHost) {
  let score = 0
  if (isUsefulEmail(email)) score += 100
  const domain = domainPart(email)
  if (websiteHost && (domain === websiteHost || domain.endsWith(`.${websiteHost}`))) {
    score += 50
  }
  if (FREE_EMAIL_DOMAINS.has(domain)) score -= 30
  return score
}

function pickPrimaryEmail(emails, websiteHost) {
  const filtered = emails.filter((e) => !isJunkEmail(e))
  if (filtered.length === 0) return null

  return [...filtered].sort((a, b) => scoreEmail(b, websiteHost) - scoreEmail(a, websiteHost))[0]
}

function resolveInternalUrl(href, baseUrl) {
  try {
    const resolved = new URL(href, baseUrl)
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return null
    resolved.hash = ''
    return resolved.href
  } catch {
    return null
  }
}

function isSameSite(urlA, urlB) {
  try {
    const a = new URL(urlA)
    const b = new URL(urlB)
    return a.hostname.replace(/^www\./, '') === b.hostname.replace(/^www\./, '')
  } catch {
    return false
  }
}

function findContactPageUrls(html, baseUrl) {
  const candidates = new Set()
  const hrefRegex = /href=["']([^"'#]+)["']/gi

  for (const match of html.matchAll(hrefRegex)) {
    const href = match[1]?.trim()
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue
    }

    const resolved = resolveInternalUrl(href, baseUrl)
    if (!resolved || !isSameSite(resolved, baseUrl)) continue

    const path = new URL(resolved).pathname.toLowerCase()
    if (CONTACT_PATH_PATTERNS.some((pattern) => pattern.test(path))) {
      candidates.add(resolved)
    }
  }

  return [...candidates].slice(0, MAX_CONTACT_PAGES)
}

async function fetchPage(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`)
    }

    const contentType = res.headers.get('content-type') ?? ''
    if (
      !contentType.includes('text/html') &&
      !contentType.includes('text/plain') &&
      !contentType.includes('application/xhtml')
    ) {
      throw new Error(`Non-HTML content (${contentType}) for ${url}`)
    }

    const text = await withTimeout(
      readResponseText(res),
      REQUEST_TIMEOUT_MS,
      `reading body ${url}`,
    )
    return { url: res.url || url, html: text }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Timeout fetching ${url}`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

async function readResponseText(res) {
  if (!res.body) return res.text()

  const reader = res.body.getReader()
  const chunks = []
  let total = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > MAX_HTML_BYTES) {
      await reader.cancel()
      break
    }
    chunks.push(value)
  }

  const merged = new Uint8Array(Math.min(total, MAX_HTML_BYTES))
  let offset = 0
  for (const chunk of chunks) {
    const slice =
      offset + chunk.byteLength > MAX_HTML_BYTES
        ? chunk.subarray(0, MAX_HTML_BYTES - offset)
        : chunk
    merged.set(slice, offset)
    offset += slice.byteLength
    if (offset >= MAX_HTML_BYTES) break
  }

  return new TextDecoder('utf-8', { fatal: false }).decode(merged)
}

function buildEmailFields(lead, result) {
  const now = new Date().toISOString()
  return {
    ...lead,
    email: result.email ?? lead.email ?? null,
    emailsFound: result.emailsFound ?? [],
    emailSourceUrl: result.emailSourceUrl ?? null,
    emailEnrichmentStatus: result.emailEnrichmentStatus,
    emailEnrichmentNotes: result.emailEnrichmentNotes ?? '',
    emailEnrichedAt: now,
  }
}

function classifyEmails(allEmails, websiteHost, sourceUrl) {
  const filtered = [...new Set(allEmails.map(normalizeEmail).filter(Boolean))].filter(
    (e) => !isJunkEmail(e),
  )

  if (filtered.length === 0) {
    return {
      email: null,
      emailsFound: [],
      emailSourceUrl: sourceUrl,
      emailEnrichmentStatus: 'not_found',
      emailEnrichmentNotes: 'Website checked; no public email found',
    }
  }

  const primary = pickPrimaryEmail(filtered, websiteHost)
  const questionable = filtered.filter((e) => isQuestionableEmail(e, websiteHost))
  const needsReview = filtered.length > 1 || questionable.length > 0

  const notes = []
  if (filtered.length > 1) notes.push(`${filtered.length} emails found`)
  if (questionable.length > 0) notes.push('Some emails may not be primary business contacts')

  if (needsReview) {
    return {
      email: primary,
      emailsFound: filtered,
      emailSourceUrl: sourceUrl,
      emailEnrichmentStatus: 'review_needed',
      emailEnrichmentNotes: notes.join('; '),
    }
  }

  return {
    email: primary,
    emailsFound: filtered,
    emailSourceUrl: sourceUrl,
    emailEnrichmentStatus: 'found',
    emailEnrichmentNotes: '',
  }
}

async function scrapeWebsiteEmails(website) {
  const websiteHost = websiteHostFromUrl(website)
  const emailsBySource = new Map()
  const pagesFetched = []

  const homepage = await fetchPage(website)
  pagesFetched.push(homepage.url)
  const homepageEmails = extractEmailsFromHtml(homepage.html)
  if (homepageEmails.length > 0) emailsBySource.set(homepage.url, homepageEmails)

  const contactUrls = findContactPageUrls(homepage.html, homepage.url)
  for (const contactUrl of contactUrls) {
    if (pagesFetched.includes(contactUrl)) continue
    try {
      const page = await fetchPage(contactUrl)
      pagesFetched.push(page.url)
      const emails = extractEmailsFromHtml(page.html)
      if (emails.length > 0) emailsBySource.set(page.url, emails)
    } catch {
      // Contact page fetch failures are non-fatal; homepage may already have email
    }
  }

  const allEmails = [...new Set([...emailsBySource.values()].flat())]
  let sourceUrl = homepage.url
  for (const [url, emails] of emailsBySource) {
    if (emails.includes(pickPrimaryEmail(allEmails, websiteHost) ?? '')) {
      sourceUrl = url
      break
    }
  }

  return classifyEmails(allEmails, websiteHost, sourceUrl)
}

async function enrichLeadFromWebsite(lead, websiteCache) {
  const website = normalizeWebsite(lead.website)
  if (!website) {
    return buildEmailFields(lead, {
      emailEnrichmentStatus: 'skipped_no_website',
      emailEnrichmentNotes: 'No website on record',
      emailsFound: [],
      emailSourceUrl: null,
    })
  }

  const cacheKey = websiteCacheKey(website)
  const cached = websiteCache.get(cacheKey)
  if (cached) {
    if (cached.error) throw new Error(cached.error)
    return buildEmailFields(lead, cached.result)
  }

  const result = await withTimeout(
    scrapeWebsiteEmails(website),
    LEAD_TIMEOUT_MS,
    lead.companyName,
  )
  websiteCache.set(cacheKey, { result })
  return buildEmailFields(lead, result)
}

function shouldSkipLead(lead, force) {
  if (force) return false
  if (lead.email) return true
  const status = lead.emailEnrichmentStatus
  if (status && status !== 'error') return true
  return false
}

function removeLeadFromBuckets(buckets, leadId) {
  for (const name of Object.keys(buckets)) {
    buckets[name] = buckets[name].filter((row) => row.id !== leadId)
  }
}

function bucketForStatus(status) {
  switch (status) {
    case 'found':
      return 'enriched'
    case 'review_needed':
      return 'review'
    case 'not_found':
      return 'notFound'
    case 'error':
      return 'errors'
    default:
      return null
  }
}

function writeBuckets(buckets) {
  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUTPUT_FILES.enriched, `${JSON.stringify(buckets.enriched, null, 2)}\n`)
  writeFileSync(OUTPUT_FILES.review, `${JSON.stringify(buckets.review, null, 2)}\n`)
  writeFileSync(OUTPUT_FILES.notFound, `${JSON.stringify(buckets.notFound, null, 2)}\n`)
  writeFileSync(OUTPUT_FILES.errors, `${JSON.stringify(buckets.errors, null, 2)}\n`)
}

function bucketCounts(buckets) {
  return {
    found: buckets.enriched.length,
    review_needed: buckets.review.length,
    not_found: buckets.notFound.length,
    errors: buckets.errors.length,
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const allLeads = loadLeads()
  const toProcess = opts.limit != null ? allLeads.slice(0, opts.limit) : allLeads
  const shouldWrite = !opts.dryRun || opts.write

  const buckets = {
    enriched: loadOutputBucket(OUTPUT_FILES.enriched),
    review: loadOutputBucket(OUTPUT_FILES.review),
    notFound: loadOutputBucket(OUTPUT_FILES.notFound),
    errors: loadOutputBucket(OUTPUT_FILES.errors),
  }

  const stats = {
    total: allLeads.length,
    checked: 0,
    skippedNoWebsite: 0,
    skippedExisting: 0,
    found: 0,
    reviewNeeded: 0,
    notFound: 0,
    errors: 0,
    processedSinceCheckpoint: 0,
  }

  let checkpointPending = false

  function maybeCheckpoint(force = false) {
    if (!shouldWrite) return
    if (!force && stats.processedSinceCheckpoint < CHECKPOINT_EVERY) return
    writeBuckets(buckets)
    stats.processedSinceCheckpoint = 0
    checkpointPending = false
    const counts = bucketCounts(buckets)
    console.log(
      `  [checkpoint] saved buckets — found: ${counts.found}, review: ${counts.review_needed}, not_found: ${counts.not_found}, errors: ${counts.errors}`,
    )
  }

  function handleExitSignal(signal) {
    if (shouldWrite) {
      console.log(`\n${signal} — saving progress before exit…`)
      writeBuckets(buckets)
    }
    process.exit(signal === 'SIGINT' ? 130 : 143)
  }

  if (shouldWrite) {
    process.on('SIGINT', () => handleExitSignal('SIGINT'))
    process.on('SIGTERM', () => handleExitSignal('SIGTERM'))
  }

  const websiteCache = new Map()
  let lastProgressAt = Date.now()

  function logSlowProgress(index, total, companyName, detail) {
    const now = Date.now()
    if (now - lastProgressAt > 10_000) {
      console.log(`  … still working (${index}/${total}) ${companyName}${detail ? ` — ${detail}` : ''}`)
      lastProgressAt = now
    }
  }

  console.log(
    `Starting email enrichment (${toProcess.length} of ${allLeads.length} lead${allLeads.length === 1 ? '' : 's'})${
      opts.dryRun ? ' [DRY RUN]' : ''
    }${opts.force ? ' [FORCE]' : ''}`,
  )

  let index = 0
  for (const lead of toProcess) {
    index++

    if (shouldSkipLead(lead, opts.force)) {
      stats.skippedExisting++
      console.log(`[${index}/${toProcess.length}] ${lead.companyName} → skipped (existing email enrichment)`)
      continue
    }

    const website = normalizeWebsite(lead.website)
    if (!website) {
      stats.skippedNoWebsite++
      const record = buildEmailFields(lead, {
        emailEnrichmentStatus: 'skipped_no_website',
        emailEnrichmentNotes: 'No website on record',
        emailsFound: [],
        emailSourceUrl: null,
      })
      console.log(`[${index}/${toProcess.length}] ${lead.companyName} → skipped_no_website`)
      if (shouldWrite && lead.id) {
        removeLeadFromBuckets(buckets, lead.id)
      }
      continue
    }

    stats.checked++
    lastProgressAt = Date.now()
    const cacheKey = websiteCacheKey(website)
    const cacheHit = websiteCache.has(cacheKey)

    try {
      if (!cacheHit) {
        console.log(`[${index}/${toProcess.length}] ${lead.companyName} → fetching ${website}`)
      }

      const record = await enrichLeadFromWebsite(lead, websiteCache)
      const status = record.emailEnrichmentStatus

      if (status === 'found') stats.found++
      else if (status === 'review_needed') stats.reviewNeeded++
      else if (status === 'not_found') stats.notFound++

      const bucketName = bucketForStatus(status)
      if (shouldWrite && bucketName && lead.id) {
        removeLeadFromBuckets(buckets, lead.id)
        buckets[bucketName].push(record)
      }

      const emailHint = record.email ? ` (${record.email})` : ''
      const cacheHint = cacheHit ? ' [cached]' : ''
      console.log(`[${index}/${toProcess.length}] ${lead.companyName} → ${status}${emailHint}${cacheHint}`)
      stats.processedSinceCheckpoint++
      checkpointPending = true
      maybeCheckpoint()
    } catch (err) {
      stats.errors++
      const message = err instanceof Error ? err.message : String(err)
      websiteCache.set(cacheKey, { error: message })
      const record = buildEmailFields(lead, {
        emailEnrichmentStatus: 'error',
        emailEnrichmentNotes: message,
        emailsFound: [],
        emailSourceUrl: website,
      })

      if (shouldWrite && lead.id) {
        removeLeadFromBuckets(buckets, lead.id)
        buckets.errors.push(record)
      }

      console.log(`[${index}/${toProcess.length}] ${lead.companyName} → error (${message})`)
      stats.processedSinceCheckpoint++
      checkpointPending = true
      maybeCheckpoint()
    }

    await sleep(opts.delay)
    logSlowProgress(index, toProcess.length, lead.companyName, cacheHit ? 'cached' : website)
  }

  if (shouldWrite) {
    maybeCheckpoint(true)

    console.log('\nWrote output files:')
    for (const file of Object.values(OUTPUT_FILES)) {
      console.log(`  ${file}`)
    }

    console.log('\nRunning merge into salem-leads.enriched.json…')
    const { spawnSync } = await import('node:child_process')
    const merge = spawnSync('node', ['scripts/merge-enriched-leads.js'], {
      cwd: ROOT,
      stdio: 'inherit',
    })
    if (merge.status !== 0) {
      console.error('Merge failed — run manually: node scripts/merge-enriched-leads.js')
      process.exit(merge.status ?? 1)
    }
  } else {
    console.log('\nDry run complete — no files written (use --write to persist during dry run).')
  }

  console.log('\nSummary:')
  console.log(`  total leads:        ${stats.total}`)
  console.log(`  checked:            ${stats.checked}`)
  console.log(`  skipped no website: ${stats.skippedNoWebsite}`)
  console.log(`  skipped existing:   ${stats.skippedExisting}`)
  console.log(`  found:              ${stats.found}`)
  console.log(`  review needed:      ${stats.reviewNeeded}`)
  console.log(`  not found:          ${stats.notFound}`)
  console.log(`  errors:             ${stats.errors}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
