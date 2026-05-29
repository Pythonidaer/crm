import type { LeadStatus } from '../../types/lead'
import styles from './LeadStatusBadge.module.css'

const STATUS_LABELS: Record<LeadStatus, string> = {
  not_contacted: 'Not Contacted',
  called: 'Called',
  interested: 'Interested',
  follow_up: 'Follow Up',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
}

interface LeadStatusBadgeProps {
  status: LeadStatus
  className?: string
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${styles[status]} ${className ?? ''}`}
      data-testid="lead-status-badge"
      data-status={status}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}
