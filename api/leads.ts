import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLeads } from '../src/db/leadQueries'
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
    const leads = await getLeads()
    sendJson(res, 200, leads)
  } catch (err) {
    handleApiError(res, err)
  }
}
