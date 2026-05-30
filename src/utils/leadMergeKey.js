/**
 * Stable merge key shared by merge script and CRM sync.
 */
export function normalizeField(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function matchKey(record) {
  return [
    record.companyName,
    record.address,
    record.city,
    record.state,
    record.sector,
  ]
    .map(normalizeField)
    .join('|')
}
