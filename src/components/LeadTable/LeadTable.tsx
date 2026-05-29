import { Link } from 'react-router-dom'
import { Button } from '@pythonidaer/ui'
import { LinkButton } from '../LinkButton'
import { LeadStatusBadge } from '../LeadStatusBadge'
import type { Lead, LeadSortKey } from '../../types/lead'
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
  { key: 'companyName', label: 'Company Name' },
  { key: null, label: 'Address' },
  { key: 'city', label: 'City' },
  { key: null, label: 'State' },
  { key: 'sector', label: 'Sector' },
  { key: null, label: 'Selector' },
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
                  lead.companyName
                ) : (
                  <Link to={`${basePath}/${lead.id}`} className={styles.companyLink}>
                    {lead.companyName}
                  </Link>
                )}
              </td>
              <td className={`${styles.td} ${styles.muted}`}>{lead.address || '—'}</td>
              <td className={styles.td}>{lead.city}</td>
              <td className={styles.td}>{lead.state}</td>
              <td className={styles.td}>{lead.sector}</td>
              <td className={styles.td}>{lead.selector}</td>
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
                      aria-label={`Delete ${lead.companyName}`}
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
