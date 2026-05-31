import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = {
  maxDuration: 60,
}

function leadIdFromRequest(req: VercelRequest): string {
  const raw = req.query['id']
  const value = Array.isArray(raw) ? raw[0] : raw
  return decodeURIComponent(value ?? '')
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  const id = leadIdFromRequest(req)
  if (!id) {
    res.status(400).json({ error: 'Lead id is required' })
    return
  }

  try {
    if (req.method === 'GET') {
      const { getLeadById } = await import('../lib/db/leadQueries')
      const lead = await getLeadById(id)
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      res.status(200).json(lead)
      return
    }

    if (req.method === 'PATCH') {
      const { updateLeadEditableFields } = await import('../lib/db/leadQueries')
      const { parseLeadPatchBody } = await import('../lib/db/leadPatchValidation')
      const { patch, errors } = parseLeadPatchBody(req.body)
      if (errors.length > 0) {
        res.status(400).json({ error: errors.join('; ') })
        return
      }

      const lead = await updateLeadEditableFields(id, patch)
      if (!lead) {
        res.status(404).json({ error: 'Lead not found' })
        return
      }
      res.status(200).json(lead)
      return
    }

    res.setHeader('Allow', 'GET, PATCH')
    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('[api/leads/[id]]', err)
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('DATABASE_URL')) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }
    res.status(500).json({ error: 'Internal server error', detail: message.slice(0, 200) })
  }
}
