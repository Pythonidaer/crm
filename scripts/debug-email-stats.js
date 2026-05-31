import { readFileSync, existsSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MERGED_FILE = join(__dirname, '../src/utils/leads/salem-leads.enriched.json')

function emailStats(leads) {
  const withEmail = leads.filter((l) => l.email)
  const withEmailsFound = leads.filter((l) => Array.isArray(l.emailsFound) && l.emailsFound.length > 0)
  const withStatus = leads.filter((l) => l.emailEnrichmentStatus)
  return { withEmail, withEmailsFound, withStatus }
}

function main() {
  if (!existsSync(MERGED_FILE)) {
    console.error(`Missing ${MERGED_FILE} — run: node scripts/merge-enriched-leads.js`)
    process.exit(1)
  }

  const leads = JSON.parse(readFileSync(MERGED_FILE, 'utf8'))
  if (!Array.isArray(leads)) {
    console.error('Expected JSON array')
    process.exit(1)
  }

  const { withEmail, withEmailsFound, withStatus } = emailStats(leads)
  const barrio = leads.find((l) => l.companyName === 'Barrio Tacos')

  console.log('Email stats — salem-leads.enriched.json')
  console.log(`  total leads:              ${leads.length}`)
  console.log(`  with email:               ${withEmail.length}`)
  console.log(`  with emailsFound > 0:     ${withEmailsFound.length}`)
  console.log(`  with emailEnrichmentStatus: ${withStatus.length}`)
  console.log('\nFirst 5 leads with email:')
  for (const lead of withEmail.slice(0, 5)) {
    console.log(`  - ${lead.companyName}: ${lead.email} (${lead.emailEnrichmentStatus ?? 'no status'})`)
  }
  console.log('\nBarrio Tacos:')
  if (barrio) {
    console.log(`  email: ${barrio.email}`)
    console.log(`  emailsFound: ${JSON.stringify(barrio.emailsFound ?? [])}`)
    console.log(`  emailEnrichmentStatus: ${barrio.emailEnrichmentStatus}`)
  } else {
    console.log('  not found')
  }
}

main()
