/** Value for `<input type="date">` from an ISO or DB timestamp string. */
export function toDateInputValue(iso: string | Date | null | undefined): string {
  if (iso == null || iso === '') return ''
  const parsed = iso instanceof Date ? iso : new Date(String(iso))
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

/** Parse `<input type="date">` value to ISO (noon UTC avoids timezone day shifts). */
export function fromDateInputValue(value: string): string {
  if (!value) return ''
  const parsed = new Date(`${value}T12:00:00.000Z`)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString()
}
