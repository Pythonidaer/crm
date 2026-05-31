import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleHealthGet } from '../src/server/leadsHandlers'
import { methodNotAllowed, sendWebResponse } from '../src/server/apiUtils'

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

  await sendWebResponse(res, await handleHealthGet())
}
