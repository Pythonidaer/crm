import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeadFilters } from '../components/LeadFilters'
import { MOCK_LEADS } from '../utils/mockLeadData'
import type { LeadFilters as LeadFiltersType } from '../types/lead'

const meta = {
  title: 'CRM/LeadFilters',
  component: LeadFilters,
  tags: ['autodocs'],
} satisfies Meta<typeof LeadFilters>

export default meta
type Story = StoryObj<typeof meta>

function Interactive() {
  const [filters, setFilters] = useState<LeadFiltersType>({
    search: '', city: '', sector: '', selector: '', status: '', priority: '',
  })
  return (
    <div style={{ padding: '16px', background: 'var(--color-bg-subtle)' }}>
      <LeadFilters filters={filters} leads={MOCK_LEADS} onChange={setFilters} />
      <pre style={{ marginTop: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        {JSON.stringify(filters, null, 2)}
      </pre>
    </div>
  )
}

export const Default = {
  render: () => <Interactive />,
} satisfies Partial<Story>
