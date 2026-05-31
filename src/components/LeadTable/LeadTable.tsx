import { Link } from 'react-router-dom'
import { Button } from '@pythonidaer/ui'
import { LinkButton } from '../LinkButton'
import { LeadStatusBadge } from '../LeadStatusBadge'
import type { Lead, LeadSortKey } from '../../types/lead'
import { formatEnrichmentStatus, formatPhone } from '../../utils/leadFilters'
import styles from './LeadTable.module.css'

interface LeadTableProps {
  leads: Lead[]
  basePath?: string
  sortKey: LeadSortKey
  sortDir: 'asc' | 'desc'
  onSort: (key: LeadSortKey) => void
  onDelete?: (id: string) => void
  readOnly?: boolean
}

const COLUMNS: { key: LeadSortKey | null; label: string }[] = [
  { key: 'displayName', label: 'Company Name' },
  { key: null, label: 'Address' },
  { key: 'city', label: 'City' },
  { key: null, label: 'State' },
  { key: 'sector', label: 'Sector' },
  { key: null, label: 'Phone' },
  { key: null, label: 'Website' },
  { key: null, label: 'Email' },
  { key: null, label: 'Match Confidence' },
  { key: 'leadFitScore', label: 'Lead Fit' },
  { key: null, label: 'Places Status' },
  { key: 'status', label: 'Status' },
  { key: null, label: 'Priority' },
  { key: 'nextFollowUpAt', label: 'Next Follow Up' },
  { key: 'lastContactedAt', label: 'Last Contacted' },
  { key: null, label: 'Actions' },
]

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
}

function PriorityLabel({ priority }: { priority: Lead['priority'] }) {
  const cls =
    priority === 'high'
      ? styles.priorityHigh
      : priority === 'medium'
        ? styles.priorityMedium
        : styles.priorityLow
  return (
    <span className={cls}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  )
}

function MatchConfidenceLabel({
  confidence,
  score,
}: {
  confidence: Lead['matchConfidence']
  score: Lead['matchScore']
}) {
  if (!confidence) return <span className={styles.muted}>—</span>
  const cls =
    confidence === 'high'
      ? styles.matchHigh
      : confidence === 'medium'
        ? styles.matchMedium
        : styles.matchLow
  const label = confidence.charAt(0).toUpperCase() + confidence.slice(1)
  return (
    <span className={cls}>
      {label}
      {typeof score === 'number' ? ` (${score})` : ''}
    </span>
  )
}

function EnrichmentStatusLabel({ status }: { status: Lead['enrichmentStatus'] }) {
  const value = formatEnrichmentStatus(status)
  const cls =
    value === 'matched'
      ? styles.enrichmentMatched
      : value === 'review_needed'
        ? styles.enrichmentReview
        : value === 'not_found' || value === 'error'
          ? styles.enrichmentMissing
          : styles.enrichmentPending
  return <span className={cls}>{value.replace(/_/g, ' ')}</span>
}

function LeadFitLabel({ lead }: { lead: Lead }) {
  const tier = lead.leadFitTier ?? 'weak'
  const score = lead.leadFitScore ?? 0
  const cls =
    tier === 'strong'
      ? styles.fitStrong
      : tier === 'medium'
        ? styles.fitMedium
        : tier === 'disqualified'
          ? styles.fitDisqualified
          : styles.fitWeak
  return (
    <span className={cls} title={lead.disqualificationReason ?? undefined}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)} ({score})
    </span>
  )
}

function EmailCell({ lead }: { lead: Lead }) {
  const primary = lead.email ?? lead.emailsFound?.[0] ?? null
  if (!primary) return <span className={styles.muted}>—</span>

  const extraCount =
    (lead.emailsFound?.length ?? 0) > 1 ? lead.emailsFound!.length - 1 : 0

  return (
    <span className={styles.emailCell}>
      <a href={`mailto:${primary}`} className={styles.emailLink}>
        {primary}
      </a>
      {extraCount > 0 && (
        <span className={styles.emailMore} title={lead.emailsFound!.join(', ')}>
          +{extraCount}
        </span>
      )}
    </span>
  )
}

export function LeadTable({
  leads,
  basePath = '/crm/leads',
  sortKey,
  sortDir,
  onSort,
  onDelete,
  readOnly = false,
}: LeadTableProps) {
  function SortIcon({ col }: { col: LeadSortKey | null }) {
    if (!col) return null
    const active = col === sortKey
    const icon = active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ↕'
    return (
      <span className={`${styles.sortIcon} ${active ? styles.sortIconActive : ''}`}>
        {icon}
      </span>
    )
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table} aria-label="Leads table">
        <thead className={styles.thead}>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.label}
                className={`${styles.th} ${col.key ? styles.thSortable : ''}`}
                onClick={col.key ? () => onSort(col.key!) : undefined}
                aria-sort={
                  col.key === sortKey
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
                scope="col"
              >
                {col.label}
                <SortIcon col={col.key} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className={styles.tr}>
              <td className={`${styles.td} ${styles.companyName}`}>
                {readOnly ? (
                  lead.displayName
                ) : (
                  <Link to={`${basePath}/${lead.id}`} className={styles.companyLink}>
                    {lead.displayName}
                  </Link>
                )}
              </td>
              <td className={`${styles.td} ${styles.muted}`}>{lead.address || '—'}</td>
              <td className={styles.td}>{lead.city}</td>
              <td className={styles.td}>{lead.state}</td>
              <td className={styles.td}>{lead.sector}</td>
              <td className={styles.td}>{formatPhone(lead)}</td>
              <td className={`${styles.td} ${styles.muted}`}>
                {lead.website ? (
                  <a href={lead.website} target="_blank" rel="noreferrer noopener">
                    Website
                  </a>
                ) : (
                  '—'
                )}
              </td>
              <td className={styles.td}>
                <EmailCell lead={lead} />
              </td>
              <td className={styles.td}>
                <MatchConfidenceLabel
                  confidence={lead.matchConfidence}
                  score={lead.matchScore}
                />
              </td>
              <td className={styles.td}>
                <LeadFitLabel lead={lead} />
              </td>
              <td className={styles.td}>
                <EnrichmentStatusLabel status={lead.enrichmentStatus} />
              </td>
              <td className={styles.td}>
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className={styles.td}>
                <PriorityLabel priority={lead.priority} />
              </td>
              <td className={`${styles.td} ${styles.muted}`}>
                {formatDate(lead.nextFollowUpAt)}
              </td>
              <td className={`${styles.td} ${styles.muted}`}>
                {formatDate(lead.lastContactedAt)}
              </td>
              <td className={styles.td}>
                <div className={styles.actions}>
                  {!readOnly && (
                    <LinkButton to={`${basePath}/${lead.id}`} variant="ghost" size="sm">
                      View
                    </LinkButton>
                  )}
                  {!readOnly && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(lead.id)}
                      aria-label={`Delete ${lead.displayName}`}
                      style={{ color: 'var(--color-error-600)' }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
