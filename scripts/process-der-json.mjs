import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const [inputPath, outputPath, sectorSlug] = process.argv.slice(2)
if (!inputPath || !outputPath || !sectorSlug) {
  console.error('Usage: node process-der-json.mjs <raw.json> <out.json> <sector-slug>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(inputPath, 'utf8'))
const sector = raw[0]?.industry ?? raw[0]?.sector ?? sectorSlug
const sourceUrl = raw[0]?.sourceUrl ?? ''

function dedupeKey(entry) {
  return [entry.companyName, entry.city, entry.address]
    .map((s) => s.trim().toLowerCase())
    .join('|')
}

const seen = new Set()
const clean = []

for (const entry of raw) {
  const partial = {
    companyName: (entry.companyName ?? '').trim(),
    address: (entry.address ?? '').trim(),
    city: (entry.city ?? '').trim(),
    state: (entry.state ?? '').trim() || 'MA',
    sector: entry.industry ?? entry.sector ?? sector,
    sourceUrl: entry.sourceUrl ?? sourceUrl,
  }

  if (!partial.companyName || !partial.city) continue

  const key = dedupeKey(partial)
  if (seen.has(key)) continue
  seen.add(key)
  clean.push(partial)
}

const out = join(__dirname, '..', outputPath)
writeFileSync(out, `${JSON.stringify(clean, null, 2)}\n`)
console.log(`Raw: ${raw.length}, Clean: ${clean.length}, Removed: ${raw.length - clean.length}`)
console.log(`Wrote ${out}`)
