import { asc, eq } from 'drizzle-orm'
import { getDb } from './client'
import { patchInputToRow, rowToLead, type LeadPatchInput } from './leadMapper'
import { leads } from './schema'
import type { Lead } from '../../src/types/lead'

export async function getLeads(): Promise<Lead[]> {
  const db = getDb()
  const rows = await db
    .select()
    .from(leads)
    .orderBy(asc(leads.displayName), asc(leads.companyName))
  return rows.map(rowToLead)
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const db = getDb()
  const [row] = await db.select().from(leads).where(eq(leads.id, id)).limit(1)
  return row ? rowToLead(row) : null
}

export async function updateLeadEditableFields(
  id: string,
  patch: LeadPatchInput,
): Promise<Lead | null> {
  const db = getDb()
  const [existing] = await db.select().from(leads).where(eq(leads.id, id)).limit(1)
  if (!existing) return null

  const rowPatch = patchInputToRow(patch)
  const [updated] = await db.update(leads).set(rowPatch).where(eq(leads.id, id)).returning()
  return rowToLead(updated)
}
