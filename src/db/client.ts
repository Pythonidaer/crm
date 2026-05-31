import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { leads } from './schema'

function getDatabaseUrl(): string {
  const url = process.env['DATABASE_URL']
  if (!url) {
    throw new Error('DATABASE_URL is not set. Add it to .env.local for local scripts and API.')
  }
  return url
}

let db: ReturnType<typeof drizzle<typeof import('./schema')>> | null = null

export function getDb() {
  if (!db) {
    const sql = neon(getDatabaseUrl())
    db = drizzle(sql, { schema: { leads } })
  }
  return db
}

export async function closeDb() {
  db = null
}
