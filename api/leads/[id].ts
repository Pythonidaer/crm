import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, sendResult } from '../lib/server/apiUtils'
import { handleLeadGet, handleLeadPatch } from '../lib/server/leadsHandlers'

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

  if (req.method === 'GET') {
    sendResult(res, await handleLeadGet(id))
    return
  }

  if (req.method === 'PATCH') {
    sendResult(res, await handleLeadPatch(id, req.body))
    return
  }

  methodNotAllowed(res, ['GET', 'PATCH'])
}
