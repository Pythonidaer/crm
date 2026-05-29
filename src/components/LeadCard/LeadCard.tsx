import { Link } from 'react-router-dom'
import { Card, Button } from '@pythonidaer/ui'
import { LinkButton } from '../LinkButton'
import { LeadStatusBadge } from '../LeadStatusBadge'
import type { Lead } from '../../types/lead'
import styles from './LeadCard.module.css'

interface LeadCardProps {
  lead: Lead
  basePath?: string
  readOnly?: boolean
  onDelete?: (id: string) => void
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function LeadCard({ lead, basePath = '/crm/leads', readOnly = false, onDelete }: LeadCardProps) {
  const priorityCls =
    lead.priority === 'high'
      ? styles.priorityHigh
      : lead.priority === 'medium'
        ? styles.priorityMedium
        : styles.priorityLow

  return (
    <Card variant="bordered" padding="md" hoverable data-testid="lead-card">
      <div className={styles.card}>
        <div className={styles.header}>
          {readOnly ? (
            <span className={styles.companyName}>{lead.companyName}</span>
          ) : (
            <Link to={`${basePath}/${lead.id}`} className={styles.companyName}>
              {lead.companyName}
            </Link>
          )}
          <div className={styles.badges}>
            <span className={`${styles.priorityBadge} ${priorityCls}`}>
              {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
            </span>
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>

        <div className={styles.meta}>
          <span>{lead.address || '—'}, {lead.city}, {lead.state}</span>
          {lead.sector && <span>{lead.sector}</span>}
          {lead.selector && <span>{lead.selector}</span>}
        </div>

        {lead.notes && (
          <p style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            {lead.notes}
          </p>
        )}

        <div className={styles.footer}>
          <span>
            {lead.nextFollowUpAt
              ? `Follow up: ${formatDate(lead.nextFollowUpAt)}`
              : 'No follow-up set'}
          </span>
          {!readOnly && (
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <LinkButton to={`${basePath}/${lead.id}`} variant="ghost" size="sm">
                View
              </LinkButton>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(lead.id)}
                  style={{ color: 'var(--color-error-600)' }}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
