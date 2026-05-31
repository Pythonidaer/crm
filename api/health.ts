import type { VercelRequest, VercelResponse } from '@vercel/node'
import { neon } from '@neondatabase/serverless'

export const config = {
  maxDuration: 60,
}

export default async function handler(_req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const url = process.env['DATABASE_URL']
    if (!url) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const sql = neon(url)
    const rows = await sql.query('SELECT count(*)::int AS count FROM leads')
    const count = Number((rows as { count: number }[])[0]?.count ?? 0)
    res.status(200).json({ ok: true, leads: count })
  } catch (err) {
    console.error('[api/health]', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
