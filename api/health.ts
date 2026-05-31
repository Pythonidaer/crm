import type { VercelRequest, VercelResponse } from '@vercel/node'
import { sql } from 'drizzle-orm'
import { getDb } from '../src/db/client'
import { leads } from '../src/db/schema'
import { handleApiError, methodNotAllowed, sendJson } from '../src/server/apiUtils'

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET'])
    return
  }

  try {
    const db = getDb()
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(leads)
    sendJson(res, 200, { ok: true, leads: row?.count ?? 0 })
  } catch (err) {
    handleApiError(res, err)
  }
}
