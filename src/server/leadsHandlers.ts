import { sql } from 'drizzle-orm'
import { getDb } from '../db/client'
import { getLeadById, getLeads, updateLeadEditableFields } from '../db/leadQueries'
import { parseLeadPatchBody } from '../db/leadPatchValidation'
import { leads } from '../db/schema'
import { handleApiErrorResponse, jsonResponse } from './apiUtils'

export async function handleHealthGet(): Promise<Response> {
  try {
    const db = getDb()
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(leads)
    return jsonResponse(200, { ok: true, leads: row?.count ?? 0 })
  } catch (err) {
    return handleApiErrorResponse(err)
  }
}

export async function handleLeadsGet(): Promise<Response> {
  try {
    const data = await getLeads()
    return jsonResponse(200, data)
  } catch (err) {
    return handleApiErrorResponse(err)
  }
}

export async function handleLeadGet(id: string): Promise<Response> {
  try {
    const lead = await getLeadById(id)
    if (!lead) return jsonResponse(404, { error: 'Lead not found' })
    return jsonResponse(200, lead)
  } catch (err) {
    return handleApiErrorResponse(err)
  }
}

export async function handleLeadPatch(id: string, body: unknown): Promise<Response> {
  try {
    const { patch, errors } = parseLeadPatchBody(body)
    if (errors.length > 0) {
      return jsonResponse(400, { error: errors.join('; ') })
    }

    const lead = await updateLeadEditableFields(id, patch)
    if (!lead) return jsonResponse(404, { error: 'Lead not found' })
    return jsonResponse(200, lead)
  } catch (err) {
    return handleApiErrorResponse(err)
  }
}
