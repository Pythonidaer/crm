import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  maxDuration: 60,
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { countLeads, getLeadsPage } = await import('../lib/db/leadQueries')
    const page = Number(Array.isArray(req.query.page) ? req.query.page[0] : req.query.page) || 1
    const pageSize =
      Number(Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize) || 500
    const total = await countLeads()
    const leads = await getLeadsPage(page, pageSize)
    const safeSize = Math.min(Math.max(pageSize, 1), 500)
    const hasMore = page * safeSize < total

    res.status(200).json({ leads, total, page, pageSize: safeSize, hasMore })
  } catch (err) {
    console.error('[api/leads]', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('DATABASE_URL')) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }
    res.status(500).json({ error: 'Internal server error', detail: message.slice(0, 200) })
  }
}
