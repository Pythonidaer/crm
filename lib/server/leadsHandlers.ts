import { countLeads, getLeadById, getLeads, updateLeadEditableFields } from '../db/leadQueries'
import { parseLeadPatchBody } from '../db/leadPatchValidation'

export interface ApiResult {
  status: number
  body: unknown
}

function ok(body: unknown, status = 200): ApiResult {
  return { status, body }
}

function fail(status: number, error: string): ApiResult {
  return { status, body: { error } }
}

function handleError(err: unknown): ApiResult {
  console.error('[api]', err)
  const message = err instanceof Error ? err.message : String(err)
  if (message.includes('DATABASE_URL')) {
    return fail(503, 'Database not configured')
  }
  return fail(500, 'Internal server error')
}

export async function handleHealthGet(): Promise<ApiResult> {
  try {
    const total = await countLeads()
    return ok({ ok: true, leads: total })
  } catch (err) {
    return handleError(err)
  }
}

export async function handleLeadsGet(): Promise<ApiResult> {
  try {
    return ok(await getLeads())
  } catch (err) {
    return handleError(err)
  }
}

export async function handleLeadGet(id: string): Promise<ApiResult> {
  try {
    const lead = await getLeadById(id)
    if (!lead) return fail(404, 'Lead not found')
    return ok(lead)
  } catch (err) {
    return handleError(err)
  }
}

export async function handleLeadPatch(id: string, body: unknown): Promise<ApiResult> {
  try {
    const { patch, errors } = parseLeadPatchBody(body)
    if (errors.length > 0) return fail(400, errors.join('; '))

    const lead = await updateLeadEditableFields(id, patch)
    if (!lead) return fail(404, 'Lead not found')
    return ok(lead)
  } catch (err) {
    return handleError(err)
  }
}
