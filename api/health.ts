import type { VercelRequest, VercelResponse } from '@vercel/node'
import { methodNotAllowed, sendJson } from '../src/server/apiUtils'

export default function handler(req: VercelRequest, res: VercelResponse): void {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    sendJson(res, 200, { ok: true })
    return
  }

  methodNotAllowed(res, ['GET'])
}
