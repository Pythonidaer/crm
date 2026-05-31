import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleLeadsGet } from '../lib/server/leadsHandlers'
import { methodNotAllowed, sendResult } from '../lib/server/apiUtils'

export const config = {
  maxDuration: 60,
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET'])
    return
  }

  sendResult(res, await handleLeadsGet())
}
