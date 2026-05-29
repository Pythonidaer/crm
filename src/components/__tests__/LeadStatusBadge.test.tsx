import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LeadStatusBadge } from '../LeadStatusBadge'
import type { LeadStatus } from '../../types/lead'

const STATUS_LABELS: Record<LeadStatus, string> = {
  not_contacted: 'Not Contacted',
  called: 'Called',
  interested: 'Interested',
  follow_up: 'Follow Up',
  proposal_sent: 'Proposal Sent',
  won: 'Won',
  lost: 'Lost',
}

describe('LeadStatusBadge', () => {
  const statuses = Object.keys(STATUS_LABELS) as LeadStatus[]

  statuses.forEach((status) => {
    it(`renders correct label for status: ${status}`, () => {
      render(<LeadStatusBadge status={status} />)
      expect(screen.getByText(STATUS_LABELS[status])).toBeInTheDocument()
    })

    it(`applies data-status="${status}"`, () => {
      render(<LeadStatusBadge status={status} />)
      expect(screen.getByTestId('lead-status-badge')).toHaveAttribute('data-status', status)
    })
  })
})
