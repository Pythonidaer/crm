import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { leads } from './schema'

function getDatabaseUrl(): string {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local for local scripts and API.')
  }
  return url
}

let client: ReturnType<typeof postgres> | null = null
let db: ReturnType<typeof drizzle<typeof import('./schema')>> | null = null

export function getDb() {
  if (!db) {
    client = postgres(getDatabaseUrl(), { max: 1 })
    db = drizzle(client, { schema: { leads } })
  }
  return db
}

export async function closeDb() {
  if (client) {
    await client.end()
    client = null
    db = null
  }
}
