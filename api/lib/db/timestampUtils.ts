/** Normalize API/DB timestamps to ISO strings for the frontend. */
export function toIsoOrEmpty(value: string | Date | null | undefined): string {
  if (value == null) return ''
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }
  const trimmed = String(value).trim()
  if (!trimmed) return ''
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

/** Normalize patch/insert timestamps; empty clears the column (null). */
export function toIsoOrNull(value: string | Date | null | undefined): string | null {
  const iso = toIsoOrEmpty(value)
  return iso || null
}

/** Validate a patch timestamp; returns ISO string, '' to clear, or undefined if invalid. */
export function parsePatchTimestamp(
  value: unknown,
  field: string,
  errors: string[],
): string | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return ''
  if (typeof value !== 'string') {
    errors.push(`${field} must be a string or null`)
    return undefined
  }
  const trimmed = value.trim()
  if (!trimmed) return ''
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    errors.push(`${field} must be a valid date`)
    return undefined
  }
  return parsed.toISOString()
}

export function isTimestampSyntaxError(message: string): boolean {
  return message.includes('invalid input syntax for type timestamp')
}
