import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getLeadById, updateLeadEditableFields } from '../../src/db/leadQueries'
import { parseLeadPatchBody } from '../../src/db/leadPatchValidation'
import { handleApiError, methodNotAllowed, sendJson } from '../../src/server/apiUtils'

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
    sendJson(res, 400, { error: 'Lead id is required' })
    return
  }

  if (req.method === 'GET') {
    try {
      const lead = await getLeadById(id)
      if (!lead) {
        sendJson(res, 404, { error: 'Lead not found' })
        return
      }
      sendJson(res, 200, lead)
    } catch (err) {
      handleApiError(res, err)
    }
    return
  }

  if (req.method === 'PATCH') {
    try {
      const { patch, errors } = parseLeadPatchBody(req.body)
      if (errors.length > 0) {
        sendJson(res, 400, { error: errors.join('; ') })
        return
      }

      const lead = await updateLeadEditableFields(id, patch)
      if (!lead) {
        sendJson(res, 404, { error: 'Lead not found' })
        return
      }

      sendJson(res, 200, lead)
    } catch (err) {
      handleApiError(res, err)
    }
    return
  }

  methodNotAllowed(res, ['GET', 'PATCH'])
}
